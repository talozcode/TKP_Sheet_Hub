import "server-only";
import { google, sheets_v4 } from "googleapis";
import {
  ResourceItem,
  ResourceSource,
  ResourceStatus,
  ResourceType,
  RESOURCE_TYPES,
  SheetItem,
  SheetStatus,
} from "./types";
import {
  booleanToCell,
  categoriesToCell,
  parseBoolean,
  parseCategories,
  toStringCell,
} from "./normalize";
import { generateId } from "./utils";

const TAB = {
  sheets: process.env.SHEETS_TAB_NAME || "sheets",
  resources: process.env.RESOURCES_TAB_NAME || "resources",
  archivedSheets: process.env.ARCHIVED_SHEETS_TAB_NAME || "archived_sheets",
  archivedResources:
    process.env.ARCHIVED_RESOURCES_TAB_NAME || "archived_resources",
} as const;

const SHEET_HEADERS = [
  "id",
  "name",
  "sheet_url",
  "categories",
  "web_app_url",
  "description",
  "status",
  "favorite",
  "notes",
] as const;

const RESOURCE_HEADERS = [
  "id",
  "title",
  "url",
  "categories",
  "resource_type",
  "source",
  "related_sheet_id",
  "description",
  "favorite",
  "status",
  "notes",
] as const;

const SHEET_RANGE = `A1:${columnLetter(SHEET_HEADERS.length)}`;
const RESOURCE_RANGE = `A1:${columnLetter(RESOURCE_HEADERS.length)}`;

let cachedClient: sheets_v4.Sheets | null = null;
let cachedSpreadsheetId: string | null = null;
let cachedSheetIds: Map<string, number> | null = null;

function columnLetter(index: number): string {
  // 1-indexed: 1 -> A, 26 -> Z, 27 -> AA
  let n = index;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!id) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID env variable is missing");
  }
  return id;
}

async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  if (cachedClient) return cachedClient;

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKeyRaw) {
    throw new Error(
      "Google service account credentials are missing (GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY)",
    );
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
}

async function getSheetIdMap(): Promise<Map<string, number>> {
  const spreadsheetId = getSpreadsheetId();
  if (cachedSheetIds && cachedSpreadsheetId === spreadsheetId) {
    return cachedSheetIds;
  }
  const sheets = await getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const map = new Map<string, number>();
  for (const s of meta.data.sheets ?? []) {
    const title = s.properties?.title;
    const id = s.properties?.sheetId;
    if (title && typeof id === "number") {
      map.set(title, id);
    }
  }
  for (const required of [
    TAB.sheets,
    TAB.resources,
    TAB.archivedSheets,
    TAB.archivedResources,
  ]) {
    if (!map.has(required)) {
      throw new Error(
        `Sheet tab "${required}" was not found in the spreadsheet. Verify the tab names.`,
      );
    }
  }
  cachedSheetIds = map;
  cachedSpreadsheetId = spreadsheetId;
  return map;
}

async function readRange(tabName: string, range: string): Promise<string[][]> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${tabName}!${range}`,
    majorDimension: "ROWS",
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  return (res.data.values as string[][]) ?? [];
}

function isBlankRow(row: string[]): boolean {
  if (!row || row.length === 0) return true;
  return row.every((cell) => cell === undefined || cell === null || String(cell).trim() === "");
}

function rowToSheet(row: string[]): SheetItem {
  const get = (i: number) => toStringCell(row[i]);
  const status = (get(6) || "active").toLowerCase() as SheetStatus;
  return {
    id: get(0),
    name: get(1),
    sheet_url: get(2),
    categories: parseCategories(get(3)),
    web_app_url: get(4),
    description: get(5),
    status: ["active", "draft", "archived"].includes(status) ? status : "active",
    favorite: parseBoolean(row[7]),
    notes: get(8),
  };
}

function sheetToRow(s: SheetItem): string[] {
  return [
    s.id,
    s.name,
    s.sheet_url,
    categoriesToCell(s.categories),
    s.web_app_url || "",
    s.description || "",
    s.status,
    booleanToCell(s.favorite),
    s.notes || "",
  ];
}

function rowToResource(row: string[]): ResourceItem {
  const get = (i: number) => toStringCell(row[i]);
  const rt = (get(4) || "").toLowerCase();
  const src = (get(5) || "").toLowerCase();
  const status = (get(9) || "active").toLowerCase() as ResourceStatus;
  return {
    id: get(0),
    title: get(1),
    url: get(2),
    categories: parseCategories(get(3)),
    resource_type: (RESOURCE_TYPES as readonly string[]).includes(rt)
      ? (rt as ResourceType)
      : "",
    source: src === "internal" || src === "external" ? (src as ResourceSource) : "",
    related_sheet_id: get(6),
    description: get(7),
    favorite: parseBoolean(row[8]),
    status: status === "archived" ? "archived" : "active",
    notes: get(10),
  };
}

function resourceToRow(r: ResourceItem): string[] {
  return [
    r.id,
    r.title,
    r.url,
    categoriesToCell(r.categories),
    r.resource_type || "",
    r.source || "",
    r.related_sheet_id || "",
    r.description || "",
    booleanToCell(r.favorite),
    r.status,
    r.notes || "",
  ];
}

async function readAllRows<T>(
  tabName: string,
  range: string,
  rowMapper: (row: string[]) => T,
): Promise<T[]> {
  const rows = await readRange(tabName, range);
  if (rows.length <= 1) return [];
  const dataRows = rows.slice(1);
  const out: T[] = [];
  for (const row of dataRows) {
    if (isBlankRow(row)) continue;
    if (!row[0] || String(row[0]).trim() === "") continue;
    out.push(rowMapper(row));
  }
  return out;
}

/**
 * Find the 1-indexed sheet row number (the actual row in the spreadsheet,
 * row 1 being the header) for the given id.
 */
async function findRowNumberById(
  tabName: string,
  id: string,
): Promise<number | null> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${tabName}!A:A`,
    majorDimension: "COLUMNS",
  });
  const col = (res.data.values?.[0] as string[]) ?? [];
  for (let i = 1; i < col.length; i++) {
    if (col[i] === id) return i + 1;
  }
  return null;
}

// ============================================================
// Public API
// ============================================================

export async function listSheets(): Promise<SheetItem[]> {
  return readAllRows(TAB.sheets, SHEET_RANGE, rowToSheet);
}

export async function listArchivedSheets(): Promise<SheetItem[]> {
  return readAllRows(TAB.archivedSheets, SHEET_RANGE, rowToSheet);
}

export async function listResources(): Promise<ResourceItem[]> {
  return readAllRows(TAB.resources, RESOURCE_RANGE, rowToResource);
}

export async function listArchivedResources(): Promise<ResourceItem[]> {
  return readAllRows(TAB.archivedResources, RESOURCE_RANGE, rowToResource);
}

export async function listAllCategories(): Promise<string[]> {
  const [s, r, as, ar] = await Promise.all([
    listSheets(),
    listResources(),
    listArchivedSheets(),
    listArchivedResources(),
  ]);
  const set = new Set<string>();
  for (const item of [...s, ...r, ...as, ...ar]) {
    for (const c of item.categories) set.add(c);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export async function createSheet(input: Omit<SheetItem, "id"> & { id?: string }): Promise<SheetItem> {
  const item: SheetItem = {
    ...input,
    id: input.id?.trim() || generateId("sht"),
  };
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${TAB.sheets}!${SHEET_RANGE}`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [sheetToRow(item)] },
  });
  return item;
}

export async function updateSheet(
  id: string,
  patch: Partial<Omit<SheetItem, "id">>,
): Promise<SheetItem> {
  const rowNum = await findRowNumberById(TAB.sheets, id);
  if (!rowNum) throw new Error(`Sheet "${id}" not found in active sheets tab`);

  const existing = (await listSheets()).find((s) => s.id === id);
  if (!existing) throw new Error(`Sheet "${id}" not found`);

  const merged: SheetItem = { ...existing, ...patch, id };
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `${TAB.sheets}!A${rowNum}:${columnLetter(SHEET_HEADERS.length)}${rowNum}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [sheetToRow(merged)] },
  });
  return merged;
}

export async function createResource(
  input: Omit<ResourceItem, "id"> & { id?: string },
): Promise<ResourceItem> {
  const item: ResourceItem = {
    ...input,
    id: input.id?.trim() || generateId("res"),
  };
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${TAB.resources}!${RESOURCE_RANGE}`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [resourceToRow(item)] },
  });
  return item;
}

export async function updateResource(
  id: string,
  patch: Partial<Omit<ResourceItem, "id">>,
): Promise<ResourceItem> {
  const rowNum = await findRowNumberById(TAB.resources, id);
  if (!rowNum) throw new Error(`Resource "${id}" not found in active resources tab`);

  const existing = (await listResources()).find((r) => r.id === id);
  if (!existing) throw new Error(`Resource "${id}" not found`);

  const merged: ResourceItem = { ...existing, ...patch, id };
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `${TAB.resources}!A${rowNum}:${columnLetter(RESOURCE_HEADERS.length)}${rowNum}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [resourceToRow(merged)] },
  });
  return merged;
}

async function deleteRow(tabName: string, rowNumber: number): Promise<void> {
  const sheetIdMap = await getSheetIdMap();
  const sheetId = sheetIdMap.get(tabName);
  if (sheetId === undefined) throw new Error(`Tab "${tabName}" not found`);
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });
}

async function appendRaw(tabName: string, range: string, values: string[]): Promise<void> {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${tabName}!${range}`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
}

export async function archiveSheet(id: string): Promise<void> {
  const rowNum = await findRowNumberById(TAB.sheets, id);
  if (!rowNum) throw new Error(`Sheet "${id}" not found in active sheets tab`);
  const existing = (await listSheets()).find((s) => s.id === id);
  if (!existing) throw new Error(`Sheet "${id}" not found`);
  const archived: SheetItem = { ...existing, status: "archived" };
  await appendRaw(TAB.archivedSheets, SHEET_RANGE, sheetToRow(archived));
  await deleteRow(TAB.sheets, rowNum);
}

export async function restoreSheet(id: string): Promise<void> {
  const rowNum = await findRowNumberById(TAB.archivedSheets, id);
  if (!rowNum) throw new Error(`Sheet "${id}" not found in archived sheets tab`);
  const existing = (await listArchivedSheets()).find((s) => s.id === id);
  if (!existing) throw new Error(`Sheet "${id}" not found`);
  const restored: SheetItem = { ...existing, status: "active" };
  await appendRaw(TAB.sheets, SHEET_RANGE, sheetToRow(restored));
  await deleteRow(TAB.archivedSheets, rowNum);
}

export async function archiveResource(id: string): Promise<void> {
  const rowNum = await findRowNumberById(TAB.resources, id);
  if (!rowNum) throw new Error(`Resource "${id}" not found in active resources tab`);
  const existing = (await listResources()).find((r) => r.id === id);
  if (!existing) throw new Error(`Resource "${id}" not found`);
  const archived: ResourceItem = { ...existing, status: "archived" };
  await appendRaw(TAB.archivedResources, RESOURCE_RANGE, resourceToRow(archived));
  await deleteRow(TAB.resources, rowNum);
}

export async function restoreResource(id: string): Promise<void> {
  const rowNum = await findRowNumberById(TAB.archivedResources, id);
  if (!rowNum) throw new Error(`Resource "${id}" not found in archived resources tab`);
  const existing = (await listArchivedResources()).find((r) => r.id === id);
  if (!existing) throw new Error(`Resource "${id}" not found`);
  const restored: ResourceItem = { ...existing, status: "active" };
  await appendRaw(TAB.resources, RESOURCE_RANGE, resourceToRow(restored));
  await deleteRow(TAB.archivedResources, rowNum);
}

export const __internal = { columnLetter };

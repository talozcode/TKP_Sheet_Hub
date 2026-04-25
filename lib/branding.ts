export const BRAND = {
  name: "TKP Sheet Hub",
  tagline: "The control center for your sheets and resources.",
  logoUrl:
    process.env.NEXT_PUBLIC_LOGO_URL ||
    "https://res.cloudinary.com/dakhwegyt/image/upload/v1777131721/ChatGPT_Image_Apr_25_2026_10_34_25_PM-Photoroom_byvvke.png",
  masterSheetUrl:
    process.env.NEXT_PUBLIC_ORIGINAL_SHEET_URL ||
    "https://docs.google.com/spreadsheets/d/1pWevS9X6IbZo9UYbXD9laq933cznhT0kLoPbXQ16nOo/edit?gid=949871865#gid=949871865",
} as const;

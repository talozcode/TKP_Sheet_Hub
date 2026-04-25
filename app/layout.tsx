import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/header";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TKP Sheet Hub",
  description:
    "Search, edit, and manage your Google Sheets and resources in one elegant hub.",
  icons: {
    icon: [
      {
        url: "https://res.cloudinary.com/dakhwegyt/image/upload/v1777131721/ChatGPT_Image_Apr_25_2026_10_34_25_PM-Photoroom_byvvke.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-background`}>
        <Providers>
          <Header />
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

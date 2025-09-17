import IframeResizer from "@/components/IframeResizer";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Karlsfors Julbordsbokning - Powered by Appstract",
  description: "Karlsfors Julbordsbokning - Powered by Appstract",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <IframeResizer>{children}</IframeResizer>
      </body>
    </html>
  );
}

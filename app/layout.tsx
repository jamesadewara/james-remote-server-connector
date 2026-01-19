import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>James Remote Server Connector</title>
        <meta name="description" content="James Remote Server Connector" />
        <meta name="author" content="James" />
        <meta property="og:title" content="James Remote Server Connector" />
        <meta property="og:description" content="James Remote Server Connector" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="favicon.ico" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="" />
        <meta name="twitter:image" content="favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Toaster />
          <Sonner />
          {children}
        </Providers>
      </body>
    </html>
  );
}

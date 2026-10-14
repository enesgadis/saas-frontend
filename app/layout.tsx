import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniResolve - AI Agent Dashboard",
  description: "AI-Native Support Ticketing Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased min-h-screen bg-gray-950 text-gray-100">
        {children}
      </body>
    </html>
  );
}

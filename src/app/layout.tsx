import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hexa Platform",
  description: "Order management and item matching platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased [--font-display:Georgia] [--font-geist-mono:Menlo] [--font-geist-sans:Arial]"
      >
        {children}
      </body>
    </html>
  );
}

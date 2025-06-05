import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FirstAid AI",
  description: "A chatbot for first aid",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

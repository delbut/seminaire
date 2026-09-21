import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Olympiades Séminaire",
  description: "Classement et scores des olympiades",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

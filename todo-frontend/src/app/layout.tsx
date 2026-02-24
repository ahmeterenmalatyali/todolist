import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast"; // Pop-up kütüphanesi

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Modern To-Do App",
  description: "Full-stack .NET & Next.js Project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
        {/* Bildirimlerin sağ üstte görünmesini sağlıyoruz */}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
import "@/app/globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import { Zen_Kurenaido } from "next/font/google";

export const metadata: Metadata = {
  title: "セッションアプリ",
  description: "セッションに関わるあらゆることがこのアプリ一つでで",
};

const zenKurenaido = Zen_Kurenaido({ subsets: ["latin"], weight: "400" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={zenKurenaido.className}>
      <head></head>
      <body className="min-h-screen bg-white text-black">
        <Header />
        <div className="pt-24">
          <main>{children}</main>
          <Toaster position="top-center" />
        </div>
      </body>
    </html>
  );
}

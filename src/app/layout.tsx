import "@/app/globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "セッションアプリ",
  description: "セッションに関わるあらゆることがこのアプリ一つでで",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Kurenaido&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-black">
        <Header />
        <main>{children}</main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

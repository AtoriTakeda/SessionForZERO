import "@/app/globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import { Zen_Kurenaido, Pacifico } from "next/font/google";
import { checkAuthenticatedUser } from "@/lib/supabase/checkUserInfo";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "セッションアプリ",
  description: "セッションに関わるあらゆることがこのアプリ一つで",
};

export const zenKurenaido = Zen_Kurenaido({
  subsets: ["latin"],
  weight: "400",
});
export const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await checkAuthenticatedUser();
  if (!user) {
    redirect("/redirect");
  }

  return (
    <html lang="ja" className={zenKurenaido.className}>
      <head></head>
      <body className="min-h-screen bg-white text-black">
        <Header userId={user.id} />
        <div className="pt-24">
          <main>{children}</main>
          <Toaster position="top-center" />
        </div>
      </body>
    </html>
  );
}

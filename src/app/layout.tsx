import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <header style={{ backgroundColor: "#f0f0f0", padding: "1rem" }}>
          <nav style={{ display: "flex", gap: "1rem" }}>
            <Link href="/">トップページ</Link>
            <Link href="/songList">エントリーシート</Link>
            <Link href="/member">参加者一覧</Link>
            <Link href={`/myPage/1`}>マイページ</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

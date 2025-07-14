"use client";

import Link from "next/link";
import { useUser } from "@/lib/supabase/useUser";
import Image from "next/image";
import { AvatarMenu } from "@/components/AvatarMenu";

export default function Header() {
  const { user } = useUser();

  return (
    <header className="w-full bg-black text-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-end space-x-6">
        {/* 左側：ロゴ */}
        <Link href="/" className="flex flex-col leading-none mr-2">
          <span className="text-4xl font-bold font-logo text-white">零</span>
        </Link>

        {/* 中央：メニュー */}
        <nav className="flex items-end space-x-6 text-white">
          <Link href="/songList" className="text-center hover:text-gray-300">
            <div className="text-sm font-semibold">エントリーシート</div>
            <div className="text-xs text-gray-400 -mt-1">EntrySheet</div>
          </Link>
          <Link href="/member" className="text-center hover:text-gray-300">
            <div className="text-sm font-semibold">参加者一覧</div>
            <div className="text-xs text-gray-400 -mt-1">Member</div>
          </Link>
        </nav>
      </div>

      {/* 右側：ログインユーザーのアイコン */}
      <AvatarMenu />
    </header>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/browser";

export default function AdminHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 w-full bg-cyan-900 text-white px-6 py-4 flex items-center justify-between">
      <button className="z-50" onClick={() => setIsOpen(!isOpen)}>
        <Menu size={28} />
      </button>
      <div className="absolute left-1/2 transform -translate-x-1/2 text-4xl font-bold font-logo text-white">
        零
      </div>
      <div
        className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-cyan-900 text-white shadow-lg z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col items-start p-4 h-full">
          <div className="flex flex-col space-y-2">
            <Link
              href="/admin"
              className="text-center hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              <div className="text-sm font-semibold">トップページ</div>
              <div className="text-xs text-gray-400 -mt-1">TopPage</div>
            </Link>
            <Link
              href="/admin/editTimetable"
              className="text-center hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              <div className="text-sm font-semibold">タイムテーブル編集</div>
              <div className="text-xs text-gray-400 -mt-1">Edit Timetable</div>
            </Link>
            <Link
              href="/admin/approve"
              className="text-center hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              <div className="text-sm font-semibold">支払い承認</div>
              <div className="text-xs text-gray-400 -mt-1">
                Approve Paid Users
              </div>
            </Link>
            <Link
              href="/admin/calc"
              className="text-center hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              <div className="text-sm font-semibold">料金計算</div>
              <div className="text-xs text-gray-400 -mt-1">Payment Calc</div>
            </Link>
          </div>
          <div className="flex flex-col mt-auto w-full mb-20">
            <Link
              href="/"
              className="text-center hover:text:gray-300"
              onClick={() => setIsOpen(false)}
            >
              <div className="text-sm font-semibold">ユーザーページに戻る</div>
              <div className="text-xs text-gray-400 -mt-1">
                Back to UserPage
              </div>
            </Link>
            <button
              onClick={async () => {
                await supabaseClient.auth.signOut();
                router.push("/login");
                setIsOpen(false);
              }}
              className="flex items-center justify-start w-full px-4 py-2"
            >
              <div className="text-center hover:text:gray-300">
                <div className="text-sm font-semibold">ログアウト</div>
                <p></p>
                <div className="text-xs text-gray-300 -mt-1">LogOut</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-cyan-900 bg-opacity-30 z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </header>
  );
}

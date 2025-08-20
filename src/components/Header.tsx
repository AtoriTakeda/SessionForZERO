"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { AvatarMenu } from "@/components/AvatarMenu";
import { supabaseClient } from "@/lib/supabase/browser";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Payment = {
  id: string;
  amount: number;
  status: string;
  payment_url: string;
};

export default function Header({ userId }: { userId: string | undefined }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const checkTimetable = async () => {
      const { count } = await supabaseClient
        .from("timetable")
        .select("song_id", { count: "exact", head: true })
        .not("song_id", "is", null);
      if (count && count !== 0) {
        setIsScheduled(true);
      }
    };

    const checkAdminUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (user) {
        const { data } = await supabaseClient
          .from("profile")
          .select("role")
          .eq("id", user?.id)
          .single();

        if (data?.role) {
          if (data.role == "admin") setIsAdmin(true);
        }
      }
    };

    const getPayment = async () => {
      if (userId) {
        const { data, error } = await supabaseClient
          .from("payment")
          .select("*")
          .eq("id", userId)
          .single();
        if (error) {
          console.error("支払い情報の取得に失敗しました");
        }
        if (data !== null) {
          setPayment(data);
        }
      }
    };

    checkTimetable();
    checkAdminUser();
    getPayment();
  }, []);

  const paySessionFee = async () => {
    if (userId && payment?.payment_url) {
      window.open(payment.payment_url, "_blank");
      await supabaseClient
        .from("payment")
        .update({
          status: "awaiting",
        })
        .eq("id", userId);
      window.location.reload();
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-black text-white px-6 py-4 flex items-center justify-between">
      <button className="z-50" onClick={() => setIsOpen(!isOpen)}>
        <Menu size={28} />
      </button>
      <div className="absolute left-1/2 transform -translate-x-1/2 text-4xl font-handwriting text-white">
        零
      </div>

      <div
        className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-black text-white shadow-lg z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col items-start p-4 h-full">
          <div className="flex flex-col space-y-2">
            <Link
              href="/"
              className=" text-center hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              <div className="text-sm font-semibold">トップページ</div>
              <div className="text-xs text-gray-400 -mt-1">TopPage</div>
            </Link>
            <Link
              href="/songList"
              className="text-center hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              <div className="text-sm font-semibold">エントリーシート</div>
              <div className="text-xs text-gray-400 -mt-1">EntrySheet</div>
            </Link>
            <Link
              href="/member"
              className="text-center hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              <div className="text-sm font-semibold">参加者一覧</div>
              <div className="text-xs text-gray-400 -mt-1">Member</div>
            </Link>
            {isScheduled && (
              <Link
                href="/timetable"
                className="text-center hover:text-gray-300"
                onClick={() => setIsOpen(false)}
              >
                <div className="text-sm font-semibold">タイムテーブル</div>
                <div className="text-xs text-gray-400 -mt-1">Timetable</div>
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-center hover:text:gray-300"
                onClick={() => setIsOpen(false)}
              >
                <div className="text-blue-500 text-sm font-semibold">
                  管理者ページ
                </div>
                <div className="text-xs text-blue-300 -mt-1">Administrator</div>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {payment && (
          <PaymentStatus
            status={payment.status}
            onPayClick={() => setDialogOpen(true)}
          />
        )}
        {/* 右側：ログインユーザーのアイコン */}
        <AvatarMenu />
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <div className="flex justify-center">
            <DialogTitle>請求額:{payment?.amount}円</DialogTitle>
          </div>
          <p className="text-sm text-gray-600">
            下のボタンを押すとPayPayのリンクへ飛びます。
            そちらから払っていただくか、現金で上記の金額を払うようにしてください。
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button className="bg-red-500" onClick={paySessionFee}>
              PayPayで支払う
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </header>
  );
}

function PaymentStatus({
  status,
  onPayClick,
}: {
  status: string;
  onPayClick: () => void;
}) {
  if (status === "unpaid") {
    return (
      <Button
        className="text-xs bg-red-500 hover:bg-red-600"
        onClick={onPayClick}
      >
        スタジオ代請求中
      </Button>
    );
  }
  if (status === "awaiting") {
    return (
      <div className="inline-block px-4 py-2 bg-green-500 text-white text-xs font-medium rounded hover">
        承認中
      </div>
    );
  }
  if (status === "approved") {
    return (
      <div className="inline-block px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded hover">
        支払い済み
      </div>
    );
  }
  return <p></p>;
}

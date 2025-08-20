"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/browser";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Payment = {
  id: string;
  amount: number;
  status: string;
  payment_url: string;
};

export default function CalcComponent() {
  const [userId, setUserId] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState("");
  const [perMember, setPerMember] = useState(0);
  const [urls, setUrls] = useState<string[]>([""]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPayment = async () => {
      const { data, error } = await supabaseClient
        .from("member")
        .select("user_id");
      if (error) {
        console.error("メンバー情報の取得失敗");
      } else {
        const allIds = data.map((row) => row.user_id);
        const filteredUserIds: string[] = [...new Set(allIds)];
        setUserId(filteredUserIds);
      }
    };

    fetchPayment();
  }, []);

  useEffect(() => {
    const perMemberAmount = Math.round(Number(totalAmount) / userId.length);
    setPerMember(perMemberAmount);
  }, [totalAmount, userId.length]);

  useEffect(() => {
    setUrls(userId.map(() => ""));
  }, [userId]);

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const openConfirmWindow = () => {
    if (totalAmount === "") {
      toast.error("合計金額を入れてください");
      return;
    }
    for (const url of urls) {
      if (url === "") {
        toast.error("全てのURLを入れてください");
        return;
      }
    }
    setOpen(true);
  };

  const notifyPayment = async () => {
    const paymentInfos: Payment[] = [];
    for (let i = 0; i < userId.length; i++) {
      paymentInfos.push({
        id: userId[i],
        amount: perMember,
        status: "unpaid",
        payment_url: urls[i],
      });
    }

    const { error: delErr } = await supabaseClient
      .from("payment")
      .delete()
      .not("id", "is", null);
    if (delErr) {
      toast.error("支払い情報の通知に失敗しました");
      return;
    }

    const { error: insertErr } = await supabaseClient
      .from("payment")
      .insert(paymentInfos);
    if (insertErr) {
      toast.error("支払い情報の通知に失敗しました");
      return;
    }

    toast.success("支払い情報の通知が完了しました");
    router.push("/admin");
  };

  return (
    <div>
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
        <h1 className="text-4xl font-bold mb-10 text-center">
          <p>金額計算</p>
        </h1>
        <div className="max-w-lg mb-6">
          <label className="block font-semibold mb-1">
            参加人数：{userId.length}人
          </label>
          <div className="flex items-center gap-2 mb-2">
            <label className="block font-semibold mb-1">合計金額：</label>
            <input
              type="number"
              className="flex-1 border px-2 py-1"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
          </div>
          <label className="block font-semibold mb-1">
            1人あたりの金額：{perMember}円
          </label>
          <label className="block font-semibold mb-1">
            PayPayの支払い用URL(人数分)
          </label>
          <div className="w-full max-w-lg mb-6 h-48 overflow-y-auto border p-2">
            {urls.map((url, idx) => (
              <input
                key={idx}
                type="text"
                className="w-full border px-2 py-1 mb-2"
                value={url}
                onChange={(e) => updateUrl(idx, e.target.value)}
              />
            ))}
          </div>
        </div>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded"
          onClick={openConfirmWindow}
        >
          請求
        </button>
      </main>
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="rounded-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle>請求を行いますか？</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              間違いがないか今一度確認してから請求を行うようにしてください。
            </p>
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button
                className="bg-blue-600 text-white px-5"
                onClick={() => {
                  notifyPayment();
                  setOpen(false);
                }}
              >
                請求
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                キャンセル
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

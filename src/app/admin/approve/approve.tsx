"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase/browser";
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
  name: string;
  status: string;
};

export default function ApproveComponent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchPayment = async () => {
      const { data, error } = await supabaseClient
        .from("payment_situation")
        .select("*");
      if (error) {
        console.error("支払い状況の取得失敗");
      } else {
        const moldedPayments: Payment[] = [];
        for (const tempPay of data) {
          if (
            tempPay &&
            tempPay.id &&
            tempPay.last_name &&
            tempPay.first_name &&
            tempPay.status
          )
            moldedPayments.push({
              id: tempPay.id,
              name: tempPay.last_name + tempPay.first_name,
              status: tempPay.status,
            });
        }
        setPayments(moldedPayments);
      }
    };

    fetchPayment();
  }, []);

  const conversionStatus = (status: string) => {
    if (status === "unpaid") return "未払い";
    if (status === "awaiting") return "承認待ち";
    if (status === "approved") return "支払い済み";
    return "不明";
  };

  const setApproved = async () => {
    if (selectedPayment) {
      const { error } = await supabaseClient
        .from("payment")
        .update({
          status: "approved",
        })
        .eq("id", selectedPayment?.id);
      if (error) {
        console.error("支払い済みに更新するのに失敗しました");
      }
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === selectedPayment.id
            ? { ...payment, status: "approved" }
            : payment
        )
      );
    }
  };

  const setUnpaid = async () => {
    if (selectedPayment) {
      const { error } = await supabaseClient
        .from("payment")
        .update({
          status: "unpaid",
        })
        .eq("id", selectedPayment.id);
      if (error) {
        console.error("未払いに更新するのに失敗しました");
      }
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === selectedPayment.id
            ? { ...payment, status: "unpaid" }
            : payment
        )
      );
    }
  };

  return (
    <div>
      <div className="flex flex-col px-4 items-center mt-2">
        <h1 className="text-2xl font-bold mb-6 text-center">支払い承認画面</h1>
        <table className="w-full border-[1.5px] border-black border-collapse text-sm sm:text-base">
          <thead>
            <tr className="bg-blue-500">
              <td className="border border-[1.5px] border-black px-2 py-1 break-words max-w-[200px] sm:max-w-[300px] font-bold">
                名前
              </td>
              <td className="border border-[1.5px] border-black px-2 py-1 break-words max-w-[200px] sm:max-w-[300px] font-bold">
                状態
              </td>
              <td className="border border-[1.5px] border-black w-[90px] px-2 py-1 whitespace-nowrap text-center font-bold">
                変更
              </td>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, idx) => (
              <tr
                key={payment.id}
                className={idx % 2 ? "bg-blue-200" : "bg-white"}
              >
                <td className="border border-[1.5px] border-black px-2 py-1 break-words max-w-[200px] sm:max-w-[300px]">
                  {payment.name}
                </td>
                <td
                  className={`border border-[1.5px] border-black px-2 py-1 break-words max-w-[200px] sm:max-w-[300px] ${
                    payment.status === "unpaid"
                      ? " text-red-500 font-bold"
                      : payment.status === "awaiting"
                      ? "text-green-500 font-semibold"
                      : "text-black"
                  }`}
                >
                  {conversionStatus(payment.status)}
                </td>
                <td className="border border-[1.5px] border-black px-2 py-1 whitespace-nowrap text-center">
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setOpen(true);
                    }}
                    className="px-2 py-1 bg-gray-700 text-white rounded text-xs sm:text-sm hover:bg-gray-800"
                  >
                    確認
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="rounded-2xl shadow-2xl h-[160px] w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex justify-center">
                {selectedPayment?.name}の支払い承認
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 flex justify-center">
              現在の状態：{conversionStatus(selectedPayment!.status)}
            </p>
            <DialogFooter>
              <div className="w-full flex justify-center gap-4">
                {selectedPayment && (
                  <ChangeStatusComponent
                    status={selectedPayment.status}
                    setApproved={setApproved}
                    setUnpaid={setUnpaid}
                    onClickPay={() => setOpen(false)}
                  />
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ChangeStatusComponent({
  status,
  setApproved,
  setUnpaid,
  onClickPay,
}: {
  status: string;
  setApproved: () => void;
  setUnpaid: () => void;
  onClickPay: () => void;
}) {
  if (status === "unpaid") {
    return (
      <Button
        className="bg-blue-600 text-white px-5"
        onClick={() => {
          setApproved();
          onClickPay();
        }}
      >
        承認する
      </Button>
    );
  }
  if (status === "awaiting") {
    return (
      <div>
        <Button
          className="bg-blue-600 text-white px-5 m-2"
          onClick={() => {
            setApproved();
            onClickPay();
          }}
        >
          承認する
        </Button>
        <Button
          className="bg-red-600 text-white px-5 m-2"
          onClick={() => {
            setUnpaid();
            onClickPay();
          }}
        >
          未払いに戻す
        </Button>
      </div>
    );
  }
  if (status === "approved") {
    return (
      <Button
        className="bg-red-600 text-white px-5"
        onClick={() => {
          setUnpaid();
          onClickPay();
        }}
      >
        未払いに戻す
      </Button>
    );
  }
  return <p></p>;
}

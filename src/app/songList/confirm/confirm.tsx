"use client";

import { useConfirmationStore } from "@/lib/stores/confirmationStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { supabaseClient } from "@/lib/supabase/browser";
import { RPC } from "@/lib/types";
import toast from "react-hot-toast";

export default function ConfirmComponent({
  user,
  rpcName,
}: {
  user: { id: string; email?: string };
  rpcName: RPC;
}) {
  const router = useRouter();
  const { data } = useConfirmationStore();
  useEffect(() => {
    if (!data) {
      toast.error("データが見つかりませんでした。");
      router.replace("/songList/entry");
    }
  }, [data]);

  if (!data) return null;

  const formattedMembers = data.entries.flatMap((entry) =>
    entry.parts.map((r) => ({
      user_id: entry.member,
      part: r.part,
      nickname: entry.nickname ?? null,
      other_part: r.otherPart ?? null,
      planner_id: user.id,
    }))
  );

  const handleConfirm = async () => {
    try {
      const { error } = await supabaseClient.rpc(rpcName, {
        param_entry_id: uuidv4(),
        param_planner_id: user.id,
        param_artist: data.artist,
        param_title: data.title,
        members: formattedMembers,
      });

      if (error) throw error;

      toast.success(
        rpcName === "insert_entrysheet_with_member"
          ? "エントリーが完了しました！"
          : "変更が完了しました"
      );
      router.push("/songList?refresh=1");
    } catch (err) {
      console.error("Insert failed:", err);
      toast.error(
        rpcName === "insert_entrysheet_with_member"
          ? "登録に失敗しました。もう一度お試しください。"
          : "変更に失敗しました。もう一度お試しください。"
      );
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">入力内容の確認</h2>
      <p>
        <strong>アーティスト名:</strong>
        {data.artist}
      </p>
      <p>
        <strong>曲名:</strong>
        {data.title}
      </p>
      <div className="space-y-8 p-6 min-h-screen">
        {data.entries.map((entry, i) => (
          <div
            key={i}
            className="relative border rounded-xl shadow-md p-4 bg-white"
          >
            <div className="absolute -top-3 left-3 bg-white text-sm px-2 py-1 rounded">
              メンバー{i + 1}
            </div>
            <div>
              <p>名前:{entry.fullname}</p>
              <div className="border-dotted border-t border-gray-400 mt-2"></div>
            </div>

            <div>
              <p>表示名: {entry.nickname ? entry.nickname : entry.fullname}</p>
              <div className="border-dotted border-t border-gray-400 mt-2"></div>
            </div>

            <div>
              <p>パート:</p>
              <ul>
                {entry.parts.map((r, j) => (
                  <li key={j}>
                    ・{r.part}
                    {r.part === "その他" && r.otherPart
                      ? `(${r.otherPart})`
                      : ""}
                  </li>
                ))}
              </ul>
              <div className="border-dotted border-t border-gray-400 mt-2"></div>
            </div>
          </div>
        ))}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            確定
          </button>
          <button
            onClick={() => router.push("/songList/entry")}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            修正
          </button>
        </div>
      </div>
    </div>
  );
}

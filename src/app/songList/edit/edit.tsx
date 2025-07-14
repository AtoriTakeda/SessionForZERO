"use client";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { FormData } from "@/components/entryFormSchema";
import { useConfirmationStore } from "@/lib/stores/confirmationStore";
import { EntryForm } from "@/components/entry";
import toast from "react-hot-toast";

type Entries = {
  user_id: string;
  part: string;
  nickname: string | null;
  other_part: string | null;
  profile: {
    last_name: string;
    first_name: string;
  };
};

export default function EditComponent({
  user,
}: {
  user: { id: string; email?: string };
}) {
  const router = useRouter();

  const { setData } = useConfirmationStore();
  const [entryInfo, setEntryInfo] = useState<Partial<FormData> | null>(null);

  useEffect(() => {
    const fetchEntrysheet = async () => {
      const { data, error } = await supabaseClient
        .from("entrysheet")
        .select(
          "artist, title, member(user_id, part, nickname, other_part, profile(last_name, first_name))"
        )
        .eq("planner_id", user.id)
        .single();

      if (error) {
        console.error("エントリー情報取得失敗:", error);
      } else {
        setEntryInfo({
          artist: data.artist,
          title: data.title,
          entries: groupMembersByEntry(data.member ?? []),
        });
      }
    };

    fetchEntrysheet();
  }, []);

  const onSubmit = async (data: FormData) => {
    const memberIds = data.entries.map((entry) => entry.member);

    if (!memberIds.includes(user.id)) {
      toast.error("ログインしているユーザーをメンバーに含めてください。");
      return;
    }

    const duplicateMembers = memberIds.filter(
      (id, idx, arr) => arr.indexOf(id) !== idx
    );
    if (duplicateMembers.length > 0) {
      toast.error(
        "同じメンバーが複数回登録されています。1つのスペースにまとめるようにしてください。"
      );
      return;
    }

    for (const entry of data.entries) {
      const parts = entry.parts.map((r) => r.part);
      const duplicateParts = parts.filter(
        (part, idx, arr) => arr.indexOf(part) !== idx
      );
      if (duplicateParts.length > 0) {
        toast.error(`${entry.fullname}のパートが重複しています。`);
        return;
      }
    }

    setData(data);
    router.push("/songList/confirm/edit");
  };

  if (!entryInfo) return <p>読み込み中...</p>;

  return (
    <EntryForm defaultValues={entryInfo} onSubmit={onSubmit} user={user} />
  );
}

function groupMembersByEntry(rawMembers: Entries[]): FormData["entries"] {
  const groupedMap = new Map<string, FormData["entries"][number]>();

  for (const m of rawMembers) {
    if (!groupedMap.has(m.user_id)) {
      groupedMap.set(m.user_id, {
        member: m.user_id,
        fullname: `${m.profile.last_name}${m.profile.first_name}`,
        parts: [],
        nickname: m.nickname ?? undefined,
      });
    }

    groupedMap.get(m.user_id)!.parts.push({
      part: m.part as
        | "ボーカル"
        | "バッキングギター"
        | "リードギター"
        | "ベース"
        | "ドラム"
        | "キーボード"
        | "その他",
      otherPart: m.other_part ?? undefined,
    });
  }

  return Array.from(groupedMap.values());
}

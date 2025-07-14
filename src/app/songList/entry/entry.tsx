"use client";
import { useRouter } from "next/navigation";
import { useConfirmationStore } from "@/lib/stores/confirmationStore";
import { FormData } from "@/components/entryFormSchema";
import { EntryForm } from "@/components/entry";
import toast from "react-hot-toast";

export default function EntryComponent({
  user,
}: {
  user: { id: string; email?: string };
}) {
  const router = useRouter();
  const { setData } = useConfirmationStore();

  const onSubmit = (data: FormData) => {
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
    router.push("/songList/confirm/first");
  };

  return (
    <EntryForm defaultValues={undefined} onSubmit={onSubmit} user={user} />
  );
}

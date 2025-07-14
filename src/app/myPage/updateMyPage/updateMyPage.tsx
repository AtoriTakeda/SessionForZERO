"use client";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/browser";
import { ProfileForm } from "@/components/profile";
import { FormData } from "@/components/profileSchema";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function UpdateMyPageComponent({
  user,
}: {
  user: { id: string; email?: string };
}) {
  const [profile, setProfile] = useState<Partial<FormData> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabaseClient
        .from("profile")
        .select(
          "last_name, first_name, last_name_kana, first_name_kana, start_time, end_time"
        )
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("プロフィール取得失敗:", error);
      } else {
        setProfile({
          lastName: data.last_name,
          firstName: data.first_name,
          lastName_kana: data.last_name_kana,
          firstName_kana: data.first_name_kana,
          startTime: data.start_time ?? undefined,
          endTime: data.end_time ?? undefined,
        });
      }
    };

    fetchProfile();
  }, [user.id]);

  const onSubmit = async (data: FormData) => {
    if (!user.id) return;

    const { error } = await supabaseClient
      .from("profile")
      .update({
        last_name: data.lastName,
        first_name: data.firstName,
        last_name_kana: data.lastName_kana,
        first_name_kana: data.firstName_kana,
        start_time: data.startTime || null,
        end_time: data.endTime || null,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("更新に失敗しました。");
    } else {
      toast.success("プロフィールを更新しました！");
      router.push("/myPage");
    }
  };

  if (!profile) return <p>読み込み中...</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-2">ユーザー情報更新</h1>
      <p className="text-center text-gray-600 mb-6">
        変更に必要な部分を修正してください。
      </p>
      <ProfileForm
        defaultValues={profile}
        onSubmit={onSubmit}
        showBackButton={true}
      />
    </div>
  );
}

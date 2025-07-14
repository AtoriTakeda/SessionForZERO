"use client";
import { supabaseClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/profile";
import { FormData } from "@/components/profileSchema";
import toast from "react-hot-toast";

export default function SignUpComponent({
  user,
}: {
  user: { id: string; email?: string };
}) {
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    const { error } = await supabaseClient.from("profile").insert([
      {
        id: user.id,
        last_name: data.lastName,
        first_name: data.firstName,
        last_name_kana: data.lastName_kana,
        first_name_kana: data.firstName_kana,
        start_time: data.startTime || null,
        end_time: data.endTime || null,
        role: "user",
      },
    ]);

    if (error) {
      toast.error("登録に失敗しました。サインイン画面に戻ります");
      router.push("/login");
    } else {
      toast.success("登録が完了しました！");
      router.push("/");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-2">ユーザー情報登録</h1>
      <p className="text-center text-gray-600 mb-6">
        このフォームに入力してユーザー情報を登録してください。
      </p>
      <ProfileForm defaultValues={undefined} onSubmit={onSubmit} />
    </div>
  );
}

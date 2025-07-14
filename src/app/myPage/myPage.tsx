"use client";
import { useState, useEffect } from "react";
import { Member } from "@/lib/types";
import { supabaseClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

export default function MyPageComponent({
  user,
}: {
  user: { id: string; email?: string };
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<Member | null>(null);
  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabaseClient
        .from("profile")
        .select(
          "id, last_name, first_name, last_name_kana, first_name_kana, start_time, end_time"
        )
        .eq("id", user.id)
        .single();
      if (error) {
        router.push("/login");
      } else {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [router, user.id]);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-center">
        あなたのプロフィール
      </h1>
      <div className="max-w-md mx-auto bg-white shadow-md rounded-xl p-6 space-y-4 border border-gray-300">
        <div>
          <div className="text-sm font-medium text-gray-500">名前</div>
          <div className="text-lg text-gray-800">
            {profile?.last_name}
            {profile?.first_name}
          </div>
          <div className="border-dotted border-t border-gray-400 mt-2"></div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500">名前(よみ)</div>
          <div className="text-lg text-gray-800">
            {profile?.last_name_kana}
            {profile?.first_name_kana}
          </div>
          <div className="border-dotted border-t border-gray-400 mt-2"></div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500">
            参加可能な時間帯
          </div>
          <div className="text-lg text-gray-800">
            {profile?.start_time
              ? profile.start_time + "~" + profile.end_time
              : "いつでも可能"}
          </div>
          <div className="border-dotted border-t border-gray-400 mt-2"></div>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => router.push("/myPage/updateMyPage")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          編集
        </button>
      </div>
    </div>
  );
}

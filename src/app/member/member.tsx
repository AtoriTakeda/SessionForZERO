"use client";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/browser";
import { Member } from "@/lib/types";

export default function MemberComponent() {
  const [profiles, setProfiles] = useState<Member[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabaseClient
        .from("profile")
        .select(
          "id, last_name, first_name, last_name_kana, first_name_kana, start_time, end_time"
        )
        .order("last_name_kana", { ascending: true });
      if (error) {
        console.error("読み込み失敗");
      } else {
        setProfiles(data);
      }
    };

    fetchProfiles();
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-center">参加者一覧</h1>
      <div className="flex justify-center mt-8">
        <table className="w-auto border-2 border-black border-collapse">
          <thead className="bg-yellow-300">
            <tr>
              <td className="border-2 border-black px-4 py-2 text-left">
                名前
              </td>
              <td className="border-2 border-black px-4 py-2 text-left">
                読み
              </td>
              <td className="border-2 border-black px-4 py-2 text-left">
                開始時間
              </td>
              <td className="border-2 border-black px-4 py-2 text-left">
                終了時間
              </td>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className={"bg-white"}>
                <td className="border border-black px-4 py-2 break-words max-w-[300px]">
                  {profile.last_name}
                  {profile.first_name}
                </td>
                <td className="border border-black px-4 py-2 break-words max-w-[300px]">
                  {profile.last_name_kana}
                  {profile.first_name_kana}
                </td>
                <td className="border border-black px-4 py-2 break-words max-w-[300px]">
                  {profile.start_time ? profile.start_time : "なし"}
                </td>
                <td className="border border-black px-4 py-2 break-words max-w-[300px]">
                  {profile.end_time ? profile.end_time : "なし"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

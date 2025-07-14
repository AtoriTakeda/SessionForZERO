"use client";

import { Song, RawPerformer, GroupedPerformer } from "@/lib/types";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/browser";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

type Props = {
  user: { id: string; email?: string };
  onRefresh: () => void;
};

const partPriority: Record<string, number> = {
  ボーカル: 0,
  リードギター: 1,
  バッキングギター: 2,
  ベース: 3,
  ドラム: 4,
  キーボード: 5,
};

export default function SongListComponentWrapper({
  user,
}: {
  user: { id: string; email?: string };
}) {
  const [key, setKey] = useState(0);

  return (
    <SongListComponent
      key={key}
      user={user}
      onRefresh={() => setKey((prev) => prev + 1)}
    />
  );
}

function SongListComponent({ user, onRefresh }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [songs, setSongs] = useState<Song[]>([]);
  const [songInfo, setSongInfo] = useState<Song | null>(null);
  const [allPerformers, setAllPerformers] = useState<RawPerformer[]>([]);
  const [performers, setPerformers] = useState<GroupedPerformer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSongList();
    fetchPerformer();
  }, []);

  useEffect(() => {
    if (searchParams.get("refresh") === "1") {
      setLoading(true);
      router.refresh();
    }
    setLoading(false);
  }, [searchParams, router]);

  const fetchSongList = async () => {
    const { data, error } = await supabaseClient
      .from("entrysheet")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("entrysheetの読み込み失敗");
    } else {
      setSongs(data);
    }
  };

  const fetchPerformer = async () => {
    const { data, error } = await supabaseClient
      .from("member")
      .select(
        "entry_id, user_id, nickname, part, other_part, profile (last_name, first_name, last_name_kana, first_name_kana)"
      );
    if (error) {
      console.error("memberの読み込み失敗");
    } else {
      setAllPerformers(data);
    }
  };

  const handleShowDetails = (song: Song) => {
    setSongInfo(song);
    const selectedPerformers = allPerformers.filter(
      (m) => m.entry_id === song.id
    );
    const groupedPerformersMap = new Map<string, GroupedPerformer>();

    selectedPerformers.forEach((performer) => {
      const id = performer.user_id;
      const partText = performer.part;
      const otherPartText = performer.other_part;
      const partElement = otherPartText
        ? `${partText}(${otherPartText})`
        : partText;

      if (groupedPerformersMap.has(id)) {
        const existing = groupedPerformersMap.get(id);
        existing?.parts.push(partElement);
      } else {
        groupedPerformersMap.set(id, {
          user_id: id,
          nickname: performer.nickname ?? null,
          parts: [partElement],
          last_name: performer.profile.last_name,
          first_name: performer.profile.first_name,
          last_name_kana: performer.profile.last_name_kana,
          first_name_kana: performer.profile.first_name_kana,
        });
      }
    });

    const groupedPerformers = Array.from(groupedPerformersMap.values());

    const sortedPerformers = groupedPerformers
      .map((performer) => {
        const sortedParts = performer.parts.sort(
          (a, b) => partPriority[a] - partPriority[b]
        );

        return {
          ...performer,
          parts: sortedParts,
          priority: partPriority[sortedParts[0]] ?? 99,
        };
      })
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        const aName = a.last_name_kana + a.first_name_kana || "";
        const bName = b.last_name_kana + b.first_name_kana || "";
        return aName.localeCompare(bName, "ja");
      });

    setPerformers(sortedPerformers);
    setIsOpen(true);
  };

  const deleteEntry = async () => {
    const { error } = await supabaseClient
      .from("entrysheet")
      .delete()
      .eq("planner_id", user.id);
    if (error) {
      toast.error("削除に失敗しました。");
    } else {
      toast.success("削除しました！");
    }
    setIsOpen(false);
    onRefresh();
    setLoading(true);
    router.refresh();
    setLoading(false);
  };

  return (
    <div>
      {loading && (
        <div className="text-center py-4 text-gray-600">反映中です...</div>
      )}
      <h1 className="text-2xl font-bold mb-6 text-center">エントリーシート</h1>
      <div className="flex flex-col px-4 items-center mt-8">
        <table className="w-full border-collapse text-sm sm:text-base">
          <thead className="bg-lime-300">
            <tr>
              <th className="border px-2 py-1 text-left font-bold">
                アーティスト名
              </th>
              <th className="border px-2 py-1 text-left font-bold">曲名</th>
              <th className="border px-2 py-1 w-[90px] whitespace-nowrap text-center font-bold">
                詳細情報
              </th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song, index) => (
              <tr
                key={song.id}
                className={index % 2 ? "bg-white" : "bg-lime-50"}
              >
                <td className="border px-2 py-1 break-words max-w-[200px] sm:max-w-[300px]">
                  {song.artist}
                </td>
                <td className="border px-2 py-1 break-words max-w-[200px] sm:max-w-[300px]">
                  {song.title}
                </td>
                <td className="border px-2 py-1 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleShowDetails(song)}
                    className="px-2 py-1 bg-gray-700 text-white rounded text-xs sm:text-sm hover:bg-gray-800"
                  >
                    確認
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!songs.some((e) => e.planner_id === user.id) && (
          <div className="mt-6">
            <Link href="/songList/entry" className="w-full">
              <button className="bg-blue-600 text-white px-4 py-2 rounded">
                エントリー
              </button>
            </Link>
          </div>
        )}
      </div>
      {isOpen && (
        <AnimatePresence mode="wait">
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl overflow-y-auto max-h-[90vh] relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
              >
                ×
              </button>
              <h2 className="text-xl font-semibold mb-4">詳細情報</h2>
              <h3>曲情報</h3>
              <p className="mb-4">アーティスト名:{songInfo?.artist}</p>
              <p className="mb-4">曲名:{songInfo?.title}</p>
              <h3 className="text-lg font-semibold mb-2">メンバー</h3>
              <div className="space-y-6 overflow-y-auto">
                {performers.map((performer, index) => (
                  <div
                    key={index}
                    className="border rounded-xl shadow-sm p-4 bg-gray-50 break-words"
                  >
                    <div>
                      <p className="font-medium mb-1">
                        {performer.nickname && performer.nickname.trim() !== ""
                          ? performer.nickname
                          : `${performer.last_name}${performer.first_name}`}
                        {performer.user_id === songInfo?.planner_id ? (
                          <span className="text-yellow-400">★</span>
                        ) : (
                          ""
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="mt-2 text-sm text-gray-600">パート</p>
                      <p className="mt-2 text-sm text-gray-600">
                        {performer.parts.join("&")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {songInfo?.planner_id === user.id && (
                <div className="flex justify-center gap-4 mt-8">
                  <button
                    onClick={() => router.push("/songList/edit")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    編集
                  </button>
                  <button
                    onClick={deleteEntry}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    削除
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

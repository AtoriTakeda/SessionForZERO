"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/browser";
import { TimetableRow, Studio, SongList } from "@/lib/types";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

type Timetable = {
  holding_time_id: string;
  studio_id: string;
  song_id: string | undefined;
};

type Member = {
  entry_id: string;
  user_id: string;
};

type Profile = {
  id: string;
  start_time: string | null;
  end_time: string | null;
};

type TimeRange = { start: string; end: string };

type Prop = {
  timetableFramePath: string;
};

export const TimetableForm = ({ timetableFramePath }: Prop) => {
  const [slots, setSlots] = useState<TimetableRow[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [songList, setSongList] = useState<SongList[]>([]);
  const [fixedSongList, setFixedSongList] = useState<SongList[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSongList = async () => {
      const { data: songListData, error: songListError } = await supabaseClient
        .from("entrysheet")
        .select("id, artist, title");
      if (songListError) {
        console.error("エントリーシートの取得失敗");
      } else {
        setSongList(songListData);
        setFixedSongList(songListData);
      }

      const { data: memberData, error: membersError } = await supabaseClient
        .from("member")
        .select("entry_id, user_id");
      if (membersError) {
        console.error("メンバーの取得失敗");
      } else {
        const uniqueMembers = Array.from(
          new Map(
            memberData.map((p) => [`${p.entry_id}_${p.user_id}`, p])
          ).values()
        );
        setMembers(uniqueMembers);
      }

      const { data: profileData, error: profilesError } = await supabaseClient
        .from("profile")
        .select("id, start_time, end_time");
      if (profilesError) {
        console.error("プロフィールの取得失敗");
      } else {
        setProfiles(profileData);
      }

      const { data: studioData, error: studioError } = await supabaseClient
        .from("studio")
        .select("*");
      if (studioError) {
        console.error("スタジオの取得失敗");
      } else {
        const tempStudios: Studio[] = [];
        for (const studio of studioData) {
          tempStudios.push({
            id: studio.id,
            name: studio.name,
          });
        }
        setStudios(tempStudios);
      }

      const { data: timetableData, error: timetableError } =
        await supabaseClient
          .from("timetable_detail")
          .select("*")
          .order("start_time")
          .order("display_order");
      if (timetableError) {
        console.error("タイムテーブルの取得失敗");
      } else {
        const moldedTimetable = timetableData.reduce<TimetableRow[]>(
          (acc, row) => {
            let holding_time = acc.find(
              (h) => h.holding_time_id === row.holding_time_id
            );
            if (
              !holding_time &&
              row.holding_time_id &&
              row.start_time &&
              row.end_time
            ) {
              holding_time = {
                holding_time_id: row.holding_time_id,
                start_time: row.start_time,
                end_time: row.end_time,
                columns: {},
              };
              acc.push(holding_time);
            }
            if (!holding_time) {
              return acc;
            }
            holding_time.columns[row.studio_id as string] = row.song_id
              ? {
                  id: row.song_id,
                  artist: row.artist as string,
                  title: row.title as string,
                }
              : null;
            return acc;
          },
          []
        );
        setSlots(moldedTimetable);
      }
    };

    fetchSongList();
  }, []);

  useEffect(() => {
    const entryId = slots
      .flatMap((slot) => Object.values(slot.columns))
      .map((col) => col?.id)
      .filter((id): id is string => !!id);

    const filteredSongList = fixedSongList?.filter(
      (e) => !entryId.includes(e.id)
    );
    if (filteredSongList) {
      setSongList(filteredSongList);
    }
  }, [slots]);

  const randomTimetable = () => {
    setSlots((prev) => {
      const slotsCopy: TimetableRow[] = prev.map((slot) => ({
        ...slot,
        columns: { ...slot.columns },
      }));
      const shuffled = [...songList].sort(() => Math.random() - 5);
      let allPlaced = true;

      for (const song of shuffled) {
        let placed = false;

        for (let attempt = 0; attempt < 100 && !placed; attempt++) {
          const slotIndex = Math.floor(Math.random() * slotsCopy.length);
          const colIndex = Math.floor(Math.random() * studios.length);

          const { result } = canPlaceSong(slotsCopy, slotIndex, colIndex, song);
          if (result) {
            slotsCopy[slotIndex].columns[studios[colIndex].id] = song;
            placed = true;
          }
        }

        if (!placed) {
          allPlaced = false;
          toast.error(
            "配置できませんでした。枠を増やすか、時間帯を変更してください。"
          );
          break;
        }
      }

      return allPlaced ? slotsCopy : prev;
    });
  };

  const resetTimetable = () => {
    setSlots((prev) => {
      const copy: TimetableRow[] = prev.map((slot) => ({
        ...slot,
        columns: Object.fromEntries(
          Object.keys(slot.columns).map((key) => [key, null])
        ),
      }));

      return copy;
    });
  };

  const canPlaceSong = (
    slots: TimetableRow[],
    slotIndex: number,
    colIndex: number,
    song: SongList
  ): { result: boolean; message: string } => {
    if (slots[slotIndex].columns[studios[colIndex].id] !== null)
      return { result: false, message: "" };

    const membersId = getMembersId(members, song.id);
    for (let i = 0; i < studios.length; i++) {
      if (!slots[slotIndex].columns) continue;
      const otherSongId = slots[slotIndex].columns[studios[i].id]?.id;
      if (otherSongId) {
        const otherMembersId = getMembersId(members, otherSongId);
        if (otherMembersId.some((p) => membersId.includes(p))) {
          return {
            result: false,
            message: "同じ時間のバンドに重複しているメンバーがいます",
          };
        }
      }
    }

    const participantsProfile = profiles.filter((profile) =>
      membersId.includes(profile.id)
    );
    const { start, end } = getAvailableTime(participantsProfile);
    const songStart = timeToMinutes(slots[slotIndex].start_time);
    const songEnd = timeToMinutes(slots[slotIndex].end_time);

    if (songStart >= timeToMinutes(start) && songEnd <= timeToMinutes(end)) {
      return { result: true, message: "" };
    } else {
      return {
        result: false,
        message: "この時間には参加できないメンバーがいます。",
      };
    }
  };

  const getMembersId = (members: Member[], songId: string): string[] => {
    const membersId = members
      .filter((member) => member.entry_id === songId)
      .map((member) => member.user_id);

    return membersId;
  };

  const arrangeFormat = (startTime: string) => {
    const [h, m] = startTime.split(":");
    const formatted = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
    return formatted;
  };

  const openConfirmWindow = () => {
    if (songList.length !== 0) {
      toast.error("全ての曲を配置してください");
      return;
    }
    setOpen(true);
  };

  const registerTimetable = async () => {
    const timeTable: Timetable[] = [];
    for (const slot of slots) {
      for (const studio of studios) {
        const songId = slot.columns[studio.id]?.id;
        timeTable.push({
          holding_time_id: slot.holding_time_id,
          studio_id: studio.id,
          song_id: songId,
        });
      }
    }
    const { error: delErr } = await supabaseClient
      .from("timetable")
      .delete()
      .not("id", "is", null);
    if (delErr) {
      toast.error("タイムテーブル登録に失敗しました");
      return;
    }

    const { error: insertErr } = await supabaseClient
      .from("timetable")
      .insert(timeTable);
    if (insertErr) {
      toast.error("タイムテーブル登録に失敗しました");
      return;
    }

    toast.success("タイムテーブル登録に成功しました");
    router.push("/admin");
  };

  return (
    <div>
      <div className="flex flex-col px-4 items-center mt-2">
        <h1 className="text-2xl font-bold mb-6 text-center">
          タイムテーブル設定
        </h1>
        <table className="w-full border-[1.5px] border-black border-collapse text-sm sm:text-base">
          <thead>
            <tr>
              <td></td>
              {studios.map((studio) => (
                <td
                  key={studio.id}
                  className="border border-[1.5px] border-black h-8 px-2 py-1 break-words max-w-[200px] sm:max-w-[300px]"
                >
                  {studio.name}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, slotIndex) => (
              <tr key={slot.holding_time_id}>
                <td className="border border-[1.5px] border-black px-2 py-1 break-words max-w-[200px] sm:max-w-[300px]">
                  {arrangeFormat(slot.start_time)}
                </td>
                {studios.map((studio, colIndex) => (
                  <td
                    key={studio.id}
                    className="border border-[1.5px] border-black px-2 py-1 break-words max-w-[200px] sm:max-w-[300px]"
                  >
                    {slot.columns[studio.id] ? (
                      <>
                        <div className="flex items-center">
                          <div className="flex flex-col">
                            <span>{slot.columns[studio.id]?.artist}</span>
                            <span className="text-sm">
                              {slot.columns[studio.id]?.title}
                            </span>
                          </div>
                          <button
                            className="bg-red-500 text-white ml-3 px-2 py-0.5 rounded hover:bg-red-600"
                            onClick={() => {
                              setSlots((prev) => {
                                const copy = structuredClone(prev);
                                copy[slotIndex].columns[studio.id] = null;
                                return copy;
                              });
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </>
                    ) : (
                      <select
                        value=""
                        className="bg-gray-300"
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const selectedSong = songList.find(
                            (song) => song.id === selectedId
                          );

                          if (!selectedSong) return;
                          setSlots((prev) => {
                            const copy = structuredClone(prev);
                            const { result, message } = canPlaceSong(
                              copy,
                              slotIndex,
                              colIndex,
                              selectedSong
                            );
                            if (result) {
                              copy[slotIndex].columns[studio.id] = selectedSong;
                              return copy;
                            } else {
                              toast.error(message);
                              return prev;
                            }
                          });
                        }}
                      >
                        <option value="">-</option>
                        {songList.map((song) => (
                          <option key={song.id} value={song.id}>
                            {song.artist}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        <button
          className={`${
            songList.length == 0
              ? "bg-gray-400 text-white cursor-not-allowed px-6 py-2 rounded"
              : "bg-green-500 text-white px-6 py-2 rounded"
          }`}
          disabled={songList.length == 0}
          onClick={randomTimetable}
        >
          ランダム配置
        </button>
        <button
          className="bg-red-500 text-white px-6 py-2 rounded"
          onClick={resetTimetable}
        >
          リセット
        </button>
      </div>
      <div className="flex justify-center mt-4">
        <button
          className="bg-green-500 text-white px-6 py-2 rounded"
          onClick={() => openConfirmWindow()}
        >
          タイムスケジュール作成
        </button>
      </div>
      <div className="flex justify-between items-center ml-2">
        <button
          onClick={() => router.push(timetableFramePath)}
          className="rounded bg-gray-200 px-4 shadow-md"
        >
          タイムテーブル枠組み作成に戻る
        </button>
      </div>
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="rounded-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle>タイムテーブルを登録しますか？</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              一度登録すると上書き保存されます。よろしいですか？
            </p>
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button
                className="bg-blue-600 text-white px-5"
                onClick={() => {
                  registerTimetable();
                  setOpen(false);
                }}
              >
                登録
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
};

function getAvailableTime(profiles: Profile[]): TimeRange {
  const latestStart = profiles
    .map((p) => (p.start_time ? p.start_time : "10:00"))
    .sort((a, b) => a?.localeCompare(b))
    .pop()!;
  const earliestEnd = profiles
    .map((p) => (p.end_time ? p.end_time : "24:00"))
    .sort((a, b) => a.localeCompare(b))
    .shift()!;

  return { start: latestStart, end: earliestEnd };
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

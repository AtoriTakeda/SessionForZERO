"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase/browser";
import { TimetableRow, Studio } from "@/lib/types";

export default function TimetableComponent() {
  const [slots, setSlots] = useState<TimetableRow[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);

  const arrangeFormat = (startTime: string) => {
    const [h, m] = startTime.split(":");
    const formatted = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
    return formatted;
  };

  useEffect(() => {
    const fetchTimetable = async () => {
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
    };

    fetchTimetable();
  }, []);

  return (
    <div>
      <div className="flex flex-col px-4 items-center mt-2">
        <h1 className="text-2xl font-bold mb-6 text-center">タイムテーブル</h1>
        <table className="w-full border-[1.5px] border-black border-collapse text-sm sm:text-base">
          <thead>
            <tr className="bg-pink-400">
              <td className="w-[70px] bg-pink-500"></td>
              {studios.map((studio) => (
                <td
                  key={studio.id}
                  className="border border-[1.5px] border-black h-8 px-2 py-1 break-words max-w-[200px] sm:max-w-[300px] font-bold"
                >
                  {studio.name}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.holding_time_id}>
                <td className="bg-pink-200 border border-[1.5px] border-black px-2 py-1 break-words max-w-[200px] sm:max-w-[300px]">
                  {arrangeFormat(slot.start_time)}
                </td>
                {studios.map((studio) => (
                  <td
                    key={studio.id}
                    className="border border-[1.5px] border-black px-2 py-1 break-words max-w-[200px] sm:max-w-[300px]"
                  >
                    {slot.columns[studio.id] ? (
                      <>
                        <div className="flex flex-col">
                          <span>{slot.columns[studio.id]?.artist}</span>
                          <span className="text-sm">
                            {slot.columns[studio.id]?.title}
                          </span>
                        </div>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/browser";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

type HoldingTime = {
  start_time: string;
  end_time: string;
};

type Studio = {
  name: string;
  display_order: number;
};

type Prop = {
  timetablePath: string;
};

export const TimetableFrameForm = ({ timetablePath }: Prop) => {
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [interval, setInterval] = useState(30);
  const [rows, setRows] = useState<string[]>(["10:00"]);
  const [columns, setColumns] = useState<string[]>([""]);
  const [songNumber, setSongNumber] = useState(0);
  const [timetableNumber, setTimetableNumber] = useState(0);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const times = useMemo(() => {
    const timesArray: string[] = [];
    for (let hour = 10; hour <= 24; hour++) {
      for (const minute of [0, 30]) {
        if (hour == 24 && minute > 0) continue;

        const label = `${String(hour).padStart(2, "0")}:${
          minute === 0 ? "00" : "30"
        }`;
        timesArray.push(label);
      }
    }
    return timesArray;
  }, []);

  const toMinute = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const toTimeString = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const addColumn = () => {
    setColumns([...columns, ""]);
  };

  const removeColumn = (index: number) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const updateColumn = (index: number, value: string) => {
    const newCols = [...columns];
    newCols[index] = value;
    setColumns(newCols);
  };

  const judgeForDecidePage = () => {
    if (songNumber > rows.length * columns.length) {
      toast.error("枠数が足りません。時間を伸ばすかスタジオを増やしてください");
      return;
    }

    const hasEmptyColumn = columns.some((col) => col.trim() === "");
    if (hasEmptyColumn) {
      toast.error("スタジオ名は全て入力してください");
      return;
    }

    if (timetableNumber !== 0) {
      setOpen(true);
    } else {
      moveToDecidePage();
    }
  };

  const moveToDecidePage = async () => {
    const { error: timeDelErr } = await supabaseClient
      .from("holding_time")
      .delete()
      .not("id", "is", null);
    if (timeDelErr) throw timeDelErr;
    const start = toMinute(startTime);
    const end = toMinute(endTime);
    const holdingTime: HoldingTime[] = [];
    for (let i = start; i < end; i += interval) {
      if (i + interval <= end) {
        holdingTime.push({
          start_time: toTimeString(i),
          end_time: toTimeString(i + interval),
        });
      }
    }
    const { error: timeInsertErr } = await supabaseClient
      .from("holding_time")
      .insert(holdingTime);
    if (timeInsertErr) throw timeInsertErr;

    const { error: studioDelErr } = await supabaseClient
      .from("studio")
      .delete()
      .not("id", "is", null);
    if (studioDelErr) throw studioDelErr;
    const studios: Studio[] = [];
    columns.map((studio, idx) => {
      studios.push({
        name: studio,
        display_order: idx,
      });
    });

    const { error: studioInsertErr } = await supabaseClient
      .from("studio")
      .insert(studios);
    if (studioInsertErr) throw studioInsertErr;

    router.push(timetablePath);
  };

  useEffect(() => {
    const fetchSongNumber = async () => {
      const { count, error } = await supabaseClient
        .from("entrysheet")
        .select("*", { count: "exact", head: true });
      if (error) {
        console.error("曲数の取得失敗");
      }

      if (count) {
        setSongNumber(count);
      }
    };

    const fetchTimeTableFrame = async () => {
      const { count, error: timetableError } = await supabaseClient
        .from("timetable")
        .select("song_id", { count: "exact", head: true })
        .not("song_id", "is", null);
      if (timetableError) {
        console.error("タイムテーブルのカウントの取得失敗");
      }
      if (count) {
        setTimetableNumber(count);
      }

      const { data: timeData, error: timeError } = await supabaseClient
        .from("holding_time")
        .select("*");
      if (timeError) {
        console.error("開催時刻の取得に失敗");
      }

      if (timeData && timeData.length !== 0) {
        const start_times = timeData.map((time) => toMinute(time.start_time));
        const start_time_min = start_times.reduce(
          (acc, cur) => Math.min(acc, cur),
          Infinity
        );
        setStartTime(toTimeString(start_time_min));

        const end_times = timeData.map((time) => toMinute(time.end_time));
        const end_time_max = end_times.reduce(
          (acc, cur) => Math.max(acc, cur),
          -Infinity
        );
        setEndTime(toTimeString(end_time_max));

        setInterval(
          toMinute(timeData[0].end_time) - toMinute(timeData[0].start_time)
        );
      }

      const { data: studioData, error: studioError } = await supabaseClient
        .from("studio")
        .select("*");
      if (studioError) {
        console.error("スタジオの取得に失敗");
      }

      if (studioData && studioData.length !== 0) {
        const studios = studioData.map((studio) => studio.name);
        setColumns(studios);
      }
    };

    fetchSongNumber();
    fetchTimeTableFrame();
  }, []);

  useEffect(() => {
    const start = toMinute(startTime);
    const end = toMinute(endTime);
    if (start < end) {
      const result: string[] = [];

      for (let i = start; i < end; i += interval) {
        if (i + interval <= end) {
          result.push(toTimeString(i));
        }
      }

      setRows(result);
    }
  }, [startTime, endTime, interval]);

  return (
    <div className="flex flex-col items-center w-full p-4">
      {/* タイトル */}
      <h1 className="text-2xl font-bold mb-6 text-center">
        タイムテーブル枠組み作成
      </h1>

      {/* 開始・終了・1枠持ち時間 */}
      <div className="flex flex-col gap-4 mb-6 w-full max-w-sm">
        <div>
          <label className="block font-semibold mb-1">開始時刻</label>
          <select
            className="w-full border px-2 py-1"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          >
            {times.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">終了時刻</label>
          <select
            className="w-full border px-2 py-1"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          >
            {times.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">1枠の持ち時間</label>
          <select
            className="w-full border px-2 py-1"
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
          >
            {[30, 45, 60, 75, 90].map((n) => (
              <option key={n} value={n}>
                {n}分
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* スタジオ設定 */}
      <div className="w-full max-w-lg mb-6">
        <label className="block font-semibold mb-1">スタジオ</label>
        {columns.map((col, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <input
              className="flex-1 border px-2 py-1"
              value={col}
              placeholder="スタジオ名"
              onChange={(e) => updateColumn(idx, e.target.value)}
            />
            {columns.length > 1 && (
              <button
                className="bg-red-500 text-white px-2 rounded"
                onClick={() => removeColumn(idx)}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
          onClick={addColumn}
        >
          + 列を追加
        </button>
      </div>

      {/* 見本 */}
      <div className="w-full max-w-lg text-center text-sm mb-1">
        タイムテーブルの見本
      </div>
      <div className="flex justify-center mb-6">
        <table className="border border-black border-collapse text-sm">
          <thead>
            <tr>
              <td className="border border-black"></td>
              {columns.map((column, idx) => (
                <td
                  key={idx}
                  className="border border-black px-2 py-1 max-w-[150px] break-words"
                  style={{ minWidth: "5em" }}
                >
                  {column ? (
                    column
                  ) : (
                    <span className="text-gray-400">スタジオ名</span>
                  )}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((time) => (
              <tr key={time}>
                <td className="border border-black px-2 py-1">{time}</td>
                {columns.map((_, idx) => (
                  <td
                    key={idx}
                    className="border border-black px-2 py-1 max-w-[150px]"
                  ></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-full max-w-lg text-sm mb-1">
        エントリー数:{songNumber}
      </div>
      <div className="w-full max-w-lg text-sm mb-1">
        枠数:{rows.length * columns.length}
      </div>

      {/* 編集開始ボタン */}
      <button
        className="bg-green-500 text-white px-6 py-2 rounded"
        onClick={judgeForDecidePage}
      >
        タイムテーブル設定に進む
      </button>
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="rounded-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle>登録済みのタイムテーブルが存在します</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              このままタイムテーブル設定に進むと、登録したタイムテーブルのデータが消去されます。よろしいですか？
            </p>
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                キャンセル
              </Button>
              <Button
                className="bg-blue-600 text-white px-5"
                onClick={() => {
                  moveToDecidePage();
                  setOpen(false);
                }}
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

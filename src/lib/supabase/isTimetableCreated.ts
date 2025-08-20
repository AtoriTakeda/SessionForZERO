import { createClientServerComponent } from "./server";

export const isTimetableCreated = async () => {
  const supabase = createClientServerComponent();

  const { count, error } = await supabase
    .from("timetable")
    .select("song_id", { count: "exact", head: true })
    .not("song_id", "is", null);
  if (error) {
    console.error("タイムテーブルカウント取得エラー");
    return { isCreated: false };
  }

  if (count === 0) {
    return { isCreated: false };
  } else {
    return { isCreated: true };
  }
};

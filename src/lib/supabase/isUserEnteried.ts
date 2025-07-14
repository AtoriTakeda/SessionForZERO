import { createClientServerComponent } from "./server";

export const isUserEntried = async (userId: string): Promise<boolean> => {
  const supabase = createClientServerComponent();

  const { data, error } = await supabase
    .from("entrysheet")
    .select("id")
    .eq("planner_id", userId)
    .maybeSingle();

  if (error) {
    console.error("エントリー情報取得エラー", error.message);
    return false;
  }

  return Boolean(data);
};

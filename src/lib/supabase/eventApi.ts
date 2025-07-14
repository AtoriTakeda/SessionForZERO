import { createClientServerComponent } from "./server";

export const getAllProfiles = async () => {
  const supabase = createClientServerComponent();
  const { data, error } = await supabase
    .from("profile")
    .select(
      "id, last_name, first_name, last_name_kana, first_name_kana, start_time, end_time"
    )
    .order("last_name_kana", { ascending: true });

  if (error) throw error;

  return data;
};

export type Member = {
  id: string;
  last_name: string;
  first_name: string;
  last_name_kana: string;
  first_name_kana: string;
  start_time: string | null;
  end_time: string | null;
};

export type Song = {
  id: string;
  planner_id: string;
  artist: string;
  title: string;
};

export type RawPerformer = {
  entry_id: string;
  user_id: string;
  nickname: string | null;
  part: string;
  other_part: string | null;
  profile: {
    last_name: string;
    first_name: string;
    last_name_kana: string;
    first_name_kana: string;
  };
};

export type GroupedPerformer = {
  user_id: string;
  nickname: string | null;
  parts: string[];
  last_name: string;
  first_name: string;
  last_name_kana: string;
  first_name_kana: string;
};

export type RPC =
  | "insert_entrysheet_with_member"
  | "update_entrysheet_with_member";

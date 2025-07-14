import { createClientServerComponent } from "./server";

export const checkAuthenticatedUser = async () => {
  const supabase = createClientServerComponent();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("セッション取得失敗:", error?.message);
    return { user: null, error };
  }

  return { user, error: null };
};

export const checkUserRegistered = async (userId: string) => {
  const supabase = createClientServerComponent();

  const { data, error } = await supabase
    .from("profile")
    .select("id")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("登録チェック失敗:", error.message);
    return { isRegistered: false, error };
  }

  return { isRegistered: !!data, error: null };
};

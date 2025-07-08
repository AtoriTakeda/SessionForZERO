"use client";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          "https://session-for-zero-git-work-atoritakedas-projects.vercel.app/login/callback",
      },
    });

    if (error) console.error("ログイン失敗:", error);
  };
  return (
    <div>
      <button onClick={handleLogin}>サインイン</button>
    </div>
  );
}

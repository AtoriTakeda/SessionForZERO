"use client";

import { supabaseClient } from "@/lib/supabase/browser";
import toast from "react-hot-toast";

export default function LoginPage() {
  const handleLogin = async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          // 本番用
          "https://sessionforzero.com/login/callback",
        //"https://session-for-zero-git-main-atoritakedas-projects.vercel.app/login/callback",
        //"http://localhost:3000/login/callback",
      },
    });

    if (error) {
      console.error("ログイン失敗:", error.message);
      toast.error("ログインに失敗しました。もう一度お試しください。");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="p-8 bg-white rounded shadow-md space-y-8 text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800">Googleでサインイン</h1>
        <button
          onClick={handleLogin}
          className="flex items-center justify-center border border-gray-300 rounded px-8 py-4 bg-white hover:bg-gray-100 transition shadow-sm w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/web_light_rd_na.svg"
            alt="Google logo"
            width={32}
            height={32}
            className="mr-3"
          />
          <span className="text-xl text-gray-700 font-medium">
            Sign in with Google
          </span>
        </button>
      </div>
    </div>
  );
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  console.log("==== login callback start ====");
  console.log("code:", code);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("セッション交換失敗:", error.message);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  console.log("セッション交換成功:", data.session?.user?.email ?? "(no email)");
  console.log("==== login callback end ====");

  const { data: userData, error: userError } = await supabase
    .from("profile")
    .select("id")
    .eq("id", data.session.user.id)
    .maybeSingle();

  if (userError) {
    console.error("クエリエラー:", userError.message);
    return NextResponse.redirect(new URL("/error", request.url));
  } else if (!userData) {
    console.log("未登録のユーザーのためユーザー登録ページに遷移");
    return NextResponse.redirect(new URL("/signUp", request.url));
  } else {
    console.log("登録済みのユーザーのためトップページに移動");
    return NextResponse.redirect(new URL("/", request.url));
  }
}

import { redirect } from "next/navigation";
import {
  checkAuthenticatedUser,
  checkUserRegistered,
} from "@/lib/supabase/checkUserInfo";
import Link from "next/link";
import { isUserEntried } from "@/lib/supabase/isUserEnteried";

export default async function TopPage() {
  const { user } = await checkAuthenticatedUser();

  if (!user) {
    redirect("/redirect");
  }

  const { isRegistered } = await checkUserRegistered(user.id);
  if (!isRegistered) redirect("/redirect");

  console.log(`[LOGIN] ${user.email} (${user.id})`);

  const alreadyEntried = await isUserEntried(user.id);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <h1 className="text-4xl font-bold mb-10 text-center">
        <p>Session Application</p>
        <p>for </p>
        <p>Music Syndicate ZERO</p>
      </h1>

      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <Link href="/songList/entry" className="w-full">
          <button
            disabled={!!alreadyEntried}
            className={`w-full px-6 py-3 rounded transition ${
              alreadyEntried
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {alreadyEntried ? "エントリー済みです" : "エントリーはこちらから"}
          </button>
        </Link>

        <Link href="/songList" className="w-full">
          <button className="w-full bg-gray-700 text-white px-6 py-3 rounded hover:bg-gray-800">
            エントリーシートへ
          </button>
        </Link>

        <Link href="/member" className="w-full">
          <button className="w-full bg-gray-700 text-white px-6 py-3 rounded hover:bg-gray-800">
            参加者一覧へ
          </button>
        </Link>
      </div>
    </main>
  );
}

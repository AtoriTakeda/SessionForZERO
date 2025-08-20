import {
  checkAuthenticatedUser,
  checkAdminUser,
} from "@/lib/supabase/checkUserInfo";
import { isTimetableCreated } from "@/lib/supabase/isTimetableCreated";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const { user } = await checkAuthenticatedUser();

  if (!user) {
    redirect("/redirect");
  }

  const { isAdmin } = await checkAdminUser(user.id);
  if (!isAdmin) redirect("/");

  const { isCreated } = await isTimetableCreated();
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <h1 className="text-4xl font-bold mb-10 text-center">
        <p>管理者用ページ</p>
      </h1>

      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        {isCreated ? (
          <Link href="/admin/editTimetable" className="w-full">
            <button className="w-full px-6 py-3 rounded transition bg-gray-700 text-white">
              タイムテーブル編集
            </button>
          </Link>
        ) : (
          <Link href="/admin/createTimetable" className="w-full">
            <button className="w-full px-6 py-3 rounded transition bg-gray-700 text-white">
              タイムテーブル作成
            </button>
          </Link>
        )}

        <Link href="/admin/approve" className="w-full">
          <button className="w-full bg-gray-700 text-white px-6 py-3 rounded hover:bg-gray-800">
            支払い承認
          </button>
        </Link>

        <Link href="/admin/calc" className="w-full">
          <button className="w-full bg-gray-700 text-white px-6 py-3 rounded hover:bg-gray-800">
            料金計算
          </button>
        </Link>
      </div>
    </main>
  );
}

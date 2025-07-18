import {
  checkAuthenticatedUser,
  checkUserRegistered,
} from "@/lib/supabase/checkUserInfo";
import { redirect } from "next/navigation";
import SongListComponentWrapper from "./songList";

export default async function SongListPage() {
  const { user } = await checkAuthenticatedUser();

  if (!user) {
    redirect("/redirect");
  }

  const { isRegistered } = await checkUserRegistered(user.id);
  if (!isRegistered) redirect("/redirect");

  return <SongListComponentWrapper user={user} />;
}

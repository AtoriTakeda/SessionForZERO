import {
  checkAuthenticatedUser,
  checkUserRegistered,
} from "@/lib/supabase/checkUserInfo";
import { redirect } from "next/navigation";
import MyPageComponent from "./myPage";

export default async function MyPage() {
  const { user } = await checkAuthenticatedUser();

  if (!user) {
    redirect("/redirect");
  }

  const { isRegistered } = await checkUserRegistered(user.id);
  if (!isRegistered) redirect("/redirect");

  return <MyPageComponent user={user} />;
}

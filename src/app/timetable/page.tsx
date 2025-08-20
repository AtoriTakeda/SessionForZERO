import {
  checkAuthenticatedUser,
  checkUserRegistered,
} from "@/lib/supabase/checkUserInfo";
import { isTimetableCreated } from "@/lib/supabase/isTimetableCreated";
import { redirect } from "next/navigation";
import TimetableComponent from "./timetable";

export default async function TimetablePage() {
  const { user } = await checkAuthenticatedUser();

  if (!user) {
    redirect("/redirect");
  }

  const { isRegistered } = await checkUserRegistered(user.id);
  if (!isRegistered) redirect("/redirect");

  const { isCreated } = await isTimetableCreated();
  if (!isCreated) redirect("/");

  return <TimetableComponent />;
}

import {
  checkAuthenticatedUser,
  checkAdminUser,
} from "@/lib/supabase/checkUserInfo";
import { redirect } from "next/navigation";
import { TimetableForm } from "@/components/timetable";

export default async function DecideTimetablePage() {
  const { user } = await checkAuthenticatedUser();

  if (!user) {
    redirect("/redirect");
  }

  const { isAdmin } = await checkAdminUser(user.id);
  if (!isAdmin) redirect("/");

  return <TimetableForm timetableFramePath="/admin/createTimetable" />;
}

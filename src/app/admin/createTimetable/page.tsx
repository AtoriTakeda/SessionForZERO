import {
  checkAuthenticatedUser,
  checkAdminUser,
} from "@/lib/supabase/checkUserInfo";
import { redirect } from "next/navigation";
import { TimetableFrameForm } from "@/components/timetableFrame";

export default async function CreateTimetablePage() {
  const { user } = await checkAuthenticatedUser();

  if (!user) {
    redirect("/redirect");
  }

  const { isAdmin } = await checkAdminUser(user.id);
  if (!isAdmin) redirect("/");

  return <TimetableFrameForm timetablePath="/admin/createTimetable/decide" />;
}

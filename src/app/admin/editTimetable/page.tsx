import {
  checkAuthenticatedUser,
  checkAdminUser,
} from "@/lib/supabase/checkUserInfo";
import { redirect } from "next/navigation";
import { isTimetableCreated } from "@/lib/supabase/isTimetableCreated";
import { TimetableForm } from "@/components/timetable";

export default async function EditTimetablePage() {
  const { user } = await checkAuthenticatedUser();

  if (!user) {
    redirect("/redirect");
  }

  const { isAdmin } = await checkAdminUser(user.id);
  if (!isAdmin) redirect("/");

  const { isCreated } = await isTimetableCreated();
  if (!isCreated) {
    redirect("/admin/createTimetable");
  }

  return <TimetableForm timetableFramePath="/admin/editTimetable/recreate" />;
}

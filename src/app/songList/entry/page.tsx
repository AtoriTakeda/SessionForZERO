import {
  checkAuthenticatedUser,
  checkUserRegistered,
} from "@/lib/supabase/checkUserInfo";
import { redirect } from "next/navigation";
import EntryComponent from "./entry";

export default async function EntryPage() {
  const { user } = await checkAuthenticatedUser();

  if (!user) {
    redirect("/redirect");
  }

  const { isRegistered } = await checkUserRegistered(user.id);
  if (!isRegistered) redirect("/redirect");

  return <EntryComponent user={user} />;
}

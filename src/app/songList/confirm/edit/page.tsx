import {
  checkAuthenticatedUser,
  checkUserRegistered,
} from "@/lib/supabase/checkUserInfo";
import { redirect } from "next/navigation";
import ConfirmComponent from "../confirm";

export default async function ConfirmPage() {
  const { user } = await checkAuthenticatedUser();

  if (!user) {
    redirect("/redirect");
  }

  const { isRegistered } = await checkUserRegistered(user.id);
  if (!isRegistered) redirect("/redirect");

  return (
    <ConfirmComponent user={user} rpcName="update_entrysheet_with_member" />
  );
}

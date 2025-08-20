import {
  checkAuthenticatedUser,
  checkAdminUser,
} from "@/lib/supabase/checkUserInfo";
import { redirect } from "next/navigation";
import ApproveComponent from "./approve";

export default async function ApprovePage() {
  const { user } = await checkAuthenticatedUser();

  if (!user) {
    redirect("/redirect");
  }

  const { isAdmin } = await checkAdminUser(user.id);
  if (!isAdmin) redirect("/");

  return <ApproveComponent />;
}

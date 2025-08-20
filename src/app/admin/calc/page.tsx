import {
  checkAuthenticatedUser,
  checkAdminUser,
} from "@/lib/supabase/checkUserInfo";
import { redirect } from "next/navigation";
import CalcComponent from "./calc";

export default async function CalcPage() {
  const { user } = await checkAuthenticatedUser();

  if (!user) {
    redirect("/redirect");
  }

  const { isAdmin } = await checkAdminUser(user.id);
  if (!isAdmin) redirect("/");

  return <CalcComponent />;
}

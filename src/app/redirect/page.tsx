"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    toast.error("サインインをしていないとアクセスできません。");
    router.push("/login");
  }, []);

  return null;
}

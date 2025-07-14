"use client";

import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/lib/supabase/useUser";
import { supabaseClient } from "@/lib/supabase/browser";

export function AvatarMenu() {
  const router = useRouter();
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="relative inline-block text-left">
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center rounded-full focus:outline-none">
          <Image
            src={user.user_metadata?.avatar_url ?? "/default-avatar.png"}
            alt="avatar"
            width={40}
            height={40}
            className="rounded-full border border-white"
          />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-150"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => router.push("/myPage")}
                    className={`${
                      active ? "bg-gray-100" : ""
                    } w-full text-left px-4 py-2 text-sm text-gray-700`}
                  >
                    マイページ
                  </button>
                )}
              </Menu.Item>

              <div className="border-t border-gray-200 my-1" />

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={async () => {
                      await supabaseClient.auth.signOut();
                      router.push("/login");
                    }}
                    className={`${
                      active ? "bg-gray-100" : ""
                    } w-full text-left px-4 py-2 text-sm text-gray-700`}
                  >
                    ログアウト
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

"use client";

import { Bell, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TopActionNavbar() {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-b">
      <div className="flex h-14 w-full items-center justify-end gap-2 mr-5">
        <button
          type="button"
          aria-label="Open notifications"
          onClick={() => router.push("/container/notification")}
          className="rounded-full p-2 text-gray-700 transition hover:bg-gray-100"
        >
          <Bell size={20} />
        </button>

        <button
          type="button"
          aria-label="Open profile"
          onClick={() => router.push("/Profile")}
          className="rounded-full p-2 text-gray-700 transition hover:bg-gray-100 mr-10"
        >
          <User size={20} />
        </button>
      </div>
    </div>
  );
}

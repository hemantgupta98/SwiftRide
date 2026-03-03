"use client";

import { Home, Layers, Map, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function BottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Ride", icon: Home, path: "/CuRider" },
    { name: "All Services", icon: Layers, path: "/CuService" },
    { name: "Travel", icon: Map, path: "/Travel" },
    { name: "Profile", icon: User, path: "/Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-white border-t shadow-md flex justify-around items-center z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;

        return (
          <button
            key={item.name}
            onClick={() => router.push(item.path)}
            className="flex flex-col items-center text-xs"
          >
            <Icon
              size={22}
              className={isActive ? "text-black" : "text-gray-400"}
            />
            <span
              className={isActive ? "text-black font-medium" : "text-gray-400"}
            >
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import BottomNavbar from "./bottomNavbar";
import TopActionNavbar from "./topActionNavbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hiddenRoutes = [
    "/",
    "/home",
    "/authCuLogin",
    "/authCustomer",
    "/rider/home",
  ];
  const showNavbars = !hiddenRoutes.includes(pathname);

  return (
    <div className={showNavbars ? "min-h-dvh pt-14 pb-16" : "min-h-dvh"}>
      {showNavbars && <TopActionNavbar />}
      {children}
      {showNavbars && <BottomNavbar />}
    </div>
  );
}

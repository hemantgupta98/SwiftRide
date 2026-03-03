"use client";

import { usePathname } from "next/navigation";
import BottomNavbar from "./bottomNavbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hiddenRoutes = ["/", "/home", "/authCuLogin", "/authCustomer"];
  const showBottomNavbar = !hiddenRoutes.includes(pathname);

  return (
    <div className={showBottomNavbar ? "min-h-dvh pb-16" : "min-h-dvh"}>
      {children}
      {showBottomNavbar && <BottomNavbar />}
    </div>
  );
}

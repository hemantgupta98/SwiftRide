"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  KanbanSquare,
  WorkflowIcon,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Workflow,
  User2Icon,
} from "lucide-react";
const links = [
  { name: "Dashboard", href: "/rider/home", icon: LayoutDashboard },
  { name: "Rides", href: "/rider/rides", icon: KanbanSquare },
  { name: "Map", href: "/rider/map", icon: Workflow },
  { name: "Ride History", href: "/rider/history", icon: Users },
  { name: "Earning", href: "/rider/earning", icon: WorkflowIcon },
  { name: "Profile", href: "/rider/profile", icon: User2Icon },
  { name: "Setting", href: "/rider/setting", icon: Settings },
  { name: "Help", href: "/rider/help", icon: HelpCircle },
  { name: "Logout", href: "/rider/logout", icon: LogOut },
];

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export default function Sidebar({ className, onNavigate }: SidebarProps) {
  return (
    <aside
      className={cn(
        "w-64 max-w-full shrink-0 overflow-y-auto bg-sky-900 border-r flex flex-col cursor-pointer text-gray-100",
        className,
      )}
    >
      <div className="p-6 text-2xl font-bold text-white">SwiftRide</div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-600"
          >
            <item.icon size={18} />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

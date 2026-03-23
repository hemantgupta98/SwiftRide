"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  User,
  HelpCircle,
  Wallet,
  Clock,
  Shield,
  Gift,
  Award,
  Ticket,
  Bell,
  ChevronRight,
} from "lucide-react";

type MenuItem = {
  title: string;
  subtitle?: string;
  href?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
};

const menuItems: MenuItem[] = [
  { title: "Help", icon: HelpCircle, href: "/container/help" },
  { title: "Payment", icon: Wallet, href: "/container/payment" },
  { title: "My Rides", icon: Clock, href: "/container/Rides" },
  { title: "Safety", icon: Shield, href: "/container/saftey" },
  {
    title: "Refer and Earn",
    subtitle: "Get ₹50",
    icon: Gift,
    href: "/container/refer",
  },
  { title: "My Rewards", icon: Award, href: "/container/rewards" },
  { title: "Power Pass", icon: Ticket, href: "/container/pass" },
  { title: "Notifications", icon: Bell, href: "/container/notification" },
];

export default function ProfilePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <div className="w-full px-4 sm:px-6 md:px-8 py-6">
        {/* Title */}
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">Profile</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          {/* User */}
          <div
            onClick={() => router.push("/container/user")}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-3 rounded-full">
                <User size={22} className="text-gray-600" />
              </div>

              <div>
                <p className="font-semibold text-gray-800">Hem Gupta</p>
                <p className="text-sm text-gray-500">9867742834</p>
              </div>
            </div>

            <ChevronRight className="text-gray-400" />
          </div>
        </div>

        {/* Menu List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const baseClassName =
              "flex items-center justify-between px-4 py-4 border-b last:border-none hover:bg-gray-50 cursor-pointer";

            const content = (
              <>
                <div className="flex items-center gap-3">
                  <Icon className="text-gray-500" size={20} />

                  <div>
                    <p className="text-gray-700 font-medium">{item.title}</p>

                    {item.subtitle && (
                      <p className="text-sm text-gray-500">{item.subtitle}</p>
                    )}
                  </div>
                </div>

                <ChevronRight className="text-gray-400" size={20} />
              </>
            );

            if (item.href) {
              return (
                <Link key={index} href={item.href} className={baseClassName}>
                  {content}
                </Link>
              );
            }

            return (
              <div key={index} className={baseClassName}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

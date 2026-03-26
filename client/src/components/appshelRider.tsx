"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Bell, Menu, PanelLeftClose, User, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { socket } from "../../lib/socket";
import { playHindiRideAlert } from "../../lib/rideAlertAudio";
import { Toaster, toast } from "sonner";

import Sidebar from "../components/layout/sidevar";

type AppShellRiderProps = Readonly<{
  children: ReactNode;
}>;

function formatRouteLabel(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const riderIndex = segments.indexOf("rider");
  const pageSegment =
    riderIndex >= 0 ? segments[riderIndex + 1] : segments.at(-1);

  if (!pageSegment) {
    return "Rider Dashboard";
  }

  return pageSegment
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

const RIDER_PENDING_RIDE_REQUEST_KEY = "rider_pending_ride_request";

const parseUserIdFromToken = (token: string) => {
  try {
    const base64UrlPayload = token.split(".")[1] || "";
    const base64Payload = base64UrlPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(base64UrlPayload.length / 4) * 4, "=");

    const payload = JSON.parse(atob(base64Payload));
    return payload?.id ? String(payload.id) : null;
  } catch {
    return null;
  }
};

export default function AppShellRider({ children }: AppShellRiderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pageTitle = useMemo(() => formatRouteLabel(pathname), [pathname]);

  const riderId = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const token = localStorage.getItem("token") || "";
    return parseUserIdFromToken(token);
  }, []);

  useEffect(() => {
    const sendLiveLocation = () => {
      if (!riderId) {
        return;
      }

      if (typeof navigator === "undefined" || !navigator.geolocation) {
        socket.emit("registerRider", { riderId });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;

          socket.emit("registerRider", {
            riderId,
            location: {
              lng: longitude,
              lat: latitude,
            },
          });

          socket.emit("updateRiderLocation", {
            riderId,
            lng: longitude,
            lat: latitude,
            isOnline: true,
          });
        },
        () => {
          socket.emit("registerRider", { riderId });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        },
      );
    };

    const onConnect = () => {
      if (riderId) {
        sendLiveLocation();
      }
    };

    const onNewRideRequest = (payload: unknown) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          RIDER_PENDING_RIDE_REQUEST_KEY,
          JSON.stringify(payload),
        );
      }

      if (pathname !== "/rider/rides") {
        playHindiRideAlert();
        toast("New ride request received");
        router.push("/rider/rides");
      }
    };

    socket.on("connect", onConnect);
    socket.on("newRideRequest", onNewRideRequest);

    socket.connect();

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("newRideRequest", onNewRideRequest);
    };
  }, [pathname, riderId, router]);

  return (
    <div className="h-dvh overflow-hidden bg-slate-100 text-slate-950">
      <Toaster richColors position="top-center" />
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/45 md:hidden">
          <button
            type="button"
            aria-label="Close rider navigation overlay"
            className="h-full w-full cursor-default"
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      <div
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transition-transform duration-300 ease-out md:hidden",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full flex-col border-r border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                SwiftRide
              </p>
              <h2 className="text-lg font-semibold text-slate-950">
                Rider Panel
              </h2>
            </div>

            <button
              type="button"
              aria-label="Close rider sidebar"
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <X className="size-5" />
            </button>
          </div>

          <Sidebar
            className="h-full border-r-0"
            onNavigate={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:block md:w-64">
        <Sidebar className="h-full" />
      </div>

      <div className="flex h-full flex-col md:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              aria-label="Open rider sidebar"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-full p-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 md:hidden"
            >
              <Menu className="size-5" />
            </button>

            <div className="hidden rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 md:inline-flex">
              <PanelLeftClose className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
                Rider Workspace
              </p>
              <h1 className="truncate text-lg font-semibold text-slate-950">
                {pageTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Open rider notifications"
                onClick={() => router.push("/rider/notification")}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <Bell className="size-5" />
              </button>

              <button
                type="button"
                aria-label="Open rider profile"
                onClick={() => router.push("/rider/profile")}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <User className="size-4" />
                <span className="hidden sm:inline">Profile</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

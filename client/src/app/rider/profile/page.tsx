"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { api } from "@/lib/api";

import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  FileText,
  Star,
} from "lucide-react";

export default function DriverProfile() {
  const [riderProfile, setRiderProfile] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    vechileType: "",
    vechileNumber: "",
  });
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchRiderProfile = async () => {
      try {
        const response = await api.get("/auth/me");
        const data = response?.data?.data;

        if (!mounted) {
          return;
        }

        if (!data || data.role !== "rider") {
          setProfileError("Rider profile only. Please login as rider.");
          setRiderProfile({
            name: "",
            email: "",
            contact: "",
            address: "",
            vechileType: "",
            vechileNumber: "",
          });
          return;
        }

        setProfileError("");
        setRiderProfile({
          name: String(data.name || ""),
          email: String(data.email || ""),
          contact: String(data.contact || ""),
          address: String(data.address || ""),
          vechileType: String(data.vechileType || ""),
          vechileNumber: String(data.vechileNumber || ""),
        });
      } catch {
        if (!mounted) {
          return;
        }
        setProfileError("Unable to load rider profile details.");
      }
    };

    fetchRiderProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const vehicleTypeLabel = riderProfile.vechileType
    ? riderProfile.vechileType
        .split("-")
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(" ")
    : "Not provided";

  return (
    <div className="min-h-screen bg-[#0b2e4d] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Driver Profile</h1>
          <p className="mt-1 text-sm text-gray-300 sm:text-base">
            Manage your personal identity, vehicle details, and legal
            documentation.
          </p>
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-xl bg-white text-black">
          <div className="flex flex-col gap-4 bg-linear-to-r from-green-400 to-blue-400 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
            <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-white sm:h-20 sm:w-20">
              <Image src="/logo.png" alt="driver" width={80} height={80} />
            </div>

            <div className="flex-1">
              <h2 className="flex flex-wrap items-center gap-2 text-xl font-semibold sm:text-2xl">
                {riderProfile.name || "Rider"}
                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                  Verified Driver
                </span>
              </h2>

              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-700 sm:text-sm">
                <Star size={16} className="text-green-600" />
                4.95 Rating • Member since Jan 2022 • 4,281 rides completed
              </p>
            </div>

            <button className="w-full rounded-lg bg-[#0b2e4d] px-4 py-2 text-white sm:w-auto">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="rounded-xl bg-white p-4 text-black sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-semibold flex gap-2 items-center">
                  <User size={18} /> Personal Information
                </h3>

                <button className="w-full rounded-md bg-[#0b2e4d] px-3 py-2 text-sm text-white sm:w-auto sm:py-1">
                  Edit Details
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Full Name"
                  icon={<User size={16} />}
                  value={riderProfile.name || "Not provided"}
                />
                <Input
                  label="Email Address"
                  icon={<Mail size={16} />}
                  value={riderProfile.email || "Not provided"}
                />
                <Input
                  label="Phone Number"
                  icon={<Phone size={16} />}
                  value={riderProfile.contact || "Not provided"}
                />
                <Input
                  label="Operating City"
                  icon={<MapPin size={16} />}
                  value={riderProfile.address || "Not provided"}
                />
              </div>
            </div>

            {/* Document Vault */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Document Vault</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DocCard
                  title="Driver's License"
                  status="Verified"
                  expire="Oct 12, 2026"
                />

                <DocCard
                  title="Vehicle Insurance"
                  status="Verified"
                  expire="Jan 30, 2025"
                />

                <DocCard
                  title="Registration (Form R-12)"
                  status="Pending"
                  expire="Dec 15, 2024"
                />

                <DocCard
                  title="Criminal Background Check"
                  status="Verified"
                  expire="Jun 04, 2025"
                />
              </div>
            </div>

            {/* Support Box */}
            <div className="flex flex-col gap-4 rounded-xl border border-dashed border-green-400 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="text-sm text-gray-300">
                Need help with verification? Our compliance team is available
                24/7.
              </p>

              <button className="w-full rounded-lg border border-green-400 px-4 py-2 text-green-400 sm:w-auto">
                Contact Support
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="space-y-6">
            {/* Vehicle Card */}
            <div className="overflow-hidden rounded-xl bg-white text-black">
              <div className="relative h-36 sm:h-40">
                <Image
                  src="/logo.png"
                  alt="car"
                  fill
                  className="object-cover"
                />

                <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Active Vehicle
                </span>
              </div>

              <div className="space-y-2 p-4">
                <h4 className="font-semibold">{vehicleTypeLabel}</h4>
                <p className="text-sm text-gray-600">Rider vehicle profile</p>

                <div className="text-sm wrap-break-word">
                  <p>
                    License Plate:{" "}
                    <b>{riderProfile.vechileNumber || "Not provided"}</b>
                  </p>
                  <p>
                    Color: <b>Not provided</b>
                  </p>
                  <p>
                    Vehicle Class: <b>{vehicleTypeLabel}</b>
                  </p>
                </div>

                <button className="w-full bg-green-500 text-white py-2 rounded-lg mt-2">
                  Switch Vehicle
                </button>
              </div>
            </div>

            {/* Verification Health */}
            <div className="space-y-4 rounded-xl bg-white p-4 text-black sm:p-5">
              <h4 className="font-semibold flex items-center gap-2">
                <ShieldCheck size={18} /> Verification Health
              </h4>

              <div>
                <p className="text-sm text-gray-600">Profile Completion</p>

                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-green-500 h-2 rounded-full w-[92%]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <StatCard label="Verified" value="12" />
                <StatCard label="Pending" value="1" />
              </div>

              <div className="bg-blue-900 text-white text-sm p-3 rounded-lg">
                Your account is currently in <b>Good Standing</b>.
              </div>
            </div>

            {/* Security Warning */}
            <div className="rounded-xl border border-red-400 bg-[#1d3654] p-4 text-white sm:p-5">
              <h4 className="text-red-400 font-semibold mb-2">
                Security Warning
              </h4>

              <p className="text-sm mb-4">
                Never share your verification codes with anyone.
              </p>

              <button className="border border-red-400 text-red-400 px-4 py-2 rounded-lg w-full">
                Report Suspicious Activity
              </button>
            </div>
          </div>
        </div>
        {profileError && (
          <div className="text-sm text-red-300">{profileError}</div>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  icon,
  value,
}: {
  label: string;
  icon: ReactNode;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>

      <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-100 gap-2">
        {icon}
        <input
          value={value}
          readOnly
          className="w-full truncate bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}

function DocCard({
  title,
  status,
  expire,
}: {
  title: string;
  status: string;
  expire: string;
}) {
  return (
    <div className="bg-white text-black p-4 rounded-xl border shadow-sm">
      <div className="flex justify-between mb-2">
        <FileText size={18} />

        <span
          className={`text-xs px-2 py-1 rounded-full ${
            status === "Verified"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status}
        </span>
      </div>

      <h4 className="font-medium">{title}</h4>

      <p className="text-xs text-gray-500 mb-3">Expires: {expire}</p>

      <div className="flex gap-2">
        <button className="text-sm text-blue-600">View</button>
        <button className="text-sm text-green-600">Upload New</button>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 border rounded-lg text-center py-3">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

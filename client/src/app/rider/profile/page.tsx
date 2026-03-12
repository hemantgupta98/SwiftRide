"use client";

import Image from "next/image";

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
  return (
    <div className="min-h-screen bg-[#0b2e4d] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Driver Profile</h1>
          <p className="text-gray-300">
            Manage your personal identity, vehicle details, and legal
            documentation.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl overflow-hidden text-black">
          <div className="bg-linear-to-r from-green-400 to-blue-400 p-6 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white">
              <Image src="/logo.png" alt="driver" width={80} height={80} />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                Alex Rivera
                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                  Verified Driver
                </span>
              </h2>

              <p className="flex items-center gap-2 text-sm text-gray-700">
                <Star size={16} className="text-green-600" />
                4.95 Rating • Member since Jan 2022 • 4,281 rides completed
              </p>
            </div>

            <button className="bg-[#0b2e4d] text-white px-4 py-2 rounded-lg">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="bg-white text-black rounded-xl p-6">
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold flex gap-2 items-center">
                  <User size={18} /> Personal Information
                </h3>

                <button className="bg-[#0b2e4d] text-white px-3 py-1 rounded-md text-sm">
                  Edit Details
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  icon={<User size={16} />}
                  value="Alex J Rivera"
                />
                <Input
                  label="Email Address"
                  icon={<Mail size={16} />}
                  value="alex@swiftride.com"
                />
                <Input
                  label="Phone Number"
                  icon={<Phone size={16} />}
                  value="+1 (555) 123-4567"
                />
                <Input
                  label="Operating City"
                  icon={<MapPin size={16} />}
                  value="San Francisco, CA"
                />
              </div>
            </div>

            {/* Document Vault */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Document Vault</h3>

              <div className="grid md:grid-cols-2 gap-4">
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
            <div className="border border-green-400 border-dashed p-6 rounded-xl flex justify-between items-center">
              <p className="text-sm text-gray-300">
                Need help with verification? Our compliance team is available
                24/7.
              </p>

              <button className="border border-green-400 text-green-400 px-4 py-2 rounded-lg">
                Contact Support
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="space-y-6">
            {/* Vehicle Card */}
            <div className="bg-white text-black rounded-xl overflow-hidden">
              <div className="relative h-36">
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

              <div className="p-4 space-y-2">
                <h4 className="font-semibold">Tesla Model 3</h4>
                <p className="text-sm text-gray-600">
                  Standard Range Plus (2022)
                </p>

                <div className="text-sm">
                  <p>
                    License Plate: <b>SWFT-772</b>
                  </p>
                  <p>
                    Color: <b>Space Silver</b>
                  </p>
                  <p>
                    Vehicle Class: <b>Swift Comfort</b>
                  </p>
                </div>

                <button className="w-full bg-green-500 text-white py-2 rounded-lg mt-2">
                  Switch Vehicle
                </button>
              </div>
            </div>

            {/* Verification Health */}
            <div className="bg-white text-black rounded-xl p-5 space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <ShieldCheck size={18} /> Verification Health
              </h4>

              <div>
                <p className="text-sm text-gray-600">Profile Completion</p>

                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-green-500 h-2 rounded-full w-[92%]" />
                </div>
              </div>

              <div className="flex gap-4">
                <StatCard label="Verified" value="12" />
                <StatCard label="Pending" value="1" />
              </div>

              <div className="bg-blue-900 text-white text-sm p-3 rounded-lg">
                Your account is currently in <b>Good Standing</b>.
              </div>
            </div>

            {/* Security Warning */}
            <div className="bg-[#1d3654] border border-red-400 text-white p-5 rounded-xl">
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
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>

      <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-100 gap-2">
        {icon}
        <input
          defaultValue={value}
          className="bg-transparent outline-none w-full text-sm"
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

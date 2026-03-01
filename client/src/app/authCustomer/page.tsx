"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { User, Mail, Lock, Eye, ArrowRight, ChevronLeft } from "lucide-react";

export default function CustomerSignupPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-linear-to-br from-[#0B1220] via-[#0E1A2F] to-[#08101E] flex flex-col items-center justify-between text-white relative">
      <div className="pt-10 flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 text-xl font-semibold">
          <div className="">
            <Image src="/logo.png" alt="logo" height={100} width={100} />
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
        >
          <ChevronLeft size={16} />
          Back to Role Selection
        </button>
      </div>

      {/* ================= FORM CARD ================= */}
      <div className="w-full flex justify-center px-4">
        <div className="bg-white text-gray-900 w-full max-w-md rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold">Get Started as Customer</h2>
          <p className="mt-2 text-sm text-gray-500">
            Create your account to start booking fast, reliable, and affordable
            rides.
          </p>

          {/* FORM */}
          <form className="mt-8 space-y-5">
            <Input
              label="Full Name"
              placeholder="Enter your name"
              icon={<User size={18} />}
            />

            <Input
              label="Email or Phone Number"
              placeholder="name@example.com"
              icon={<Mail size={18} />}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              icon={<Lock size={18} />}
              rightIcon={<Eye size={18} />}
            />

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              Continue as Customer <ArrowRight size={18} />
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4 text-xs text-gray-400">
            <div className="flex-1 h-px bg-gray-200" />
            OR CONTINUE WITH
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-4">
            <SocialButton label="Google" />
            <SocialButton label="Google" />
          </div>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <span className="text-green-600 font-medium cursor-pointer">
              Log In
            </span>
          </p>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="pb-6 text-xs text-gray-500 text-center px-4">
        <p>
          By clicking continue, you agree to our{" "}
          <span className="underline">Terms of Service</span> and{" "}
          <span className="underline">Privacy Policy</span>.
        </p>

        <div className="mt-4 flex justify-between max-w-7xl mx-auto">
          <span>© 2026 SwiftRide Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <span className="cursor-pointer">Privacy</span>
            <span className="cursor-pointer">Terms</span>
            <span className="cursor-pointer">Support</span>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function Input({
  label,
  placeholder,
  icon,
  rightIcon,
  type = "text",
}: {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          className="w-full border rounded-lg py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
            {rightIcon}
          </span>
        )}
      </div>
    </div>
  );
}

function SocialButton({ label }: { label: string }) {
  return (
    <button className="border rounded-lg py-3 flex items-center justify-center gap-2 text-sm hover:bg-gray-50 transition">
      <div className="w-5 h-5 bg-gray-300 rounded-sm" />
      {label}
    </button>
  );
}

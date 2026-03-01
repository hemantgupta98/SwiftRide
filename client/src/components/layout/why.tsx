"use client";

import {
  UserCheck,
  CreditCard,
  MapPin,
  Headphones,
  CheckCircle,
} from "lucide-react";

export default function SafetySectionPage() {
  return (
    <main className="bg-white text-gray-900">
      {/* ================= SAFETY SECTION ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-600 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            SAFE & RELIABLE
          </span>

          <h2 className="text-4xl font-bold leading-tight">
            Your Safety is Our Top Priority, <br />
            Every Time You Ride
          </h2>

          <p className="mt-4 text-gray-500">
            We&apos;ve built SwiftRide with industry-leading security features
            and a rigorous rider verification process to ensure you reach your
            destination with peace of mind.
          </p>
        </div>

        {/* Safety Cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <SafetyCard
            icon={<UserCheck />}
            title="Verified Riders"
            desc="Every rider undergoes a multi-step background check and mandatory safety training before joining our platform."
            color="bg-green-100 text-green-600"
          />
          <SafetyCard
            icon={<CreditCard />}
            title="Secure Payments"
            desc="All transactions are encrypted and processed through trusted partners. No cash handling means a safer environment."
            color="bg-blue-100 text-blue-600"
          />
          <SafetyCard
            icon={<MapPin />}
            title="Live Ride Tracking"
            desc="Share your live trip status with family or friends. Our 24/7 operations center monitors every ride."
            color="bg-gray-100 text-gray-700"
          />
          <SafetyCard
            icon={<Headphones />}
            title="24/7 Support"
            desc="Our dedicated safety team is always available to assist you. Emergency SOS integration is built into the app."
            color="bg-orange-100 text-orange-600"
          />
        </div>

        {/* CTA BAR */}
        <div className="mt-20 border rounded-2xl px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="text-green-500 mt-1" />
            <div>
              <h4 className="font-semibold">Join 100,000+ Safe Commuters</h4>
              <p className="text-sm text-gray-500">
                Experience the most trusted bike taxi service in the city. Fast,
                reliable, and always secure.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium">
              Get Started Now
            </button>
            <button className="border px-6 py-3 rounded-lg font-medium">
              View Safety Report
            </button>
          </div>
        </div>
      </section>

      <section className=" shadow-2xl p-5  rounded-md mb-10">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          <Stat value="99.9%" label="Safe Trip Rating" />
          <Stat value="50M+" label="Kilometers Tracked" />
          <Stat value="24/7" label="SOS Emergency Response" />
        </div>
      </section>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function SafetyCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="border rounded-2xl p-6 bg-white hover:shadow-md transition">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}
      >
        {icon}
      </div>
      <h4 className="font-semibold text-lg">{title}</h4>
      <p className="mt-2 text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>
    </div>
  );
}

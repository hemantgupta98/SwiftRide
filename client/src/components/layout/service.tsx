"use client";

import {
  Bike,
  Zap,
  Wallet,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function ServicesPage() {
  return (
    <main className="bg-white text-gray-900">
      {/* ================= SERVICES SECTION ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-600">
            OUR SERVICES
          </span>

          <h2 className="text-4xl font-bold leading-tight">
            Smart Mobility Solutions for{" "}
            <span className="text-green-500">Your Daily Commute</span>
          </h2>

          <p className="mt-4 text-gray-500">
            We&apos;re redefining urban transportation by providing a seamless,
            fast, and pocket-friendly alternative to traditional commuting
            methods.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ServiceCard
            icon={<Bike />}
            title="Bike Rides"
            desc="Navigate through city traffic effortlessly with our fleet of well-maintained, comfortable motorbikes."
          />
          <ServiceCard
            icon={<Zap />}
            title="Fast Pickup"
            desc="Average wait time of less than 3 minutes. Our smart dispatch system connects you instantly."
          />
          <ServiceCard
            icon={<Wallet />}
            title="Affordable Pricing"
            desc="Transparent pricing with no hidden charges. Save up to 50% compared to traditional cab services."
          />
          <ServiceCard
            icon={<ShieldCheck />}
            title="Safety First"
            desc="Every ride is insured and monitored. Our riders are verified professionals trained for safety."
          />
        </div>

        {/* CTA */}
        <div className="mt-20 bg-gray-50 rounded-2xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold">
              Ready to start your journey?
            </h3>
            <p className="mt-1 text-gray-500">
              Join 50,000+ happy commuters using SwiftRide daily.
            </p>
          </div>

          <div className="flex gap-4">
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium">
              Get Started Now
            </button>
            <button className="border px-6 py-3 rounded-lg font-medium">
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* ================= FEATURE IMAGE SECTION ================= */}
      <section className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1603570419989-8f5f5a4f9c75"
              alt="Professional using app"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div>
            <h3 className="text-3xl font-bold">
              Designed for the{" "}
              <span className="text-blue-600">Modern Professional</span>
            </h3>

            <ul className="mt-8 space-y-4">
              <Feature
                title="Live Tracking"
                desc="Share your trip details with loved ones in real-time."
              />
              <Feature
                title="Digital Payments"
                desc="Go cashless with our secure integrated wallet system."
              />
              <Feature
                title="Verified Riders"
                desc="Rigorous background checks for every rider on the platform."
              />
            </ul>

            <button className="mt-8 text-green-600 font-medium flex items-center gap-2 hover:gap-3 transition-all">
              Learn more about our platform <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function ServiceCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition">
      <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="font-semibold text-lg">{title}</h4>
      <p className="mt-2 text-sm text-gray-500">{desc}</p>
      <button className="mt-4 text-green-600 text-sm font-medium">
        Learn More
      </button>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <li className="flex gap-3">
      <CheckCircle className="text-green-500 mt-1" size={20} />
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </li>
  );
}

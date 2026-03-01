"use client";

import { CheckCircle, ArrowRight } from "lucide-react";

export default function StepsPage() {
  return (
    <main className="bg-white text-gray-900">
      {/* SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold">
            Your Journey in{" "}
            <span className="text-green-500">4 Simple Steps</span>
          </h2>
          <p className="mt-4 text-gray-500">
            We&apos;ve redesigned urban mobility to be as simple as a few taps
            on your phone. No more waiting for buses or getting stuck in car
            traffic.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <Step
            step="01"
            title="Enter Location"
            desc="Open the SwiftRide app and type in your destination to see available bike rides nearby."
            img="https://images.unsplash.com/photo-1523961131990-5ea7c61b2107"
          />
          <Step
            step="02"
            title="Choose Ride"
            desc="Compare ride options and transparent pricing. Select the bike that fits your budget and timing."
            img="https://images.unsplash.com/photo-1615874959474-d609969a20ed"
          />
          <Step
            step="03"
            title="Get Matched"
            desc="Our smart algorithm pairs you with the closest verified rider within seconds."
            img="https://images.unsplash.com/photo-1600180758890-6b94519a8ba6"
          />
          <Step
            step="04"
            title="Reach Destination"
            desc="Hop on, enjoy a safe ride through traffic, and arrive quickly and affordably."
            img="https://images.unsplash.com/photo-1595433707802-9b4d57bb40f3"
          />
        </div>

        {/* CTA Card */}
        <div className="mt-20 flex justify-center">
          <div className="border rounded-2xl p-8 max-w-xl w-full text-center shadow-sm">
            <h3 className="text-xl font-semibold">
              Ready to take your first ride?
            </h3>
            <p className="mt-2 text-gray-500">
              Join thousands of riders saving time and money every day.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                Book Your First Ride <ArrowRight size={18} />
              </button>
              <button className="border px-6 py-3 rounded-lg font-medium">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Features */}
      <section className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <Feature
            title="Real-time Tracking"
            desc="Share your trip status with friends and family for extra peace of mind."
          />
          <Feature
            title="Insured Trips"
            desc="Every ride is covered by our comprehensive insurance policy from start to finish."
          />
          <Feature
            title="24/7 Support"
            desc="Our dedicated safety team is always available to assist you with any concerns."
          />
        </div>
      </section>
    </main>
  );
}

/* ---------------- Components ---------------- */

function Step({
  step,
  title,
  desc,
  img,
}: {
  step: string;
  title: string;
  desc: string;
  img: string;
}) {
  return (
    <div className="text-center">
      {/* Step number */}
      <div className="flex justify-center mb-4">
        <span className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
          {step}
        </span>
      </div>

      {/* Image */}
      <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[4/3]">
        <img src={img} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* Text */}
      <h4 className="mt-4 font-semibold text-lg">{title}</h4>
      <p className="mt-2 text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <CheckCircle className="text-green-500" />
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-gray-500 max-w-xs">{desc}</p>
    </div>
  );
}

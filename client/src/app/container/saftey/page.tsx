"use client";

import React from "react";
import {
  ShieldCheck,
  PhoneCall,
  MapPin,
  UserCheck,
  Eye,
  Siren,
  HeartHandshake,
} from "lucide-react";

const page = () => {
  const safetyFeatures = [
    {
      icon: ShieldCheck,
      title: "Verified Drivers",
      desc: "All SwiftRide drivers go through strict background verification, document checks, and driving record validation before joining the platform.",
    },
    {
      icon: MapPin,
      title: "Live Ride Tracking",
      desc: "Track your ride in real time. Your location and route are visible during the trip so you and your loved ones always know where you are.",
    },
    {
      icon: PhoneCall,
      title: "Emergency Support",
      desc: "During any ride you can instantly contact emergency support or share your ride details with family and friends for extra safety.",
    },
    {
      icon: Eye,
      title: "Trip Monitoring",
      desc: "SwiftRide continuously monitors active rides to detect unusual route changes, long stops, or suspicious activity.",
    },
    {
      icon: Siren,
      title: "SOS Button",
      desc: "In case of emergency, press the SOS button in the app to quickly alert our support team and emergency contacts.",
    },
    {
      icon: UserCheck,
      title: "Driver Identity Display",
      desc: "Before your ride starts you can see driver details, vehicle number, photo, and ratings so you always know who is picking you up.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 p-10">
      {/* Header */}

      <div className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold text-orange-500 mb-6">
          SwiftRide Safety
        </h1>

        <p className="text-gray-700 text-lg leading-8 max-w-3xl mx-auto">
          At <span className="text-orange-500 font-semibold">SwiftRide</span>,
          safety is our highest priority. We are committed to providing a secure
          and reliable ride experience for every rider including women, men, and
          all users using our platform. Our system is designed with multiple
          safety features that protect riders before, during, and after every
          trip. From verified drivers to real-time ride tracking and emergency
          assistance, SwiftRide ensures that every journey remains safe and
          comfortable.
        </p>
      </div>

      {/* Safety Features */}

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {safetyFeatures.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition duration-300 border border-orange-100"
            >
              <div className="bg-orange-100 w-14 h-14 flex items-center justify-center rounded-xl mb-5">
                <Icon className="text-orange-500" size={28} />
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-7">{feature.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Women Safety Section */}

      <div className="max-w-6xl mx-auto mt-20 bg-white p-10 rounded-3xl shadow-xl border border-orange-100">
        <div className="flex items-center gap-4 mb-6">
          <HeartHandshake className="text-orange-500" size={40} />
          <h2 className="text-3xl font-bold text-gray-800">
            Women Rider Safety
          </h2>
        </div>

        <p className="text-gray-700 leading-8 text-lg">
          SwiftRide is deeply committed to ensuring a safe travel experience for
          women riders. Our platform includes features designed specifically to
          enhance safety and comfort during every trip. Women riders can easily
          share live ride tracking with trusted contacts, access emergency
          assistance directly from the app, and view complete driver identity
          details before the ride begins. Drivers are verified through strict
          background checks and identity verification to ensure reliability.
        </p>

        <p className="text-gray-700 leading-8 text-lg mt-5">
          Our safety system monitors rides in real time and detects unusual
          behavior such as route deviations or unexpected stops. If any safety
          concern occurs, our support team is ready to respond quickly. With
          these protections in place, SwiftRide aims to create a transportation
          platform where women can travel confidently and safely at any time of
          the day.
        </p>
      </div>

      {/* Footer Safety Message */}

      <div className="max-w-5xl mx-auto text-center mt-16">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Your Safety Is Our Responsibility
        </h3>

        <p className="text-gray-600 leading-8">
          SwiftRide continuously improves its safety technology to protect all
          riders and drivers. Our goal is to make every journey safe, reliable,
          and comfortable for everyone using our platform.
        </p>
      </div>
    </div>
  );
};

export default page;

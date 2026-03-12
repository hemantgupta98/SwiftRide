"use client";

import { Search, MapPin, Wallet, AlertCircle, Phone, Mail } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="w-full min-h-screen bg-[#082f56] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold">How can we help you today?</h1>

          <p className="text-gray-300">
            Search our knowledge base for instant answers or reach out to our
            24/7 dedicated driver support team.
          </p>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input
              placeholder="Search for topics, articles, or issues..."
              className="w-full bg-[#0b3d6e] border border-blue-500 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Quick Troubleshooting */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-green-400">●</span> Quick Troubleshooting
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white text-gray-700 rounded-xl p-6 flex gap-4">
              <MapPin className="text-green-500" />
              <div>
                <h3 className="font-semibold">GPS Issues</h3>
                <p className="text-sm text-gray-500">
                  Having trouble with navigation or location accuracy?
                </p>
              </div>
            </div>

            <div className="bg-white text-gray-700 rounded-xl p-6 flex gap-4">
              <Wallet className="text-green-500" />
              <div>
                <h3 className="font-semibold">Payout Status</h3>
                <p className="text-sm text-gray-500">
                  Check why your weekly earnings haven&apos;t arrived yet.
                </p>
              </div>
            </div>

            <div className="bg-white text-gray-700 rounded-xl p-6 flex gap-4">
              <AlertCircle className="text-green-500" />
              <div>
                <h3 className="font-semibold">App Crashing</h3>
                <p className="text-sm text-gray-500">
                  Follow steps to clear cache and restart SwiftRide Rider.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Common Help Topics */}
        <section className="grid md:grid-cols-3 gap-6">
          {/* Account */}
          <div className="bg-white rounded-xl p-6 text-gray-700 space-y-4">
            <h3 className="font-semibold text-lg">Account & Security</h3>

            <ul className="space-y-2 text-sm">
              <li>Updating phone number</li>
              <li>Password recovery</li>
              <li>Background check status</li>
              <li>Device management</li>
            </ul>

            <button className="text-green-600 text-sm font-medium">
              View all Account & Security articles
            </button>
          </div>

          {/* Earnings */}
          <div className="bg-white rounded-xl p-6 text-gray-700 space-y-4">
            <h3 className="font-semibold text-lg">Earnings & Wallet</h3>

            <ul className="space-y-2 text-sm">
              <li>Instant Pay eligibility</li>
              <li>Understanding fees</li>
              <li>Tax documents (1099)</li>
              <li>Referral bonuses</li>
            </ul>

            <button className="text-green-600 text-sm font-medium">
              View all Earnings & Wallet articles
            </button>
          </div>

          {/* Safety */}
          <div className="bg-white rounded-xl p-6 text-gray-700 space-y-4">
            <h3 className="font-semibold text-lg">Safety & Support</h3>

            <ul className="space-y-2 text-sm">
              <li>Reporting an accident</li>
              <li>Rider behavior policy</li>
              <li>Emergency assistance</li>
              <li>Lost item recovery</li>
            </ul>

            <button className="text-green-600 text-sm font-medium">
              View all Safety & Support articles
            </button>
          </div>
        </section>

        {/* Bottom Grid */}
        <section className="grid md:grid-cols-3 gap-6">
          {/* Contact Support Form */}
          <div className="md:col-span-2 bg-white rounded-xl p-6 text-gray-700 space-y-4">
            <h3 className="text-lg font-semibold">Contact Support</h3>

            <p className="text-sm text-gray-500">
              Can&lsquo;t find what you&lsquo;re looking for? Submit a ticket
              and our agents will get back to you within 2 hours.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                placeholder="Issue Category"
                className="bg-gray-100 rounded-lg p-3"
              />

              <input
                placeholder="Ticket Priority"
                className="bg-gray-100 rounded-lg p-3"
              />
            </div>

            <input
              placeholder="Subject"
              className="bg-gray-100 rounded-lg p-3 w-full"
            />

            <textarea
              placeholder="Detailed Description"
              rows={5}
              className="bg-gray-100 rounded-lg p-3 w-full"
            />

            <button className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium">
              Submit Support Ticket
            </button>
          </div>

          {/* Right Side Info */}
          <div className="space-y-6">
            {/* Policies */}
            <div className="bg-white rounded-xl p-6 text-gray-700 space-y-2">
              <h3 className="font-semibold">Policies & Agreements</h3>

              <ul className="text-sm space-y-2">
                <li>Driver Services Agreement</li>
                <li>Privacy Policy</li>
                <li>Community Guidelines</li>
                <li>Safety Standards</li>
              </ul>
            </div>

            {/* Emergency */}
            <div className="bg-white rounded-xl p-6 text-gray-700 space-y-3">
              <h3 className="font-semibold">Emergency Contact</h3>

              <div className="flex items-center gap-2">
                <Phone size={18} />
                <span>+1 (800) SWIFT-HELP</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail size={18} />
                <span>priority@swiftride.com</span>
              </div>

              <p className="text-green-500 text-sm">
                Average Response: 15 mins
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

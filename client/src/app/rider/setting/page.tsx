"use client";

import { useState } from "react";
import { Input } from "@/src/components/ui/input";

export default function RiderSettingsPage() {
  const [pushNotification, setPushNotification] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [autoAccept, setAutoAccept] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <div className="min-h-screen bg-[#0b3556] text-white flex justify-center py-10 px-6">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="bg-green-600 text-xs px-3 py-1 rounded-full">
              System Configuration
            </span>

            <h1 className="text-3xl font-bold mt-3">Settings & Preferences</h1>

            <p className="text-gray-300 text-sm mt-1">
              Configure your driving experience, notifications, and account
              security.
            </p>
          </div>

          <button className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-lg font-semibold">
            Save All Changes
          </button>
        </div>

        {/* Notification Center */}
        <div className="bg-white text-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold">Notification Center</h2>

          {/* Push Notification */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-500">
                Receive real-time ride requests and system alerts.
              </p>
            </div>

            <Input
              type="checkbox"
              checked={pushNotification}
              onChange={() => setPushNotification(!pushNotification)}
              className="w-5 h-5"
            />
          </div>

          {/* SMS */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">SMS Alerts</p>
              <p className="text-sm text-gray-500">
                Receive important account updates via SMS.
              </p>
            </div>

            <Input
              type="checkbox"
              checked={smsAlerts}
              onChange={() => setSmsAlerts(!smsAlerts)}
              className="w-5 h-5"
            />
          </div>

          {/* Email */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Digest</p>
              <p className="text-sm text-gray-500">
                Weekly earnings and performance reports.
              </p>
            </div>

            <select className="border rounded-md px-3 py-1">
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Off</option>
            </select>
          </div>
        </div>

        {/* Driving Preferences */}
        <div className="bg-white text-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold">Driving Preferences</h2>

          {/* Auto Accept */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">Auto-Accept Requests</p>
              <p className="text-sm text-gray-500">
                Automatically accept ride requests within your range.
              </p>
            </div>

            <Input
              type="checkbox"
              checked={autoAccept}
              onChange={() => setAutoAccept(!autoAccept)}
              className="w-5 h-5"
            />
          </div>

          {/* Pickup Distance */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">Max Pickup Distance</p>
              <p className="text-sm text-gray-500">
                Limit ride requests within selected radius.
              </p>
            </div>

            <select className="border rounded-md px-3 py-1">
              <option>Under 10 km</option>
              <option>Under 20 km</option>
              <option>Under 30 km</option>
            </select>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">App Language</p>
              <p className="text-sm text-gray-500">
                Choose preferred language.
              </p>
            </div>

            <select className="border rounded-md px-3 py-1">
              <option>English (US)</option>
              <option>Hindi</option>
              <option>Spanish</option>
            </select>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white text-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold">Security & Privacy</h2>

          {/* 2FA */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">
                Add extra security with SMS verification.
              </p>
            </div>

            <Input
              type="checkbox"
              checked={twoFactor}
              onChange={() => setTwoFactor(!twoFactor)}
              className="w-5 h-5"
            />
          </div>

          {/* Login History */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Login History</p>
              <p className="text-sm text-gray-500">
                Monitor recent devices and login locations.
              </p>
            </div>

            <button className="bg-blue-600 text-white px-4 py-1 rounded-md">
              View History
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white text-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold">Account Administration</h2>

          {/* Payment */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">Payment Methods</p>
              <p className="text-sm text-gray-500">
                Manage payout accounts and cards.
              </p>
            </div>

            <button className="text-green-600 font-medium">Edit</button>
          </div>

          {/* Delete */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Data & Privacy</p>
              <p className="text-sm text-gray-500">
                Download your data or delete account.
              </p>
            </div>

            <button className="text-red-500 font-semibold">
              Delete Account
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white/20 border border-dashed border-white/30 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold">Need more help?</h3>

          <p className="text-sm text-gray-200 mt-2">
            If you have questions about your account or need to change your
            registered vehicle, please contact our 24/7 support team.
          </p>

          <button className="mt-4 bg-blue-600 px-5 py-2 rounded-lg">
            Visit Support Center
          </button>
        </div>
      </div>
    </div>
  );
}

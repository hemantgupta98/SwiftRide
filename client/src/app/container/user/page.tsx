/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Save,
  Star,
  Wallet,
  Bike,
} from "lucide-react";
import { Input } from "../../../components/ui/input";

const Page = () => {
  const [edit, setEdit] = useState(false);

  const [profile, setProfile] = useState({
    name: "Hemant Gupta",
    email: "hemant@email.com",
    phone: "+91 9876543210",
    location: "Jamshedpur, Jharkhand",
  });

  const stats = {
    rides: 24,
    wallet: 350,
    rating: 4.8,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = () => {
    setEdit(false);
    alert("Profile Updated Successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 flex justify-center items-center">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-8">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>

          {!edit ? (
            <button
              onClick={() => setEdit(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Pencil size={16} /> Edit
            </button>
          ) : (
            <button
              onClick={saveProfile}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Save size={16} /> Save
            </button>
          )}
        </div>

        {/* PROFILE SECTION */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* LEFT PROFILE */}
          <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 shadow">
            {/**  <Image
              src="https://i.pravatar.cc/150"
              className="w-28 h-28 rounded-full border-4 border-indigo-500"
            /> */}

            <h2 className="text-xl font-semibold mt-3">{profile.name}</h2>
            <p className="text-gray-500 text-sm">Premium User</p>

            <button className="mt-4 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              Change Photo
            </button>
          </div>

          {/* RIGHT DETAILS */}
          <div className="md:col-span-2 space-y-4">
            {/* NAME */}
            <div className="flex items-center gap-3">
              <User className="text-indigo-600" />
              <Input
                disabled={!edit}
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* EMAIL */}
            <div className="flex items-center gap-3">
              <Mail className="text-indigo-600" />
              <Input
                disabled={!edit}
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* PHONE */}
            <div className="flex items-center gap-3">
              <Phone className="text-indigo-600" />
              <Input
                disabled={!edit}
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* LOCATION */}
            <div className="flex items-center gap-3">
              <MapPin className="text-indigo-600" />
              <Input
                disabled={!edit}
                name="location"
                value={profile.location}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* USER STATS */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-indigo-50 p-4 rounded-xl flex items-center gap-3">
            <Bike className="text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Total Rides</p>
              <h3 className="font-bold text-lg">{stats.rides}</h3>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3">
            <Wallet className="text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Wallet Balance</p>
              <h3 className="font-bold text-lg">₹{stats.wallet}</h3>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl flex items-center gap-3">
            <Star className="text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <h3 className="font-bold text-lg">{stats.rating}</h3>
            </div>
          </div>
        </div>

        {/* SECURITY SECTION */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-lg font-semibold mb-3">Account Security</h2>

          <div className="flex gap-4 flex-wrap">
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
              Change Password
            </button>

            <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

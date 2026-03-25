"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Save,
  Loader2,
  AtSign,
  FileText,
} from "lucide-react";
import { Input } from "../../../components/ui/input";
import { api } from "@/lib/api";

type CustomerProfile = {
  name: string;
  email: string;
  username: string;
  contact: string;
  address: string;
  bio: string;
};

const Page = () => {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState<CustomerProfile>({
    name: "",
    email: "",
    username: "",
    contact: "",
    address: "",
    bio: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/auth/me");
      const data = response?.data?.data;

      if (!data || data.role !== "customer") {
        setError("Customer profile not found. Please login as customer.");
        return;
      }

      setProfile({
        name: String(data.name || ""),
        email: String(data.email || ""),
        username: String(data.username || ""),
        contact: String(data.contact || ""),
        address: String(data.address || ""),
        bio: String(data.bio || ""),
      });
    } catch {
      setError("Unable to load user profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        username: profile.username,
        contact: profile.contact,
        address: profile.address,
        bio: profile.bio,
      };

      const response = await api.patch("/auth/me", payload);
      const data = response?.data?.data;

      if (data) {
        setProfile((prev) => ({
          ...prev,
          username: String(data.username || ""),
          contact: String(data.contact || ""),
          address: String(data.address || ""),
          bio: String(data.bio || ""),
        }));
      }

      setEdit(false);
      alert("Profile updated successfully!");
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const isConfirmed = window.confirm("Are you sure you want to logout?");
    if (!isConfirmed) return;

    try {
      setLoggingOut(true);
      await api.post("/auth/logout");
    } catch {
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        document.cookie = "token=; Max-Age=0; path=/;";
        document.cookie = "auth_token=; Max-Age=0; path=/;";
      }
      router.replace("/empty");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 flex justify-center items-center">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-8 flex items-center justify-center gap-2 text-gray-700">
          <Loader2 className="animate-spin" size={18} /> Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 flex justify-center items-center">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-8">
        <Toaster position="top-center" richColors />
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
              disabled={saving}
              onClick={saveProfile}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

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
          </div>

          {/* RIGHT DETAILS */}
          <div className="md:col-span-2 space-y-4">
            {/* NAME */}
            <div className="flex items-center gap-3">
              <User className="text-indigo-600" />
              <Input
                disabled
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
                disabled
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* USERNAME */}
            <div className="flex items-center gap-3">
              <AtSign className="text-indigo-600" />
              <Input
                disabled={!edit}
                name="username"
                value={profile.username}
                onChange={handleChange}
                placeholder="Add username"
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* PHONE */}
            <div className="flex items-center gap-3">
              <Phone className="text-indigo-600" />
              <Input
                disabled={!edit}
                name="contact"
                value={profile.contact}
                onChange={handleChange}
                placeholder="Add phone number"
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* LOCATION */}
            <div className="flex items-center gap-3">
              <MapPin className="text-indigo-600" />
              <Input
                disabled={!edit}
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="Add address"
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* BIO */}
            <div className="flex items-center gap-3">
              <FileText className="text-indigo-600" />
              <Input
                disabled={!edit}
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Add short bio"
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <p className="text-xs text-gray-500">
              Name and email come from signup data and cannot be edited.
            </p>
          </div>
        </div>

        {/* SECURITY SECTION */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-lg font-semibold mb-3">Account Security</h2>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => toast.info("work on progress")}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Change Password
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-60"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

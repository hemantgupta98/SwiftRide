"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  return (
    <nav className="flex items-center justify-between px-5 py-6">
      <div className="text-xl font-bold text-primary">
        <Image src="/logo.png" alt="logo" height={150} width={150} />
      </div>
      <div className="hidden md:flex gap-6 text-sm">
        <a href="#" className=" text-xl font-semibold">
          Services
        </a>
        <a href="#" className=" text-xl font-semibold">
          How It Works
        </a>
        <a href="#" className=" text-xl font-semibold">
          Safety
        </a>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/authCustomer")}
          className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
        >
          Login
        </button>
        <button className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition">
          Get start
        </button>
      </div>
    </nav>
  );
}

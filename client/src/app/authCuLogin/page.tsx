/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { Mail, Lock, ChevronLeft } from "lucide-react";
import { forwardRef, useState } from "react";
import { Toaster, toast } from "sonner";
import SocialButton from "@/src/components/ui/socialButton";

type InputData = {
  email: string;
  password: string;
};

type RiderData = {
  email: string;
  password: string;
};

export default function CustomerSignupPage() {
  const customerForm = useForm<InputData>();
  const riderForm = useForm<RiderData>();
  const [mode, setMode] = useState<"customer" | "rider">("customer");
  const {
    register: registerCustomer,
    handleSubmit: handleCustomerSubmit,
    formState: { errors: customerErrors },
    reset: resetCustomer,
  } = customerForm;

  const {
    register: registerRider,
    handleSubmit: handleRiderSubmit,
    formState: { errors: riderErrors },
    reset: resetRider,
  } = riderForm;

  const onSubmitCustomer: SubmitHandler<InputData> = async (data) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      let result;
      const contentType = res.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        result = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || "Invalid server response");
      }

      if (!res.ok) {
        toast.error(result.message || "Authentication failed");
        return resetCustomer();
      }

      if (mode === "customer" && result?.token) {
        localStorage.setItem("token", result.token);
      }

      toast.success("Login successfully");

      router.push("/CuRider");
    } catch (error: any) {
      console.error("AUTH ERROR 👉", error);
      toast.error(error.message || "Server error");
    }
    resetCustomer();
  };

  const onSubmitRider: SubmitHandler<RiderData> = async (data) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/auth/riderlogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      let result;
      const contentType = res.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        result = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || "Invalid server response");
      }

      if (!res.ok) {
        toast.error(result.message || "Authentication failed");
        return resetCustomer();
      }

      if (mode === "rider" && result?.token) {
        localStorage.setItem("token", result.token);
      }

      toast.success("Login successfully");

      router.push("/rider/home");
    } catch (error: any) {
      console.error("AUTH ERROR 👉", error);
      toast.error(error.message || "Server error");
    }
    resetRider();
  };

  const router = useRouter();
  return (
    <main className="min-h-screen bg-linear-to-br from-[#0B1220] via-[#0E1A2F] to-[#08101E] flex flex-col items-center justify-between text-white relative">
      <div className="pt-2 flex flex-col items-center gap-6">
        <Toaster position="top-center" richColors />
        {/* Logo */}
        <div className="flex items-center gap-2 text-xl font-semibold">
          <div className="">
            <Image src="/logo.png" alt="logo" height={100} width={100} />
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => router.push("/home")}
          className="flex items-center mb-2 gap-2 text-sm text-gray-300 hover:text-white"
        >
          <ChevronLeft size={16} />
          Back to Role Selection
        </button>
      </div>

      <div className="w-full flex justify-center px-4 ">
        <div className="bg-white text-gray-900 w-full max-w-md rounded-2xl shadow-xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode("customer")}
              className={`flex-1 py-2 rounded-lg font-medium ${
                mode === "customer" ? "bg-green-500 text-white" : "border"
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setMode("rider")}
              className={`flex-1 py-2 rounded-lg font-medium ${
                mode === "rider" ? "bg-green-500 text-white" : "border"
              }`}
            >
              Rider
            </button>
          </div>

          {mode === "customer" && (
            <>
              <h2 className="text-2xl font-bold">Login Started as Customer</h2>
              <p className="mt-2 text-sm text-gray-500">
                Start booking fast, reliable, and affordable rides.
              </p>

              {/* FORM */}
              <form
                className="mt-8 space-y-5"
                onSubmit={handleCustomerSubmit(onSubmitCustomer)}
              >
                <Input
                  label="Email"
                  placeholder="name@example.com"
                  icon={<Mail size={18} />}
                  {...registerCustomer("email", {
                    required: "Enter your email",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Enter a valid email",
                    },
                  })}
                />
                {customerErrors.email && (
                  <p className="text-red-500 text-sm">
                    {customerErrors.email.message}
                  </p>
                )}

                <Input
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  icon={<Lock size={18} />}
                  {...registerCustomer("password", {
                    required: "Enter your strong password",
                  })}
                />
                {customerErrors.password && (
                  <p className="text-red-500 text-sm">
                    {customerErrors.password.message}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-green-500 font-medium text-white py-3 rounded-lg"
                >
                  Login as a Customer
                </button>
              </form>
            </>
          )}

          {mode === "rider" && (
            <>
              <h2 className="text-2xl font-bold">Login Started as Rider</h2>
              <p className="mt-2 text-sm text-gray-500">
                Start earning money by offering fast, reliable, and affordable
                rides.
              </p>
              <form
                className="mt-8 space-y-5"
                onSubmit={handleRiderSubmit(onSubmitRider)}
              >
                <Input
                  label="Email"
                  placeholder="name@example.com"
                  icon={<Mail size={18} />}
                  {...registerRider("email", {
                    required: "Enter your email",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Enter a valid email",
                    },
                  })}
                />
                {riderErrors.email && (
                  <p className="text-red-500 text-sm">
                    {riderErrors.email.message}
                  </p>
                )}

                <Input
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  icon={<Lock size={18} />}
                  {...registerRider("password", {
                    required: "Enter your strong password",
                  })}
                />
                {riderErrors.password && (
                  <p className="text-red-500 text-sm">
                    {riderErrors.password.message}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-green-500 font-medium text-white py-3 rounded-lg"
                >
                  Login as a Rider
                </button>
              </form>
            </>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center gap-4 text-xs text-gray-400">
            <div className="flex-1 h-px bg-gray-200" />
            OR CONTINUE WITH
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social */}
          <div className="grid grid-col-1 gap-4">
            <SocialButton label="Google" />
          </div>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Create an account?{" "}
            <span
              onClick={() => router.push("/authCustomer")}
              className="text-green-600 font-medium cursor-pointer"
            >
              Sign In
            </span>
          </p>
        </div>
      </div>

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

const Input = forwardRef<
  HTMLInputElement,
  {
    label: string;
    placeholder: string;
    icon: React.ReactNode;
    rightIcon?: React.ReactNode;
    type?: string;
  }
>(({ label, placeholder, icon, rightIcon, type = "text", ...rest }, ref) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>

        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          {...rest}
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
});

Input.displayName = "Input";

"use client";
import { useRouter } from "next/navigation";
import { BikeIcon, Bike, CarTaxiFront } from "lucide-react";

const CuServicePage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen rounded-2xl shadow-2xl m-5 p-8 bg-white">
      <h1 className="text-orange-400 text-2xl font-semibold">Our Services</h1>

      <div className="grid grid-cols-3 gap-10 mt-10">
        {/* Car */}
        <div
          onClick={() => router.push("/startRide")}
          className="flex flex-col items-center gap-4  bg-blue-100 rounded-md shadow-2xl"
        >
          <div className="w-32 h-32 flex items-center mt-5 justify-center bg-gray-100 border-2 border-dashed border-red-700 rounded-xl">
            <CarTaxiFront size={60} className="text-red-700 cursor-pointer" />
          </div>
          <p className="text-lg font-semibold cursor-pointer text-orange-400">
            Car
          </p>
        </div>

        {/* Bike */}
        <div
          onClick={() => router.push("/startRide")}
          className="flex flex-col items-center gap-4 bg-red-100 rounded-md shadow-2xl"
        >
          <div className="w-32 h-32 flex items-center mt-5 justify-center bg-gray-100  border-2 border-dashed border-blue-500 rounded-xl ">
            <Bike size={60} className="text-blue-500 cursor-pointer" />
          </div>
          <p className="text-lg cursor-pointer font-semibold text-orange-400">
            Bike
          </p>
        </div>

        {/* EV Bike */}
        <div
          onClick={() => router.push("/startRide")}
          className="flex flex-col items-center gap-4 bg-orange-100 rounded-md shadow-2xl"
        >
          <div className="w-32 h-32 flex items-center justify-center bg-gray-100 border-2 border-dashed border-blue-300 rounded-xl mt-5">
            <BikeIcon size={60} className="text-blue-300 cursor-pointer" />
          </div>
          <p className="text-lg cursor-pointer font-semibold text-orange-400">
            EV Bike
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-orange-100 bg-linear-to-br from-orange-50 via-white  to-amber-50 p-5 shadow-sm mt-10">
        <p className="text-[20px] leading-9 font-medium text-gray-700 tracking-wide [word-spacing:0.22em]">
          <span className="rounded-md px-2 py-1 font-semibold text-orange-600 text-[22px]">
            SwiftRide
          </span>{" "}
          offers vehicle services including Car, Bike, and EV-Bike rides
          designed to provide safe, reliable, and affordable transportation. All
          drivers are verified professionals with valid driving licenses, proper
          vehicle documents, and background checks to ensure passenger safety.
          We focus on secure rides, well-maintained vehicles, real-time
          tracking, and quick bookings for a smooth travel experience. Whether
          you need a fast bike ride, an eco-friendly EV-Bike, or a comfortable
          car trip, our service ensures safety, punctuality, and customer
          satisfaction every time.
        </p>
      </div>
      <div className="rounded-2xl border border-orange-100 bg-linear-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm mt-10">
        <div className="text-[20px] leading-9 font-medium text-gray-700 tracking-wide [word-spacing:0.22em] space-y-6">
          <p>
            <span className="rounded-md px-2 py-1 font-semibold text-orange-600 text-[22px]">
              SwiftRide
            </span>{" "}
            offers reliable vehicle services including Car, Bike, and EV-Bike
            rides designed to provide safe, comfortable, and affordable
            transportation for everyday travel. Our platform connects riders
            with professional drivers to ensure quick and convenient mobility
            whenever it is needed. All drivers on the platform are carefully
            verified and must hold a valid driving license, proper vehicle
            documents, and complete background checks to maintain a high
            standard of passenger safety and trust.
          </p>

          <p>
            We focus on providing secure rides with well-maintained vehicles,
            accurate ride tracking, and fast booking options so that riders can
            travel with confidence. Whether you need a quick bike ride to reach
            your destination faster, an eco-friendly EV-Bike for sustainable
            travel, or a comfortable car ride for longer journeys, our services
            are designed to deliver reliability, punctuality, and a smooth user
            experience. Our goal is to make daily transportation simple,
            efficient, and accessible for everyone.
          </p>

          <p>
            <span className="rounded-md px-2 py-1 font-semibold text-orange-600 text-[22px]">
              SwiftRide
            </span>{" "}
            services are available in Ranchi district, Jharkhand, India. We are
            actively working to expand our services to more cities and regions
            in the near future so that more people can benefit from our safe and
            convenient ride solutions. As we continue to grow, our commitment
            remains focused on providing dependable transportation, professional
            drivers, and a seamless ride experience for all users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CuServicePage;

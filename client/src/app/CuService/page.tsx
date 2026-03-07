import React from "react";
import { BikeIcon, Bike, CarTaxiFront } from "lucide-react";

const page = () => {
  return (
    <>
      <div className=" min-h-screen rounded-2xl shadow-2xl m-5 p-5">
        <h1 className="text-orange-400 text-2xl font-semibold ">
          Our services
        </h1>
        <div className=" grid grid-cols-3 mt-10 p-5">
          <div>
            <CarTaxiFront size={80} className="text-red-700" />
            Car
          </div>
          <div>
            <Bike size={80} className="text-blue-500" />
            Bike
          </div>
          <div>
            <BikeIcon size={80} className="text-blue-300" />
            EV-bike
          </div>
        </div>
      </div>
    </>
  );
};

export default page;

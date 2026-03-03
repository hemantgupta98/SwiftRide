import React from "react";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";

const page = () => {
  return (
    <>
      <div className=" min-h-screen rounded-2xl shadow-2xl m-5 p-5">
        <div className="flex items-center">
          <Search size={18} className="absolute ml-3" />
          <Input
            placeholder="Enter your pickup location"
            className=" rounded-md pl-10 "
          />
        </div>
        <div>
          <Image src="/riderPromo.jpeg" alt="promo" height={200} width={200} />
        </div>
      </div>
    </>
  );
};

export default page;

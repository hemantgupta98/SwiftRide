"use client";

import React, { useState } from "react";
import {
  MapPin,
  Star,
  Hotel,
  UtensilsCrossed,
  Trees,
  Camera,
} from "lucide-react";

const Page = () => {
  const [section, setSection] = useState("hotels");

  const data = {
    hotels: [
      {
        name: "Radisson Blu Hotel",
        location: "Main Road, Ranchi",
        rating: 4.7,
        price: "₹5500 / night",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      },
      {
        name: "Capitol Hill",
        location: "Mahatma Gandhi Marg, Ranchi",
        rating: 4.4,
        price: "₹4200 / night",
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
      },
      {
        name: "Le Lac Sarovar Portico",
        location: "Line Tank Road, Ranchi",
        rating: 4.3,
        price: "₹3800 / night",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd",
      },
    ],

    restaurants: [
      {
        name: "Yellow Sapphire",
        location: "Radisson Blu, Ranchi",
        rating: 4.6,
        price: "₹1200 / person",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
      },
      {
        name: "Kaveri Restaurant",
        location: "Firayalal Chowk, Ranchi",
        rating: 4.4,
        price: "₹600 / person",
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9",
      },
      {
        name: "The Great Kabab Factory",
        location: "Radisson Blu, Ranchi",
        rating: 4.5,
        price: "₹1500 / person",
        image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
      },
    ],

    parks: [
      {
        name: "Birsa Zoological Park",
        location: "Ormanjhi, Ranchi",
        rating: 4.5,
        price: "₹100 Entry",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      },
      {
        name: "Rock Garden",
        location: "Kanke Dam, Ranchi",
        rating: 4.6,
        price: "₹50 Entry",
        image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      },
      {
        name: "Tagore Hill Park",
        location: "Morabadi, Ranchi",
        rating: 4.4,
        price: "Free Entry",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      },
    ],

    attractions: [
      {
        name: "Dassam Falls",
        location: "Taimara, Ranchi",
        rating: 4.7,
        price: "₹100 Entry",
        image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
      },
      {
        name: "Jonha Falls",
        location: "Angara, Ranchi",
        rating: 4.6,
        price: "₹50 Entry",
        image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716",
      },
      {
        name: "Patratu Valley",
        location: "Patratu, Ranchi",
        rating: 4.8,
        price: "Free Visit",
        image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
      },
    ],
  };

  const currentData = data[section as keyof typeof data];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Ranchi Travel Explorer
      </h1>

      {/* Section Buttons */}

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={() => setSection("hotels")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl shadow ${
            section === "hotels" ? "bg-indigo-600 text-white" : "bg-white"
          }`}
        >
          <Hotel size={18} /> Hotels
        </button>

        <button
          onClick={() => setSection("restaurants")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl shadow ${
            section === "restaurants" ? "bg-indigo-600 text-white" : "bg-white"
          }`}
        >
          <UtensilsCrossed size={18} /> Restaurants
        </button>

        <button
          onClick={() => setSection("parks")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl shadow ${
            section === "parks" ? "bg-indigo-600 text-white" : "bg-white"
          }`}
        >
          <Trees size={18} /> Parks
        </button>

        <button
          onClick={() => setSection("attractions")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl shadow ${
            section === "attractions" ? "bg-indigo-600 text-white" : "bg-white"
          }`}
        >
          <Camera size={18} /> Attractions
        </button>
      </div>

      {/* Cards */}
      <p className=" text-red-400 font-semibold text-sm text-center mt-5">
        Book in her official sites{" "}
      </p>
      <p className=" text-red-400 mb-4 font-semibold text-sm text-center ">
        This is for sponsors
        <a
          href="https://www.booking.com/city/in/ranchi.en.html?aid=306395;label=ranchi-cc0l*HUb_uabDQ5Sp846_wS392972670143:pl:ta:p1:p2:ac:ap:neg:fi:tikwd-3276993427:lp9151124:li:dec:dm:ppccp=UmFuZG9tSVYkc2RlIyh9YZVcNNsENnH02-pWD53qm9c;ws=&gad_source=1&gad_campaignid=17741369&gbraid=0AAAAAD_Ls1LbvbvqeE9f-dgwvL6u9aBT7&gclid=CjwKCAjwyYPOBhBxEiwAgpT8P8T77fMBj_Xt3Sg0s56IDLusGHJR6MLJD5Ac_OBvHyXvSFyGQO3oghoCN4AQAvD_BwE"
          target="_blank"
          rel="noopener noreferrer"
          className=" cursor-pointer text-blue-500 space-x-0.5"
        >
          ....link
        </a>
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {currentData.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
          >
            <img
              src={item.image}
              className="h-48 w-full object-cover"
              alt={item.name}
            />

            <div className="p-4">
              <h2 className="text-lg font-semibold mb-1">{item.name}</h2>

              <p className="flex items-center text-gray-500 text-sm mb-2">
                <MapPin size={14} className="mr-1" />
                {item.location}
              </p>

              <div className="flex justify-between items-center mb-3">
                <span className="flex items-center text-yellow-500">
                  <Star size={16} className="mr-1" />
                  {item.rating}
                </span>

                <span className="font-semibold text-indigo-600">
                  {item.price}
                </span>
              </div>

              <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;

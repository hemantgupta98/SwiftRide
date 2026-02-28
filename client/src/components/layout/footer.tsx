"use client";

import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Bike,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B1B2B] text-gray-300 flex flex-col justify-between">
      {/* Newsletter Section */}
      <section className="px-6 md:px-16 pt-20">
        <div className="bg-[#16273A] border border-[#23364D] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Left Content */}
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold text-white mb-3">
              Stay in the loop
            </h2>
            <p className="text-gray-400">
              Subscribe to our newsletter for the latest updates, safety tips,
              and exclusive riding offers.
            </p>
          </div>

          {/* Right Input */}
          <div className="flex w-full md:w-auto gap-4">
            <div className="flex items-center bg-[#0F2235] border border-[#23364D] rounded-xl px-4 py-3 w-full md:w-80">
              <Mail size={18} className="text-gray-500 mr-2" />
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent outline-none text-sm w-full text-white placeholder-gray-500"
              />
            </div>

            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-16 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500 p-2 rounded-lg">
                <Bike size={18} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-green-500">
                SwiftRide
              </span>
            </div>

            <p className="text-gray-400 mb-6">
              Providing fast, affordable, and reliable bike rides for urban
              mobility. Your city, your ride.
            </p>

            <div className="flex gap-5 text-gray-400">
              <Facebook size={18} className="hover:text-white cursor-pointer" />
              <Twitter size={18} className="hover:text-white cursor-pointer" />
              <Instagram
                size={18}
                className="hover:text-white cursor-pointer"
              />
              <Linkedin size={18} className="hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="hover:text-white cursor-pointer">About Us</li>
              <li className="hover:text-white cursor-pointer">Safety</li>
              <li className="hover:text-white cursor-pointer">Careers</li>
              <li className="hover:text-white cursor-pointer">Blog</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="hover:text-white cursor-pointer">Help Center</li>
              <li className="hover:text-white cursor-pointer">Contact Us</li>
              <li className="hover:text-white cursor-pointer">
                Privacy Policy
              </li>
              <li className="hover:text-white cursor-pointer">
                Terms of Service
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="hover:text-white cursor-pointer">Bike Rides</li>
              <li className="hover:text-white cursor-pointer">
                Rider Platform
              </li>
              <li className="hover:text-white cursor-pointer">
                Business Solutions
              </li>
              <li className="hover:text-white cursor-pointer">Gift Cards</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#23364D] mt-16 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2026 SwiftRide Inc. All rights reserved.</p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer">
              Refund Policy
            </span>
            <span className="hover:text-white cursor-pointer">Cookies</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

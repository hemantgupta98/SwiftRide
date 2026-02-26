import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className={`w-full border-t px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16 `}
    >
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="logo"
              height={42}
              width={42}
              className="sm:h-12.5 sm:w-12.5"
            />
            <span className="text-xl font-semibold text-gray-900">Taskora</span>
          </div>

          <p className="mt-4 text-gray-600 max-w-sm">
            Empowering teams to achieve more through intelligent task management
            and effortless collaboration.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
          <ul className="space-y-2 text-gray-600">
            <li>Features</li>
            <li>Integrations</li>
            <li>Enterprise</li>
            <li>Pricing</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
          <ul className="space-y-2 text-gray-600">
            <li>Documentation</li>
            <li>Help Center</li>
            <li>Community</li>
            <li>API Status</li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
          <ul className="space-y-2 text-gray-600">
            <li>About Us</li>
            <li>Careers</li>
            <li>Legal</li>
            <li>Contact</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full mt-10 sm:mt-12 pt-6 border-t flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
        <p>© 2026 Taskora Inc. All rights reserved.</p>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <span className="hover:text-gray-700 cursor-pointer">
            Privacy Policy&apos;s
          </span>
          <span className="hover:text-gray-700 cursor-pointer">
            Terms of Service
          </span>
          <span className="hover:text-gray-700 cursor-pointer">
            Cookie Policy
          </span>
        </div>
      </div>
    </footer>
  );
}

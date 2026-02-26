export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-10 py-6">
      <div className="text-xl font-bold text-primary">SwiftRide</div>
      <div className="hidden md:flex gap-6 text-sm">
        <a href="#">Services</a>
        <a href="#">How It Works</a>
        <a href="#">Safety</a>
      </div>
      <div className="flex gap-4">
        <button className="text-sm">Login</button>
        <button className="bg-primary text-white px-4 py-2 rounded-full text-sm">
          Get Started
        </button>
      </div>
    </nav>
  );
}

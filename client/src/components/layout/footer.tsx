export default function Footer() {
  return (
    <footer className="bg-dark text-slate-400 px-10 py-16 grid md:grid-cols-4 gap-8 text-sm">
      <div>
        <h3 className="text-primary font-bold mb-3">SwiftRide</h3>
        <p>Fast, affordable and reliable bike rides.</p>
      </div>

      <div>
        <h4 className="text-white mb-2">Company</h4>
        <p>About Us</p>
        <p>Careers</p>
        <p>Blog</p>
      </div>

      <div>
        <h4 className="text-white mb-2">Support</h4>
        <p>Help Center</p>
        <p>Contact</p>
        <p>Privacy Policy</p>
      </div>

      <div>
        <h4 className="text-white mb-2">Products</h4>
        <p>Bike Rides</p>
        <p>Rider Platform</p>
      </div>
    </footer>
  );
}

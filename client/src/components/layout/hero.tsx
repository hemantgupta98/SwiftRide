export default function Hero() {
  return (
    <section className="text-center px-6 py-24">
      <span className="inline-block border px-4 py-1 rounded-full text-xs text-primary mb-6">
        Platform Preview
      </span>

      <h1 className="text-4xl md:text-6xl font-bold">
        Your ride is just <span className="text-primary">one tap</span> away
      </h1>

      <p className="mt-6 max-w-2xl mx-auto text-slate-600">
        Explore the most intuitive mobility experience ever built. Fast
        bookings, real-time updates, and transparent pricing.
      </p>

      <div className="mt-10 flex justify-center gap-4">
        <button className="bg-primary text-white px-6 py-3 rounded-full">
          Get Started Now
        </button>
        <button className="border px-6 py-3 rounded-full">Learn More</button>
      </div>
    </section>
  );
}

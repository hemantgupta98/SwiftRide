export default function Hero() {
  return (
    <section className="text-center px-6 py-24">
      <span className="inline-block border border-green-300 text-green-400 px-4 py-1 rounded-full text-sm text-primary mb-6 bg-green-100">
        Platform Preview
      </span>

      <h1 className="text-4xl md:text-6xl font-bold ">
        Your ride is just <span className="text-green-400">one tap</span> away
      </h1>

      <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-600">
        Explore the most intuitive mobility experience ever built. Fast
        bookings, real-time updates, and transparent pricing.
      </p>

      <div className="mt-10 flex justify-center gap-4">
        <button className="px-4 py-2 bg-green-500 text-white rounded-xl shadow-2xl hover:bg-green-600 transition">
          Get Start Now
        </button>
        <button className="border px-6 py-3 rounded-xl">Learn More</button>
      </div>
    </section>
  );
}

export default function CTA() {
  return (
    <section className="bg-slate-900 text-white mx-6 my-20 rounded-3xl px-10 py-26 flex flex-col md:flex-row justify-between items-center gap-6">
      <div>
        <h2 className="text-3xl font-bold">Ready to ride with the best?</h2>
        <p className="text-slate-300 mt-2">
          Join over 1,000,000 urban commuters.
        </p>
      </div>

      <div className="flex gap-4">
        <button className="bg-primary px-6 py-3 rounded-full">
          Download for iOS
        </button>
        <button className="bg-white text-black px-6 py-3 rounded-full">
          Download for Android
        </button>
      </div>
    </section>
  );
}

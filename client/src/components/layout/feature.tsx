const features = [
  {
    title: "Real-time ETA",
    desc: "Predictive algorithms give you precision arrival times.",
  },
  {
    title: "Secure Wallet",
    desc: "Pay seamlessly with cards or digital wallets.",
  },
  {
    title: "Verified Riders",
    desc: "All riders are background-checked and verified.",
  },
];

export default function Features() {
  return (
    <section className="grid md:grid-cols-3 gap-10 px-10 py-20 text-center">
      {features.map((f) => (
        <div key={f.title}>
          <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4" />
          <h3 className="font-semibold">{f.title}</h3>
          <p className="text-sm text-slate-600 mt-2">{f.desc}</p>
        </div>
      ))}
    </section>
  );
}

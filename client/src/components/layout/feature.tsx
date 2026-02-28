import { Clock, Wallet, Verified } from "lucide-react";

const features = [
  {
    title: "Real-time ETA",
    desc: "Predictive algorithms give you precision arrival times.",
    icon: Clock,
  },
  {
    title: "Secure Wallet",
    desc: "Pay seamlessly with cards or digital wallets.",
    icon: Wallet,
  },
  {
    title: "Verified Riders",
    desc: "All riders are background-checked and verified.",
    icon: Verified,
  },
];

export default function Features() {
  return (
    <section className="grid md:grid-cols-3 gap-10 px-10 py-20 text-center">
      {features.map((f) => {
        const Icon = f.icon;

        return (
          <div key={f.title} className="flex flex-col items-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Icon className="w-7 h-7 text-green-600" />
            </div>

            <h3 className="font-semibold text-lg">{f.title}</h3>

            <p className="text-md font-semibold text-slate-600 mt-2">
              {f.desc}
            </p>
          </div>
        );
      })}
    </section>
  );
}

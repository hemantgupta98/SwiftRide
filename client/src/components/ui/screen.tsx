import Image from "next/image";

export default function AppPreview() {
  return (
    <section className="flex justify-center gap-10 px-6 py-20">
      <div className="w-65 h-130 rounded-[40px] border shadow-lg flex items-center justify-center text-slate-400">
        <Image alt="logo" src="/three.png" fill />
      </div>
    </section>
  );
}

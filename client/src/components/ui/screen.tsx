export default function AppPreview() {
  return (
    <section className="flex justify-center gap-10 px-6 py-20">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="w-65 h-130 rounded-[40px] border shadow-lg flex items-center justify-center text-slate-400"
        >
          App Screen {item}
        </div>
      ))}
    </section>
  );
}

import Image from "next/image";

export default function AppPreview() {
  return (
    <>
      <section className="flex justify-center gap-10 px-6 py-20">
        <div>
          <Image
            alt="logo"
            src="/three2.png"
            height={1050}
            width={1050}
            className=" bg-transparent"
          />
        </div>
      </section>
    </>
  );
}

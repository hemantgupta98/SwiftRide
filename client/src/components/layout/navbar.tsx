"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const scrollToHowItWorks = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const section = document.getElementById("how-it-works");
    if (!section) return;

    const startY = window.scrollY;
    const targetY = section.getBoundingClientRect().top + window.scrollY - 20;
    const distance = targetY - startY;
    const duration = 450;
    const startTime = performance.now();

    const easeInOut = (time: number) =>
      time < 0.5 ? 2 * time * time : 1 - Math.pow(-2 * time + 2, 2) / 2;

    const animateScroll = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOut(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const scrollToService = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const section = document.getElementById("service");
    if (!section) return;

    const startY = window.scrollY;
    const targetY = section.getBoundingClientRect().top + window.scrollY - 20;
    const distance = targetY - startY;
    const duration = 450;
    const startTime = performance.now();

    const easeInOut = (time: number) =>
      time < 0.5 ? 2 * time * time : 1 - Math.pow(-2 * time + 2, 2) / 2;

    const animateScroll = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOut(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return (
    <nav className="flex items-center justify-between px-5 mt-5 ">
      <div className="text-xl font-bold text-primary">
        <Image src="/logo.png" alt="logo" height={150} width={150} />
      </div>
      <div className="hidden md:flex gap-6 text-sm">
        <a
          href="#service"
          onClick={scrollToService}
          className=" text-xl font-semibold cursor-pointer"
        >
          Services
        </a>
        <a
          href="#how-it-works"
          onClick={scrollToHowItWorks}
          className=" text-xl font-semibold cursor-pointer"
        >
          How It Works
        </a>
        <a
          onClick={() => router.replace("/container/saftey")}
          className=" text-xl font-semibold cursor-pointer"
        >
          Safety
        </a>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/authCuLogin")}
          className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/authCustomer")}
          className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
        >
          Get start
        </button>
      </div>
    </nav>
  );
}

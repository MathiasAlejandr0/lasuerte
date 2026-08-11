import { Marquee } from "@/components/layout/Marquee";
import { Hero } from "@/components/home/Hero";
import { Team } from "@/components/home/Team";
import { Packs } from "@/components/home/Packs";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FAQ } from "@/components/home/FAQ";

export default function HomePage() {
  return (
    <>
      <Marquee />
      <main className="w-full block">
        <Hero />
        <Team />
        <Packs />
        <HowItWorks />
        <FAQ />
      </main>
    </>
  );
}

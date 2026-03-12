import { SightingHero, SightingForm, SightingsFeed } from "@/components/public-ui";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Decorative Blob Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-pink/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-blue/20 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <SightingHero />
        <SightingForm />
        <SightingsFeed />
      </div>
    </main>
  );
}

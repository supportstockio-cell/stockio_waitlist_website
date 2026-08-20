import Image from "next/image";
import CityBackground from "@/components/CityBackground";
import ExploreCityButton from "@/components/ExploreCityButton";
import { CityProvider } from "@/components/city-context";
import WaitlistForm from "@/components/WaitlistForm";

const LOOP_STEPS = [
  {
    n: "01",
    title: "Call it",
    body: "Pick a stock, pick a direction, pick your window. It works like trading options: you are calling where a price goes and by when. Call as often as you like.",
  },
  {
    n: "02",
    title: "Earn",
    body: "Correct calls pay out in points. A call can resolve mid session or at the close, so a sharp read can land in minutes instead of overnight.",
  },
  {
    n: "03",
    title: "Acquire",
    body: "Spend points to acquire a building modeled on a real company, the same way you would buy the stock itself.",
  },
  {
    n: "04",
    title: "Watch it trade",
    body: "Every building you own keeps living. It rises and falls with that company's real market performance, long after the call that earned it.",
  },
];

const FAIR_PLAY = [
  "Calls lock the moment you place them and resolve against real market data.",
  "Play more and read sharper to climb faster. Volume and accuracy both count.",
  "Credits buy cosmetics, skins and build speed. They never buy a correct call.",
];

const LEADERBOARD = [
  "Weekly and global rankings scored on accuracy, never on spend.",
  "Percentile placement, so a new player always has a rung to climb.",
  "Hostile takeovers: beat a rival on weekly accuracy and absorb part of their city into yours.",
];

export default function Home() {
  return (
    <CityProvider>
      <CityBackground />

      <div className="page-shell relative z-10">
        <header className="sticky top-0 z-40 border-b border-noir-800 bg-noir-950">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
            <a href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt=""
                width={40}
                height={40}
                priority
                className="h-9 w-9 sm:h-10 sm:w-10"
              />
              <span className="font-display text-2xl font-extrabold uppercase tracking-[0.06em] text-noir-050">
                Stockio
              </span>
            </a>
            <a
              href="#waitlist"
              className="eyebrow text-noir-100 transition-colors duration-200 hover:text-amber-400"
            >
              Get early access
            </a>
          </div>
        </header>

        {/* Hero sits on the scrim alone, no panel behind it, so the city reads
            at full strength exactly where it is most striking. */}
        <section className="relative mx-auto max-w-6xl px-6 pt-12 pb-28 sm:px-10 sm:pt-20 sm:pb-44">
          <div className="max-w-3xl animate-rise-in">
            <p className="eyebrow mb-6 text-amber-500">
              Coming to iOS · Waitlist open
            </p>
            <h1 className="font-display text-display-xl font-extrabold uppercase text-noir-050">
              The market
              <br />
              builds your <span className="text-amber-500">city</span>
            </h1>
            <p className="mt-8 max-w-[40ch] text-lg leading-relaxed text-noir-100 sm:text-xl">
              Build a city powered by the real stock market. No real money,
              all the stakes.
            </p>
            <p className="mt-4 max-w-[54ch] text-[17px] leading-relaxed text-noir-100">
              Call where a stock is heading, earn points when you are right,
              and spend them on buildings modeled on real companies. Every
              building you own keeps trading with the market that built it.
            </p>

            <div id="waitlist" className="mt-10 max-w-lg scroll-mt-28">
              <WaitlistForm />
              <p className="mt-3 text-sm text-noir-200">
                Free to join. No real-money trading, ever. Unsubscribe
                anytime.
              </p>
            </div>
          </div>

          {/* Anchored to the hero so it sits in the corner of the city view and
              scrolls away with it, rather than hovering over the sections
              below. On phones it drops into flow beneath the form. */}
          <div className="mt-12 flex sm:absolute sm:bottom-10 sm:right-10 sm:mt-0">
            <ExploreCityButton />
          </div>
        </section>

        <section className="border-t border-noir-800/80 bg-noir-950/70 backdrop-blur-sm sm:backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
            <div className="mb-16 max-w-2xl">
              <p className="eyebrow mb-4 text-amber-500">The core loop</p>
              <h2 className="font-display text-display-lg font-bold uppercase text-noir-050">
                Read the market.
                <br />
                Build the skyline.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2">
              {LOOP_STEPS.map((step) => (
                <div key={step.n} className="flex gap-5">
                  <span className="pt-1.5 font-mono text-xs leading-none text-amber-500/80">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-bold uppercase tracking-[0.02em] text-noir-050">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-[44ch] text-[17px] leading-relaxed text-noir-200">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-noir-800/80 bg-noir-900/75 backdrop-blur-sm sm:backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
              <div>
                <p className="eyebrow mb-4 text-amber-500">Competitive play</p>
                <h2 className="font-display text-display-lg font-bold uppercase text-noir-050">
                  Climb the board.
                  <br />
                  Take their block.
                </h2>
                <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-noir-200">
                  Every call you make is scored against every other player.
                  The leaderboard is the real game. Your city is just the
                  scoreboard everyone else can see.
                </p>
              </div>
              <ul className="flex flex-col gap-5 border-t border-noir-800 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                {LEADERBOARD.map((item) => (
                  <li
                    key={item}
                    className="text-[17px] leading-relaxed text-noir-100"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-noir-800/80 bg-noir-950/70 backdrop-blur-sm sm:backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
              <p className="font-display text-display-md font-semibold uppercase text-noir-100">
                No real money.{" "}
                <span className="text-amber-500">All the stakes.</span> Your
                city is a scoreboard for how well you actually read the
                market.
              </p>
              <ul className="flex flex-col gap-5 border-t border-noir-800 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                {FAIR_PLAY.map((item) => (
                  <li
                    key={item}
                    className="text-[17px] leading-relaxed text-noir-100"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-noir-800/80 bg-noir-950/75 backdrop-blur-sm sm:backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
            <div className="max-w-xl">
              <h2 className="font-display text-display-lg font-bold uppercase text-noir-050">
                Your skyline is waiting
                <br />
                to break ground.
              </h2>
              <p className="mt-6 text-[17px] leading-relaxed text-noir-200">
                Get notified the moment Stockio goes live on iOS, and start
                climbing while the leaderboard is still wide open.
              </p>
              <div className="mt-8 max-w-lg">
                <WaitlistForm compact />
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-noir-800/80 bg-noir-950/90">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <span className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="" width={24} height={24} className="h-6 w-6 opacity-80" />
              <span className="font-display text-lg font-bold uppercase tracking-[0.06em] text-noir-200">
                Stockio
              </span>
            </span>
            <p className="text-sm text-noir-300">
              &copy; {new Date().getFullYear()} Stockio. Skill-based
              prediction game. No real-money wagering.
            </p>
          </div>
        </footer>
      </div>
    </CityProvider>
  );
}

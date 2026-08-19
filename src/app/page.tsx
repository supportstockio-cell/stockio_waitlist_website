import Skyline from "@/components/Skyline";
import WaitlistForm from "@/components/WaitlistForm";

const LOOP_STEPS = [
  {
    n: "01",
    title: "Predict",
    body: "Every evening after close, call one stock up or down for the next session. Same number of calls for everyone — no volume advantage.",
  },
  {
    n: "02",
    title: "Earn",
    body: "Accuracy earns points. Nothing else does. Your rank is always earned, never bought.",
  },
  {
    n: "03",
    title: "Acquire",
    body: "Spend points to acquire a building modeled on a real company — the way you'd buy the stock itself.",
  },
  {
    n: "04",
    title: "Watch it live",
    body: "Owned buildings rise and fall with that company's real performance, independent of your daily calls.",
  },
];

const FAIR_PLAY = [
  "Predictions lock the moment the market opens — no mid-session edits.",
  "Every call resolves only against the official closing price.",
  "Currency can buy cosmetics and convenience. It can never buy accuracy.",
];

export default function Home() {
  return (
    <div className="bg-noir-950">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7 sm:px-10">
        <span className="font-display text-xl tracking-[0.02em] text-noir-050">
          Stockio
        </span>
        <a
          href="#waitlist"
          className="text-sm text-noir-200 underline decoration-noir-700 decoration-1 underline-offset-4 transition-colors duration-200 hover:text-amber-400 hover:decoration-amber-500"
        >
          Get early access
        </a>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-20 sm:px-10 sm:pt-16 sm:pb-28">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-8">
          <div className="animate-rise-in">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">
              Coming to iOS · Waitlist open
            </p>
            <h1 className="font-display text-display-xl text-noir-050">
              The market
              <br />
              builds your <em className="not-italic text-amber-500">city.</em>
            </h1>
            <p className="mt-7 max-w-[42ch] text-lg leading-relaxed text-noir-200 sm:text-xl">
              Build a city powered by the real stock market — no real money,
              all the stakes.
            </p>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-noir-400">
              Predict the day&rsquo;s move, earn points for accuracy, and
              acquire buildings modeled on real companies. Every building you
              own keeps living, rising and falling with what that company
              actually does in the market.
            </p>

            <div id="waitlist" className="mt-10 max-w-lg scroll-mt-28">
              <WaitlistForm />
              <p className="mt-3 text-xs text-noir-400">
                Free to join. No real-money trading, ever. Unsubscribe
                anytime.
              </p>
            </div>
          </div>

          <div
            className="animate-rise-in"
            style={{ animationDelay: "0.15s" }}
            aria-hidden={false}
          >
            <Skyline />
          </div>
        </div>
      </section>

      {/* The Loop */}
      <section className="border-t border-noir-800">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <div className="mb-14 max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">
              The core loop
            </p>
            <h2 className="font-display text-display-lg text-noir-050">
              One prediction a day.
              <br />A skyline that never stops.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2">
            {LOOP_STEPS.map((step) => (
              <div key={step.n} className="flex gap-5">
                <span className="font-display text-3xl leading-none text-amber-500/70">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-display text-xl text-noir-050">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-noir-400">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stakes / fairness statement */}
      <section className="border-t border-noir-800 bg-noir-900/40">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
            <p className="font-display text-display-md text-noir-100">
              No real money. <span className="text-amber-500">All the stakes.</span>{" "}
              Your city is a scoreboard for how well you actually read the
              market — nothing more, nothing less.
            </p>
            <ul className="flex flex-col gap-5 border-t border-noir-800 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
              {FAIR_PLAY.map((item) => (
                <li
                  key={item}
                  className="text-[15px] leading-relaxed text-noir-200"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Second CTA */}
      <section className="border-t border-noir-800">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
          <div className="max-w-xl">
            <h2 className="font-display text-display-lg text-noir-050">
              Your skyline is waiting to
              <br />
              break ground.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-noir-400">
              Join before launch and get founder pricing on your first Credits
              pack, plus early access the day the doors open on iOS.
            </p>
            <div className="mt-8 max-w-lg">
              <WaitlistForm compact />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-noir-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <span className="font-display text-base text-noir-200">
            Stockio
          </span>
          <p className="text-xs text-noir-400">
            &copy; {new Date().getFullYear()} Stockio. Skill-based prediction
            game. No real-money wagering.
          </p>
        </div>
      </footer>
    </div>
  );
}

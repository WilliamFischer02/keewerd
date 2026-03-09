export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            Keewerd
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
            Trend-informed publishing help for creators.
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-700">
            Keewerd helps creators turn trend signals into ready-to-post titles,
            descriptions, hashtags, tags, and timing guidance.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/tool"
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Open the tool
            </a>

            <a
              href="https://github.com/WilliamFischer02/keewerd"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              View GitHub repo
            </a>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold">Platform-aware outputs</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Generate copy tailored for YouTube, Twitch, TikTok, music releases,
              and more.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold">Simple input flow</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Pick a platform, content type, topic, region, and tone. Get usable
              outputs without account setup.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold">Copy-paste ready</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Titles, descriptions, tags, and timing suggestions should be easy
              to grab and use immediately.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
export default function ToolPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            Keewerd Tool
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Creator publishing assistant
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
            Start with a simple input set. We will wire real data next. For now,
            this page establishes the correct UI skeleton for the MVP.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Inputs</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Platform</label>
                <select className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm">
                  <option>YouTube</option>
                  <option>Twitch</option>
                  <option>TikTok</option>
                  <option>Spotify</option>
                  <option>SoundCloud</option>
                  <option>Instagram</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Content type</label>
                <select className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm">
                  <option>Video</option>
                  <option>Stream</option>
                  <option>Music</option>
                  <option>Photo</option>
                  <option>Graphic</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Region</label>
                <select className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm">
                  <option>US</option>
                  <option>CA</option>
                  <option>GB</option>
                  <option>AU</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Tone</label>
                <select className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm">
                  <option>Cinematic</option>
                  <option>Hype</option>
                  <option>Educational</option>
                  <option>Funny</option>
                  <option>Dramatic</option>
                  <option>Professional</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Topic / subject</label>
                <input
                  type="text"
                  placeholder="Example: car edit, horror short, phonk drift reel"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <button className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
                Generate suggestions
              </button>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Results</h2>
              <p className="mt-2 text-sm text-gray-600">
                This panel will show Trends, Titles, Descriptions, Tags, and Timing.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {["Trends", "Titles", "Descriptions", "Tags", "Timing"].map((tab) => (
                  <span
                    key={tab}
                    className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Example title output</h3>
                  <button className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium">
                    Copy
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  [VIDEO NAME] | Cinematic [TOPIC] Edit | [TREND KEYWORD]
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Example tag bundle</h3>
                  <button className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium">
                    Copy
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  #edit #cinematic #creator #trend #contentstrategy
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
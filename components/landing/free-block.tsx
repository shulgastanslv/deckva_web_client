import {
  CleanArt,
  FormatsArt,
  FreeArt,
  SavedArt,
} from "@/components/landing/landing-art";
import {
  LandingGrid,
  LandingHead,
  LandingLayer,
  LandingPad,
  LandingSection,
} from "@/components/landing/landing-shell";

export function FreeBlock() {
  return (
    <LandingSection id="free">
      <LandingHead
        eyebrow="Free"
        title="A studio with no bill"
        text="No plan, no trial clock, no logo on the cover. You open the studio and post."
      />

      <LandingGrid className="md:grid-cols-12">
        <LandingLayer className="bg-white md:col-span-7">
          <LandingPad>
            <p className="text-sm font-bold text-land-blue">#Free</p>
            <h3 className="mt-3 max-w-sm text-3xl font-extrabold tracking-tight text-land-ink sm:text-4xl">
              Open the studio and start
            </h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-land-ink/55">
              The canvas and the download are free.
            </p>
            <div className="mt-5 flex justify-center">
              <FreeArt />
            </div>
          </LandingPad>
        </LandingLayer>

        <LandingLayer className="bg-land-ink text-white md:col-span-5">
          <LandingPad className="flex h-full flex-col justify-between">
            <p className="text-sm font-bold tracking-wide text-white/60">
              Price
            </p>
            <p className="mt-6 text-7xl font-extrabold tracking-tight sm:text-8xl">
              $0
            </p>
            <div className="mt-8">
              <h3 className="text-3xl font-extrabold tracking-tight">
                No subscription
              </h3>
              <p className="mt-2 max-w-xs text-base leading-relaxed text-white/70">
                Generate, edit, and export. Nothing to upgrade.
              </p>
            </div>
          </LandingPad>
        </LandingLayer>

        <LandingLayer className="bg-land-blue md:col-span-7">
          <LandingPad>
            <p className="text-sm font-bold text-white">#Formats</p>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
              Four formats for your carousel
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              One layout switches for the feed, a square, a story, or a wide
              frame.
            </p>
            <FormatsArt />
          </LandingPad>
        </LandingLayer>

        <LandingLayer className="bg-white md:col-span-5">
          <LandingPad>
            <p className="text-sm font-bold text-land-blue">#Projects</p>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-land-ink">
              The carousel stays yours
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-land-ink/55">
              Sign in and the slides are still there. Close the tab and come
              back.
            </p>
            <SavedArt />
          </LandingPad>
        </LandingLayer>

        <LandingLayer className="bg-white text-land-ink md:col-span-12">
          <LandingPad>
            <div className="grid items-center gap-6 sm:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-sm font-bold text-land-blue">#Export</p>
                <h3 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  PNG and ZIP, no watermark
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-land-ink/55">
                  Download the frames as they are. No studio logo on the cover.
                </p>
              </div>
              <CleanArt />
            </div>
          </LandingPad>
        </LandingLayer>
      </LandingGrid>
    </LandingSection>
  );
}

import { ExpertiseSection, ExpertiseStrip } from "./ExpertiseSection";
import { FinalCtaSection } from "./FinalCtaSection";
import { GastronomySection } from "./GastronomySection";
import { HeroSection } from "./HeroSection";
import { RealisationsSection } from "./RealisationsSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { WhySection } from "./WhySection";

export function HomePage() {
  return (
    <div className="overflow-hidden bg-ivory">
      <HeroSection />
      <ExpertiseStrip />
      <ExpertiseSection />
      <RealisationsSection />
      <GastronomySection />
      <section className="bg-ivory py-16 lg:py-24">
        <div className="container-page grid gap-10 xl:grid-cols-[1.45fr_0.75fr] xl:items-stretch">
          <WhySection />
          <TestimonialsSection />
        </div>
      </section>
      <FinalCtaSection />
    </div>
  );
}

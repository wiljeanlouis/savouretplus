import { homeRealisationTestimonials } from "../../content/realisations";
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
        <div className="container-page">
          <WhySection />
        </div>
      </section>
      <TestimonialsSection testimonials={homeRealisationTestimonials} />
      <FinalCtaSection />
    </div>
  );
}

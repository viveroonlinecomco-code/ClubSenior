import { HeroSection } from '@/components/marketing/hero-section';
import { FeaturesSection } from '@/components/marketing/features-section';
import { PricingSection } from '@/components/marketing/pricing-section';

export default function MarketingPage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
    </main>
  );
}

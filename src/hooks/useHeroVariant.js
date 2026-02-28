import { useState, useEffect } from 'react';

// The 3 UPL-Cleared Variants for Phase 1 A/B/C Testing
const VARIANTS = [
  {
    id: 'A',
    title: 'Start. Shield. Sustain.',
    titleHighlight: 'Sustain.',
    rawTitle: 'Start. Shield.',
    subHeading: 'We file your LLC, protect your home address, and lock in who gets your business when you\'re gone. The entire lifecycle of your company, handled in one place.'
  },
  {
    id: 'B',
    title: 'Anonymity by Default.',
    titleHighlight: 'Default.',
    rawTitle: 'Anonymity by',
    subHeading: 'Your home address is none of the public\'s business. We use our licensed Florida office for every state filing so your personal life stays completely separate from your company.'
  },
  {
    id: 'C',
    title: 'Build it. Protect it. Pass it on.',
    titleHighlight: 'Pass it on.',
    rawTitle: 'Build it. Protect it.',
    subHeading: 'We form your LLC, put our Florida office address on every public record so your home stays private, and create a legal plan for who gets your business when you\'re gone. Three problems solved. One place.'
  }
];

export function useHeroVariant() {
  const [variant, setVariant] = useState(VARIANTS[0]);

  useEffect(() => {
    // Locked to Variant C — the complete product arc: Build. Protect. Pass it on.
    const selected = VARIANTS[2];
    setVariant(selected);

    fetch('http://localhost:8080/api/v1/analytics/impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId: selected.id, timestamp: new Date().toISOString() })
    }).catch(() => {
      console.log(`[Analytics Simulation] Impression recorded for Variant ${selected.id}`);
    });
  }, []);

  const trackClick = () => {
    // Track Conversion/Click (Mock endpoint for Java Spring Boot)
    // TODO: (INTEGRATION) Update this URL when the Growth Engine Service is deployed
    fetch('http://localhost:8080/api/v1/analytics/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId: variant.id, action: 'form_llc', timestamp: new Date().toISOString() })
    }).catch(err => {
      console.log(`[Analytics Simulation] Click recorded for Variant ${variant.id}`);
    });
  };

  return { variant, trackClick };
}

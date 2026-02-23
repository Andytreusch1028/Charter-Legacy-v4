import { useState, useEffect } from 'react';

// The 3 UPL-Cleared Variants for Phase 1 A/B/C Testing
const VARIANTS = [
  {
    id: 'A',
    title: 'Start. Shield. Sustain.',
    titleHighlight: 'Sustain.',
    rawTitle: 'Start. Shield.',
    subHeading: 'The entire lifecycle of your business, distilled into one elegant experience. We’ve automated the filings, shielded the ownership, and secured the hand-off. It’s not just a tool—it’s the definitive way to build something that lasts.'
  },
  {
    id: 'B',
    title: 'Anonymity by Default.',
    titleHighlight: 'Default.',
    rawTitle: 'Anonymity by',
    subHeading: 'Your life belongs to you. Your business belongs to the state. We build an invisible wall between them, housing your entity in our secure facility so your home address never sees the public eye.'
  },
  {
    id: 'C',
    title: 'Build it. Protect it. Pass it on.',
    titleHighlight: 'Pass it on.',
    rawTitle: 'Build it. Protect it.',
    subHeading: 'Most entities die when the founder does. Charter Legacy pairs institutional-grade privacy with automated succession protocols, providing the administrative framework so your life’s work transfers exactly as you designed.'
  }
];

export function useHeroVariant() {
  const [variant, setVariant] = useState(VARIANTS[0]);

  useEffect(() => {
    // Basic Epsilon-Greedy / Random Selector for MVP
    // In production, this can be controlled by a backend flag or cookie
    const selected = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
    setVariant(selected);

    // Track Impression (Mock endpoint for Java Spring Boot)
    // TODO: (INTEGRATION) Update this URL when the Growth Engine Service is deployed
    fetch('http://localhost:8080/api/v1/analytics/impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId: selected.id, timestamp: new Date().toISOString() })
    }).catch(err => {
      // Silently fail in dev if backend is down
      console.log(`[Analytics Simulation] Impression recorded for Variant ${selected.id}`);
    });
  }, []);

  const trackClick = () => {
    // Track Conversion/Click (Mock endpoint for Java Spring Boot)
    // TODO: (INTEGRATION) Update this URL when the Growth Engine Service is deployed
    fetch('http://localhost:8080/api/v1/analytics/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId: variant.id, action: 'launch_entity', timestamp: new Date().toISOString() })
    }).catch(err => {
      console.log(`[Analytics Simulation] Click recorded for Variant ${variant.id}`);
    });
  };

  return { variant, trackClick };
}

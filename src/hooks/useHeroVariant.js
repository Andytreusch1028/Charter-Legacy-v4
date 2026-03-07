import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Fallback in case the database is completely empty or offline
const FALLBACK_VARIANTS = [
  {
    id: 'A',
    variant_code: 'A',
    title: 'Start. Shield. Sustain.',
    titleHighlight: 'Sustain.',
    rawTitle: 'Start. Shield.',
    subHeading: 'We file your LLC, protect your home address, and lock in who gets your business when you\'re gone. The entire lifecycle of your company, handled in one place.'
  }
];

export function useHeroVariant() {
  const [variant, setVariant] = useState(FALLBACK_VARIANTS[0]);

  useEffect(() => {
    let isMounted = true;

    const loadVariant = async () => {
      try {
        // Fetch all currently ACTIVE hero variants from Supabase
        const { data } = await supabase
          .from('hero_variants')
          .select('*')
          .eq('status', 'ACTIVE');

        if (data && data.length > 0) {
          // Select a random variant for the A/B test impression
          const randomVariant = data[Math.floor(Math.random() * data.length)];
          
          // Split the headline so the last word gets the colorful Highlight styling
          const words = randomVariant.headline.trim().split(' ');
          const highlight = words.pop() || '';
          const raw = words.join(' ');
          
          const activeVariant = {
            id: randomVariant.id, 
            variant_code: randomVariant.variant_code || 'GEN',
            title: randomVariant.headline,
            titleHighlight: highlight,
            rawTitle: raw,
            subHeading: randomVariant.subheading
          };

          if (isMounted) {
            setVariant(activeVariant);
          }

          // Securely log the impression (view) via the RPC
          await supabase.rpc('increment_variant_view', { p_id: randomVariant.id });
          console.log(`[AI Growth Engine] Served active variant: ${activeVariant.title}`);
        } else {
            console.log("[AI Growth Engine] No active variants found in Supabase. Using fallback.");
        }
      } catch (err) {
        console.error("Failed to load hero variants from Supabase", err);
      }
    };

    loadVariant();

    return () => { isMounted = false; };
  }, []);

  const trackClick = async () => {
    try {
      // If the currently loaded variant is a real UUID from the DB, track the click securely
      if (variant.id && variant.id.length > 5) {
        await supabase.rpc('increment_variant_click', { p_id: variant.id });
        console.log(`[AI Growth Engine] Click recorded for variant: ${variant.title}`);
      }
    } catch (err) {
      console.error("Failed to track hero variant click", err);
    }
  };

  return { variant, trackClick };
}

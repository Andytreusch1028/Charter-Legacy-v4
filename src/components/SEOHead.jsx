import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SEOHead = ({ 
  title: fallbackTitle, 
  description: fallbackDesc, 
  keywords: fallbackKey, 
  canonical: fallbackCanonical,
  ogTitle: fallbackOgTitle,
  ogDescription: fallbackOgDesc,
  ogImage = '/og-image.jpg',
  jsonLd: fallbackJson
}) => {
  const location = useLocation();
  const [dynamicSEO, setDynamicSEO] = useState(null);

  useEffect(() => {
    const fetchSEO = async () => {
      // Find exact matching route in DB
      const { data } = await supabase
        .from('seo_discoverability')
        .select('*')
        .eq('route', location.pathname)
        .maybeSingle();
      
      if (data) {
        setDynamicSEO(data);
      } else {
        setDynamicSEO(null); // fallback to props
      }
    };
    fetchSEO();
  }, [location.pathname]);

  const siteUrl = 'https://charterlegacy.com';
  
  // Resolve Values: dynamic DB row > explicit prop > static default
  const defaultTitle = 'Charter Legacy - Your Business Deserves Better Than a State Website';
  const defaultDesc = 'Charter Legacy automates Florida Homestead Protection, Anonymous LLC Formation, and Registered Agent Services. Secure your assets for $199 + $99/yr.';
  
  const variation = typeof window !== 'undefined' ? localStorage.getItem('seo_variation') : 'A';

  const dynamicTitle = variation === 'B' && dynamicSEO?.title_b ? dynamicSEO.title_b : dynamicSEO?.title;
  const dynamicDesc = variation === 'B' && dynamicSEO?.description_b ? dynamicSEO.description_b : dynamicSEO?.description;
  const dynamicKey = variation === 'B' && dynamicSEO?.keywords_b ? dynamicSEO.keywords_b : dynamicSEO?.keywords;
  const dynamicJson = variation === 'B' && dynamicSEO?.json_payload_b && Object.keys(dynamicSEO.json_payload_b).length > 0 ? dynamicSEO.json_payload_b : dynamicSEO?.json_payload;

  const title = dynamicTitle || fallbackTitle || defaultTitle;
  const description = dynamicDesc || fallbackDesc || defaultDesc;
  const keywords = dynamicKey || fallbackKey;
  const canonical = fallbackCanonical || `${siteUrl}${location.pathname}`;
  
  const ogTitle = fallbackOgTitle || title;
  const ogDescription = fallbackOgDesc || description;

  // Render the Title elegantly
  const renderTitle = () => {
      if (dynamicTitle) return dynamicTitle; // If explicit in DB, respect it
      if (title.includes('Charter Legacy')) return title;
      return `${title} | Charter Legacy`;
  };

  const finalJsonLd = dynamicJson && Object.keys(dynamicJson).length > 0 
    ? dynamicJson 
    : fallbackJson;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{renderTitle()}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:title" content={ogTitle} />
      <meta property="twitter:description" content={ogDescription} />
      <meta property="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LegalService",
          "name": "Charter Legacy",
          "url": siteUrl,
          "logo": `${siteUrl}/logo.png`,
          "sameAs": [
            "https://twitter.com/charterlegacy",
            "https://linkedin.com/company/charterlegacy"
          ],
          "priceRange": "$199 setup + $99/yr maintenance",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Miami",
            "addressRegion": "FL",
            "addressCountry": "US"
          },
          ...finalJsonLd
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;

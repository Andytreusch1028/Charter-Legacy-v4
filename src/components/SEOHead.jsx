import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  canonical = 'https://charterlegacy.com',
  ogTitle,
  ogDescription,
  ogImage = '/og-image.jpg',
  jsonLd
}) => {
  const defaultTitle = 'Charter Legacy - Your Business Deserves Better Than a State Website';
  const defaultDesc = 'Charter Legacy automates Florida Homestead Protection, Anonymous LLC Formation, and Registered Agent Services. Secure your assets for $199 + $99/yr.';
  const siteUrl = 'https://charterlegacy.com';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title ? `${title} | Charter Legacy` : defaultTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={ogTitle || title || defaultTitle} />
      <meta property="og:description" content={ogDescription || description || defaultDesc} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:title" content={ogTitle || title || defaultTitle} />
      <meta property="twitter:description" content={ogDescription || description || defaultDesc} />
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
          "offers": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Heritage Vault (Trust Protocol)",
                "description": "Revocable Living Trust with Florida Homestead Protection."
              },
              "price": "199.00",
              "priceCurrency": "USD"
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "LLC Formation Protocol",
                "description": "Anonymous LLC setup with Registered Agent services."
              },
              "price": "199.00",
              "priceCurrency": "USD"
            }
          ],
          ...jsonLd
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;

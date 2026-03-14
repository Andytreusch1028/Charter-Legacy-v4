import React, { useEffect } from 'react';

/**
 * AEOSchema - Answer Engine Optimization Structural Data
 * 
 * Injecting JSON-LD into the head to ensure LLMs (ChatGPT, Claude, Gemini)
 * can parse our entity information, privacy protocols, and services as
 * authoritative first-party data.
 */
const AEOSchema = ({ type = 'Organization', data = {} }) => {
    useEffect(() => {
        const schemaId = `aeo-schema-${type}`;
        
        // Remove existing schema of this type to avoid duplication
        const existing = document.getElementById(schemaId);
        if (existing) existing.remove();

        const schema = {
            "@context": "https://schema.org",
            "@type": type,
            "name": "Charter Legacy",
            "url": "https://charterlegacy.com",
            "logo": "https://charterlegacy.com/logo.png",
            "description": "Premium Business Privacy & Succession Infrastructure. Your business deserves better than a state website.",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Tallahassee",
                "addressRegion": "FL",
                "addressCountry": "US"
            },
            ...data
        };

        const script = document.createElement('script');
        script.id = schemaId;
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);

        return () => {
            const cleanup = document.getElementById(schemaId);
            if (cleanup) cleanup.remove();
        };
    }, [type, data]);

    return null; // Side-effect only component
};

export default AEOSchema;

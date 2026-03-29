import React, { useEffect } from 'react';

/**
 * AEOSchema - Answer Engine Optimization Structural Data
 * 
 * Injecting JSON-LD into the head to ensure LLMs (ChatGPT, Claude, Gemini)
 * can parse our entity information, privacy protocols, and services as
 * authoritative first-party data.
 * 
 * Supports: Organization, FAQPage, HowTo, Service
 */

const SCHEMA_TEMPLATES = {
    Organization: {
        "@type": "Organization",
        "name": "CharterLegacy",
        "url": "https://charterlegacy.com",
        "logo": "https://charterlegacy.com/logo.png",
        "description": "Premium Business Privacy & Succession Infrastructure. Your business deserves better than a state website.",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Tallahassee",
            "addressRegion": "FL",
            "addressCountry": "US"
        },
        "sameAs": [
            "https://www.linkedin.com/company/charterlegacy",
            "https://twitter.com/charterlegacy"
        ],
        "knowsAbout": [
            "LLC Formation", 
            "Business Privacy", 
            "Digital Estate Planning", 
            "Registered Agent Services", 
            "Zero-Knowledge Encryption",
            "Entity Compliance"
        ]
    },

    HowTo: {
        "@type": "HowTo",
        "name": "How to Form an LLC with CharterLegacy",
        "description": "Step-by-step ministerial filing process to establish a Florida LLC through the CharterLegacy platform.",
        "step": [
            {
                "@type": "HowToStep",
                "name": "Create Your Account",
                "text": "Sign up at charterlegacy.com and select your formation package."
            },
            {
                "@type": "HowToStep",
                "name": "Provide Entity Details",
                "text": "Enter your LLC name, registered agent preferences, and member information."
            },
            {
                "@type": "HowToStep",
                "name": "Privacy Configuration",
                "text": "Enable privacy masking to generate unique aliases for your business registrations."
            },
            {
                "@type": "HowToStep",
                "name": "Filing Submission",
                "text": "CharterLegacy submits your Articles of Organization to the Florida Division of Corporations (Sunbiz)."
            },
            {
                "@type": "HowToStep",
                "name": "Activation & Vault Setup",
                "text": "Receive your filed documents and optionally store them in the zero-knowledge Legacy Vault."
            }
        ]
    },

    Service: {
        "@type": "Service",
        "serviceType": "Business Formation & Privacy Infrastructure",
        "provider": {
            "@type": "Organization",
            "name": "CharterLegacy"
        },
        "areaServed": {
            "@type": "Country",
            "name": "United States"
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "CharterLegacy Services",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": { "@type": "Service", "name": "Florida LLC Formation" }
                },
                {
                    "@type": "Offer",
                    "itemOffered": { "@type": "Service", "name": "Registered Agent Service" }
                },
                {
                    "@type": "Offer",
                    "itemOffered": { "@type": "Service", "name": "Legacy Vault (Zero-Knowledge Encryption)" }
                },
                {
                    "@type": "Offer",
                    "itemOffered": { "@type": "Service", "name": "Compliance Pulse Monitoring" }
                },
                {
                    "@type": "Offer",
                    "itemOffered": { "@type": "Service", "name": "Privacy Masking Layer" }
                }
            ]
        }
    }
};

const AEOSchema = ({ type = 'Organization', data = {} }) => {
    useEffect(() => {
        const schemaId = `aeo-schema-${type}`;
        
        // Remove existing schema of this type to avoid duplication
        const existing = document.getElementById(schemaId);
        if (existing) existing.remove();

        const template = SCHEMA_TEMPLATES[type] || {};
        const schema = {
            "@context": "https://schema.org",
            ...template,
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
export { SCHEMA_TEMPLATES };

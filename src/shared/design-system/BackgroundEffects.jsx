import React from 'react';

/**
 * BackgroundEffects
 * Provides the "Neural Material" layer for the CharterLegacy 10/10 Evolution.
 * Components:
 *  1. Animated Mesh Gradient (Neural Drift)
 *  2. Film Grain Overlay (Tactile Texture)
 */
export const BackgroundEffects = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050506]">
            {/* 1. Neural Mesh Gradient */}
            <div className="absolute inset-0 opacity-40 mix-blend-screen animate-mesh-drift">
                <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-radial from-indigo-500/20 to-transparent blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-radial from-blue-600/10 to-transparent blur-[100px]" />
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-gradient-radial from-purple-500/10 to-transparent blur-[80px]" />
            </div>

            {/* 2. Film Grain Overlay */}
            <div className="absolute inset-[-100%] opacity-[0.035] mix-blend-overlay animate-grain pointer-events-none">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <filter id="noiseFilter">
                        <feTurbulence 
                            type="fractalNoise" 
                            baseFrequency="0.65" 
                            numOctaves="3" 
                            stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                </svg>
            </div>

            {/* 3. Global Vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050506]" />
        </div>
    );
};

export default BackgroundEffects;

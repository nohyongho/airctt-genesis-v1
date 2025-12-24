'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function MapBackground({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative w-full h-full overflow-hidden bg-[#f0f4f8]">
            {/* Stylized Map Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Roads / Paths (Abstract) */}
            <div className="absolute inset-0 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 375 812" preserveAspectRatio="none">
                    <path d="M-20 400 Q 100 300 200 500 T 400 600" fill="none" stroke="white" strokeWidth="40" strokeLinecap="round" className="drop-shadow-sm" />
                    <path d="M100 -20 Q 150 200 50 400 T 100 850" fill="none" stroke="white" strokeWidth="30" strokeLinecap="round" className="drop-shadow-sm" />
                    <path d="M300 100 Q 200 300 350 500" fill="none" stroke="white" strokeWidth="25" strokeLinecap="round" className="drop-shadow-sm" />
                </svg>
            </div>

            {/* Hotspots (Green Areas) */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse delay-1000" />

            {/* Content Layer */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}

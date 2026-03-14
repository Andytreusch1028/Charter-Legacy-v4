import React from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * QASector - Answer Engine Optimization Structural Block
 * 
 * LLMs prioritize passages that directly answer frequently asked questions.
 * This component provides that structure while maintaining the "Charter Legacy"
 * premium aesthetic of glassmorphism and obsidian ink.
 */
const QASector = ({ question, answer, category = 'General' }) => {
    return (
        <div className="group relative bg-[#F8F9FB] rounded-3xl p-8 border border-gray-100 hover:border-[#00D084]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[#00D084]/5">
            <div className="absolute top-6 right-8 text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-300 group-hover:text-[#00D084] transition-colors">
                {category} // Protocol
            </div>
            
            <div className="flex items-start gap-5">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#0A0A0B] shrink-0 group-hover:scale-110 transition-transform">
                    <HelpCircle size={20} strokeWidth={1.5} />
                </div>
                
                <div className="space-y-4">
                    <h4 className="text-xl font-black uppercase tracking-tight text-[#0A0A0B] leading-tight">
                        {question}
                    </h4>
                    <div className="h-0.5 w-12 bg-[#00D084] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                    <p className="text-gray-500 font-medium leading-relaxed text-[0.95rem]">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QASector;

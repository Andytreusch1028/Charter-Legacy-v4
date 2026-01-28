import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  ChevronRight, 
  User, 
  Home, 
  MapPin, 
  ShieldCheck 
} from 'lucide-react';

const StepIndicator = ({ current, total }) => (
  <div className="flex gap-2 mb-8">
    {[...Array(total)].map((_, i) => (
      <div 
        key={i} 
        className={`h-1 flex-grow rounded-full transition-all duration-500 ${
          i < current ? 'bg-[#007AFF]' : 'bg-gray-800'
        }`} 
      />
    ))}
  </div>
);

export default function App() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => step < totalSteps && setStep(step + 1);
  const prevStep = () => step > 1 && setStep(step - 1);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-6 md:p-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <button onClick={prevStep} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm">Back to Dashboard</span>
        </button>
        <div className="text-xs font-mono text-gray-600 tracking-widest uppercase">
          Protocol: LLC-FL-2024
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <StepIndicator current={step} total={totalSteps} />

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-bold mb-4">Naming the Venture.</h2>
            <p className="text-gray-400 mb-8">What will you call your masterpiece? We will check the Sunbiz registry in real-time.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Company Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Acme Innovations" 
                  className="w-full bg-[#1D1D1F] border border-gray-800 focus:border-[#007AFF] outline-none rounded-2xl px-6 py-4 text-xl transition-all"
                />
              </div>
              <div className="bg-[#1D1D1F] border border-[#007AFF]/20 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#007AFF] shrink-0 mt-0.5" />
                <p className="text-sm text-gray-400 italic">
                  Statute 605.0112: Your name must be distinguishable from other active entities on record with the Department of State.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-bold mb-4">The Privacy Shield.</h2>
            <p className="text-gray-400 mb-8">We loathe the exposure of personal addresses. How do you want to secure your home?</p>
            
            <div className="space-y-4">
              <div className="bg-[#1D1D1F] border-2 border-[#007AFF] p-6 rounded-3xl flex items-center justify-between group">
                <div>
                  <h4 className="font-bold text-lg">Charter DeLand Hub (Recommended)</h4>
                  <p className="text-sm text-gray-400">Use our professional office as your principal and mailing address.</p>
                </div>
                <div className="bg-[#007AFF] p-1.5 rounded-full">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#1D1D1F] border border-gray-800 p-6 rounded-3xl flex items-center justify-between opacity-50 cursor-not-allowed">
                <div>
                  <h4 className="font-bold text-lg text-gray-500 underline decoration-red-500">Manual Entry</h4>
                  <p className="text-sm text-gray-600">Expose your personal home address to public records.</p>
                </div>
                <Home className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-12 flex items-center justify-between">
          <div className="text-gray-600 text-sm">
            Step {step} of {totalSteps}
          </div>
          <button 
            onClick={nextStep}
            className="bg-white text-black px-10 py-4 rounded-full font-bold hover:bg-gray-200 active:scale-95 transition-all flex items-center gap-2"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
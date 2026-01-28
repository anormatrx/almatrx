import React from 'react';
import { 
  BrainCircuit, 
  GitBranch, 
  Layout, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  ArrowRight,
  Code,
  ArrowLeft
} from 'lucide-react';
import CyberButton from './CyberButton';
import { translations, Language } from '../translations';

interface SystemInternalsProps {
  onStart: () => void;
  lang: Language;
}

const SystemInternals: React.FC<SystemInternalsProps> = ({ onStart, lang }) => {
  const t = translations[lang];
  const steps = [
    {
      id: 1,
      title: "Intent & Domain Analysis",
      icon: <BrainCircuit className="text-[#00A3FF]" size={24} />,
      description: "Uses Gemini 3 Flash to deconstruct abstract ideas into concrete executive summaries, maturity scores, and gap analysis.",
      details: ["Input Parsing", "Market Gap Check", "Scope Definition"]
    },
    {
      id: 2,
      title: "Scenario Simulation",
      icon: <Code className="text-green-400" size={24} />,
      description: "Generates user stories with strict acceptance criteria to ensure the application meets real-world needs.",
      details: ["User Stories", "Acceptance Criteria", "Priority Mapping"]
    },
    {
      id: 3,
      title: "Logic Flow Architecture",
      icon: <GitBranch className="text-[#7000FF]" size={24} />,
      description: "Maps the entire backend logic as a connected graph of Inputs, Processes, Decisions, and Databases.",
      details: ["Data Flow Graph", "Node Relations", "Edge Case Handling"]
    },
    {
      id: 4,
      title: "UI/UX Blueprints",
      icon: <Layout className="text-yellow-400" size={24} />,
      description: "Creates visual component structures using Tailwind CSS based on the generated scenarios and design system.",
      details: ["Design System", "Component Code", "Responsive Layouts"]
    },
    {
      id: 5,
      title: "Tech Stack Optimization",
      icon: <Layers className="text-pink-500" size={24} />,
      description: "Recommends the optimal technology stack (Frontend, Backend, DevOps) with risk assessment and pros/cons.",
      details: ["Tool Selection", "Risk Analysis", "Alternative Evaluation"]
    },
    {
      id: 6,
      title: "System Validation",
      icon: <ShieldCheck className="text-red-500" size={24} />,
      description: "Performs programmatic and AI-based integrity checks to ensure the blueprint is complete and secure.",
      details: ["Security Scan", "Logic Consistency", "Completeness Check"]
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-16">
        <div className="inline-block px-3 py-1 mb-4 border border-green-500/30 bg-green-500/10 rounded-full">
          <span className="text-xs font-mono text-green-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Open Source Architecture
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          {t.internals_title} <span className="text-[#00A3FF]">{t.internals_subtitle}</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          {t.internals_desc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 relative">
        {/* Connecting Line (Desktop) */}
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00A3FF]/20 to-transparent -z-10"></div>
        
        {steps.map((step) => (
          <div key={step.id} className="bg-[#151921] border border-gray-800 p-6 rounded-lg hover:border-[#00A3FF]/50 transition-all group relative overflow-hidden">
            <div className={`absolute top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
              <span className="text-6xl font-black text-white">{step.id}</span>
            </div>
            
            <div className="w-12 h-12 bg-[#0B0E14] border border-gray-700 rounded-lg flex items-center justify-center mb-4 group-hover:border-[#00A3FF] transition-colors shadow-lg relative z-10">
              {step.icon}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
            <p className="text-sm text-gray-400 mb-4 h-16">{step.description}</p>
            
            <div className="border-t border-gray-800 pt-4">
              <ul className="space-y-2">
                {step.details.map((detail, i) => (
                  <li key={i} className="text-xs text-gray-500 font-mono flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#00A3FF] rounded-full"></span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0B0E14] border border-[#00A3FF]/30 rounded-xl p-8 md:p-12 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="relative z-10">
          <Cpu className="w-16 h-16 text-[#00A3FF] mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-4">{t.ready_title}</h3>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            {t.ready_desc}
          </p>
          <CyberButton onClick={onStart}>
            {t.btn_init_core} {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </CyberButton>
        </div>
      </div>
    </div>
  );
};

export default SystemInternals;
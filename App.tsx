import React, { useState, useEffect } from 'react';
import InputSection from './components/InputSection';
import Dashboard from './components/Dashboard';
import SystemInternals from './components/SystemInternals';
import { generateFullArchitecture } from './services/pipeline';
import { ProjectState, AppStep, GroundingChunk } from './types';
import { LayoutGrid, Terminal, Globe } from 'lucide-react';
import { translations, Language } from './translations';

function App() {
  const [view, setView] = useState<'core' | 'internals'>('core');
  const [lang, setLang] = useState<Language>('en');
  
  const [state, setState] = useState<ProjectState>({
    idea: '',
    isGenerating: false,
    currentStep: AppStep.INPUT,
    error: null,
    result: null,
    groundingLinks: []
  });

  // Update body direction and language attribute
  useEffect(() => {
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = translations[lang];

  const getStepLabel = (step: AppStep) => {
    switch(step) {
      case AppStep.ANALYSIS: return t.step_analysis;
      case AppStep.SCENARIOS: return t.step_scenarios;
      case AppStep.LOGIC: return t.step_logic;
      case AppStep.UI: return t.step_ui;
      case AppStep.STACK: return t.step_stack;
      case AppStep.VALIDATION: return t.step_validation;
      case AppStep.COMPLETE: return t.step_complete;
      default: return t.processing;
    }
  };

  const handleGenerate = async (idea: string, imageSize: '1K' | '2K' | '4K') => {
    // Check API Key for Image Generation (Gemini 3 Pro Image)
    if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
       try {
         await window.aistudio.openSelectKey();
       } catch (e) {
         console.error("API Key Selection cancelled or failed", e);
         setState(prev => ({ ...prev, error: "API Key selection required for this model." }));
         return;
       }
    }

    setState(prev => ({ ...prev, idea, isGenerating: true, error: null, currentStep: AppStep.ANALYSIS }));
    
    try {
      const { blueprint, groundingLinks } = await generateFullArchitecture(idea, imageSize, lang, (step) => {
        setState(prev => ({ ...prev, currentStep: step }));
      });

      setState(prev => ({
        ...prev,
        isGenerating: false,
        currentStep: AppStep.COMPLETE,
        result: blueprint,
        groundingLinks: groundingLinks
      }));

    } catch (error) {
      console.error(error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        currentStep: AppStep.INPUT,
        error: t.pipeline_error
      }));
    }
  };

  const resetProject = () => {
    setState(prev => ({ ...prev, result: null, currentStep: AppStep.INPUT }));
    setView('core');
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  };

  return (
    <div className={`min-h-screen cyber-grid text-[#E0E0E0] selection:bg-[#00A3FF] selection:text-black font-sans ${lang === 'ar' ? 'font-tajawal' : ''}`}>
      {/* Navbar */}
      <nav className="w-full border-b border-[#00A3FF]/20 bg-[#0B0E14]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => setView('core')}
          >
            <div className="w-8 h-8 bg-[#00A3FF] clip-path-polygon flex items-center justify-center group-hover:bg-white transition-colors">
              <span className="font-bold text-black text-lg">A</span>
            </div>
            <span className="font-bold tracking-wider text-lg">ARCHITECT<span className="text-[#00A3FF]">PRO</span></span>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
             <button 
               onClick={() => setView('core')}
               className={`flex items-center gap-2 text-sm font-mono transition-colors ${view === 'core' ? 'text-[#00A3FF]' : 'text-gray-500 hover:text-white'}`}
             >
               <Terminal size={14} /> <span className="hidden sm:inline">{t.nav_core}</span>
             </button>
             <button 
               onClick={() => setView('internals')}
               className={`flex items-center gap-2 text-sm font-mono transition-colors ${view === 'internals' ? 'text-[#00A3FF]' : 'text-gray-500 hover:text-white'}`}
             >
               <LayoutGrid size={14} /> <span className="hidden sm:inline">{t.nav_internals}</span>
             </button>

             {/* Language Switcher */}
             <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2 py-1 bg-[#0F1219] border border-gray-700 rounded text-xs text-[#00A3FF] hover:border-[#00A3FF] transition-all"
             >
                <Globe size={12} />
                <span className="font-bold uppercase">{lang === 'en' ? 'AR' : 'EN'}</span>
             </button>

             <div className="h-4 w-px bg-gray-700 mx-1 hidden md:block"></div>
             <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>{t.nav_online}</span>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center">
        
        {view === 'internals' ? (
          <SystemInternals onStart={() => setView('core')} lang={lang} />
        ) : (
          <>
            {state.result ? (
              <>
                <div className="w-full max-w-7xl px-4 mt-8 mb-4 flex justify-between">
                    <button 
                      onClick={resetProject}
                      className="text-sm text-gray-500 hover:text-[#00A3FF] flex items-center gap-1 transition-colors"
                    >
                      {lang === 'ar' ? '→' : '←'} {t.new_arch}
                    </button>
                </div>
                <Dashboard data={state.result} groundingLinks={state.groundingLinks} lang={lang} />
              </>
            ) : (
              <InputSection onSubmit={handleGenerate} isGenerating={state.isGenerating} lang={lang} />
            )}
          </>
        )}

        {/* Loading Overlay */}
        {state.isGenerating && (
          <div className="fixed inset-0 z-40 bg-[#0B0E14]/80 backdrop-blur-sm flex items-center justify-center">
             <div className="w-full max-w-md p-6 border border-[#00A3FF]/20 rounded-lg bg-[#0F1219] shadow-[0_0_30px_rgba(0,163,255,0.1)]">
                <div className="mb-4 flex justify-between text-xs font-mono text-[#00A3FF]">
                  <span className="animate-pulse">{t.executing}</span>
                  <span>{state.currentStep}/6</span>
                </div>
                
                {/* Visual Step Indicator */}
                <div className="flex gap-1 mb-4" dir="ltr">
                   {[1, 2, 3, 4, 5, 6].map(step => (
                      <div 
                        key={step} 
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${state.currentStep >= step ? 'bg-[#00A3FF] shadow-[0_0_5px_#00A3FF]' : 'bg-gray-800'}`}
                      />
                   ))}
                </div>

                <div className="h-20 flex items-center justify-center text-center">
                   <p className="font-mono text-sm text-white font-bold animate-pulse">
                      {getStepLabel(state.currentStep)}
                   </p>
                </div>

                <div className="text-center mt-2 flex flex-col gap-1">
                   <p className="text-xs text-gray-500">Gemini 3 Flash & Pro Models</p>
                   {[AppStep.ANALYSIS, AppStep.STACK].includes(state.currentStep) && (
                      <p className="text-[10px] text-[#00A3FF] animate-bounce">
                         Grounding with Google Search...
                      </p>
                   )}
                </div>
             </div>
          </div>
        )}

        {state.error && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-900/90 border border-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50">
            <p className="font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {t.pipeline_error}
            </p>
            <p className="text-sm opacity-80 mt-1">{state.error}</p>
            <button 
              onClick={() => setState(prev => ({...prev, error: null}))}
              className={`absolute top-2 ${lang === 'ar' ? 'left-2' : 'right-2'} text-white/50 hover:text-white`}
            >
              ×
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes progress-indeterminate {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 50%; margin-left: 25%; }
          100% { width: 0%; margin-left: 100%; }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s infinite ease-in-out;
        }
        .clip-path-polygon {
          clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default App;
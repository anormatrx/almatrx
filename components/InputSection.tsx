import React, { useState } from 'react';
import { Cpu, ArrowRight, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import CyberButton from './CyberButton';
import { translations, Language } from '../translations';

interface InputSectionProps {
  onSubmit: (idea: string, imageSize: '1K' | '2K' | '4K') => void;
  isGenerating: boolean;
  lang: Language;
}

const InputSection: React.FC<InputSectionProps> = ({ onSubmit, isGenerating, lang }) => {
  const [input, setInput] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input, imageSize);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-12 mb-20 animate-fade-in-up">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-[#00A3FF]/10 border border-[#00A3FF]/30">
          <Cpu className="w-8 h-8 text-[#00A3FF]" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00A3FF] to-[#7000FF] mb-4">
          {t.hero_title}
        </h1>
        <p className="text-[#E0E0E0] text-lg md:text-xl max-w-2xl mx-auto font-light opacity-80">
          {t.hero_subtitle}
        </p>
      </div>

      <div className="bg-[#0B0E14]/80 backdrop-blur-xl border border-[#00A3FF]/30 rounded-lg p-1 shadow-[0_0_50px_rgba(0,163,255,0.1)]">
        <form onSubmit={handleSubmit} className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.input_placeholder}
            className="w-full h-40 bg-[#0F1219] text-[#E0E0E0] placeholder-gray-600 p-6 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00A3FF] resize-none font-mono text-lg transition-all"
            disabled={isGenerating}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          />
          <div className={`absolute bottom-4 ${lang === 'ar' ? 'right-4' : 'left-4'} flex items-center gap-2`}>
            <div className="flex items-center gap-2 bg-[#0F1219] border border-gray-700 rounded px-2 py-1">
              <ImageIcon size={14} className="text-[#00A3FF]" />
              <select 
                value={imageSize} 
                onChange={(e) => setImageSize(e.target.value as '1K'|'2K'|'4K')}
                className="bg-transparent text-xs text-gray-300 outline-none font-mono cursor-pointer"
                disabled={isGenerating}
              >
                <option value="1K">{t.res_1k}</option>
                <option value="2K">{t.res_2k}</option>
                <option value="4K">{t.res_4k}</option>
              </select>
            </div>
          </div>
          <div className={`absolute bottom-4 ${lang === 'ar' ? 'left-4' : 'right-4'}`}>
            <CyberButton type="submit" isLoading={isGenerating}>
              {isGenerating ? t.btn_generating : t.btn_architect} 
              {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </CyberButton>
          </div>
        </form>
      </div>
      
      {/* Visual Decorators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 opacity-40">
        {[t.feature_scenario, t.feature_ui, t.feature_logic, t.feature_stack].map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-xs font-mono text-[#00A3FF] justify-center md:justify-start">
            <span className="w-2 h-2 bg-[#00A3FF] rounded-full animate-pulse"></span>
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InputSection;
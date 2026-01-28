// ... imports
import React, { useState } from 'react';
import { 
  Layout, 
  GitBranch, 
  Layers, 
  BookOpen, 
  ExternalLink,
  Code,
  Database,
  Eye,
  Terminal,
  BrainCircuit,
  AlertTriangle,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Copy,
  Check,
  Palette,
  Cpu,
  Box,
  ImageIcon
} from 'lucide-react';
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import { ArchitecturalBlueprint, GroundingChunk } from '../types';
import CyberBadge from './CyberBadge';
import { translations, Language } from '../translations';

interface DashboardProps {
  data: ArchitecturalBlueprint;
  groundingLinks: GroundingChunk[];
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ data, groundingLinks, lang }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'scenario' | 'ui' | 'logic' | 'stack' | 'designs'>('analysis');
  const [uiViewMode, setUiViewMode] = useState<Record<number, 'preview' | 'code'>>({});
  const [copiedStates, setCopiedStates] = useState<Record<number, boolean>>({});
  
  const t = translations[lang];

  const getMaturityColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [index]: false }));
    }, 2000);
  };

  const getSankeyData = () => {
    const nodes: { name: string }[] = [];
    const links: { source: number; target: number; value: number }[] = [];
    
    // Safety check for logicFlow presence
    if (!data?.logicFlow) return { nodes: [], links: [] };

    // Map IDs to Array Indices for Recharts
    const idMap = new Map<string, number>();
    
    data.logicFlow.forEach((node, index) => {
      // We display the name, but map based on ID logic
      nodes.push({ name: node.name || 'Unknown Node' });
      idMap.set(node.id, index);
    });

    data.logicFlow.forEach((node) => {
      const sourceIndex = idMap.get(node.id);
      
      if (sourceIndex !== undefined && node.connections) {
        node.connections.forEach((targetId) => {
          const targetIndex = idMap.get(targetId);
          if (targetIndex !== undefined) {
            links.push({ source: sourceIndex, target: targetIndex, value: 1 });
          }
        });
      }
    });

    if (links.length === 0 && nodes.length > 1) {
       // Fallback for visualization if no links parsed correctly
       links.push({ source: 0, target: 1, value: 1});
    }

    return { nodes, links };
  };

  const sankeyData = getSankeyData();

  // Design Assets Mock Data
  const designAssets = [
    {
      name: 'Neon Primary Button',
      category: 'UI Element',
      source: 'Nano',
      preview: <button className="px-6 py-2 bg-[#00A3FF] text-black font-bold uppercase tracking-wider clip-path-polygon hover:bg-[#33B4FF] transition-all">Connect</button>,
      code: `<button class="px-6 py-2 bg-[#00A3FF] text-black font-bold uppercase tracking-wider clip-path-polygon hover:bg-[#33B4FF] transition-all">Connect</button>`
    },
    {
      name: 'Holographic Card',
      category: 'UI Element',
      source: 'Banana Pro 2',
      preview: <div className="p-4 border border-[#00A3FF]/30 bg-[#00A3FF]/5 backdrop-blur-sm rounded"><h4 className="text-[#00A3FF] font-mono text-xs mb-1">STATUS</h4><span className="text-white font-bold">ONLINE</span></div>,
      code: `<div class="p-4 border border-[#00A3FF]/30 bg-[#00A3FF]/5 backdrop-blur-sm rounded">\n  <h4 class="text-[#00A3FF] font-mono text-xs mb-1">STATUS</h4>\n  <span class="text-white font-bold">ONLINE</span>\n</div>`
    },
    {
      name: 'Data Input Field',
      category: 'UI Element',
      source: 'Stitch',
      preview: <div className="relative w-full"><input type="text" className="bg-[#0B0E14] border border-gray-700 text-white px-3 py-2 w-full focus:border-[#7000FF] outline-none transition-colors text-sm" placeholder="Enter command..." /><div className="absolute right-0 top-0 h-full w-1 bg-[#7000FF]"></div></div>,
      code: `<div class="relative">\n  <input type="text" class="bg-[#0B0E14] border border-gray-700 text-white px-3 py-2 w-full focus:border-[#7000FF] outline-none transition-colors" placeholder="Enter command..." />\n  <div class="absolute right-0 top-0 h-full w-1 bg-[#7000FF]"></div>\n</div>`
    },
    {
      name: 'Cyber Alert',
      category: 'UI Element',
      source: 'Nano',
      preview: <div className="flex items-center gap-3 px-4 py-3 bg-red-900/20 border-l-2 border-red-500"><AlertTriangle size={16} className="text-red-500" /><span className="text-red-200 text-xs font-mono">SYSTEM BREACH</span></div>,
      code: `<div class="flex items-center gap-3 px-4 py-3 bg-red-900/20 border-l-2 border-red-500">\n  <!-- Icon: AlertTriangle -->\n  <span class="text-red-200 text-xs font-mono">SYSTEM BREACH</span>\n</div>`
    },
    {
      name: 'Processor Icon',
      category: 'Icon',
      source: 'Banana Pro 2',
      preview: <Cpu size={32} className="text-[#00A3FF]" />,
      code: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00A3FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cpu"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>`
    },
    {
      name: 'Neural Node',
      category: 'Icon',
      source: 'Stitch',
      preview: <BrainCircuit size={32} className="text-[#7000FF]" />,
      code: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7000FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain-circuit"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M9 13a4.5 4.5 0 0 0 3-4"/><path d="M6.003 5.125A3 3 0 0 1 19.528 17.75"/><path d="M21 12c0 2.66-2 4-3 4"/><path d="M21 21v-2a4 4 0 0 0-3.17-3.97"/></svg>`
    }
  ];

  // Safety checks for rendering
  if (!data) return <div className="p-8 text-center text-red-500">Error: No Data Available</div>;

  const maturityScore = data.maturityAssessment?.score || 0;
  const verdict = data.maturityAssessment?.verdict || 'Unknown';
  const gapAnalysis = data.maturityAssessment?.gapAnalysis || 'No gap analysis available.';
  const inScope = data.logicLayer?.inputBoundaries?.analyzableScope || [];
  const outOfScope = data.logicLayer?.inputBoundaries?.outOfScope || [];
  const assumptions = data.logicLayer?.assumptions || [];
  const conflicts = data.logicLayer?.detectedConflicts || [];

  // ... return JSX
  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-20 animate-fade-in">
      
      {/* Header Info ... */}
      <div className="mb-8 p-6 rounded-lg border border-[#00A3FF]/30 bg-[#0B0E14]/80 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row gap-6 shadow-[0_0_50px_rgba(0,163,255,0.05)]">
        {data.generatedImage && (
            <div className="absolute inset-0 opacity-20 z-0 pointer-events-none">
                <img src={data.generatedImage} alt="Architectural Concept" className="w-full h-full object-cover mix-blend-screen" />
            </div>
        )}
        <div className="flex-grow z-10">
            <h2 className="text-3xl font-bold text-white mb-2">{data.appName || 'Untitled Project'}</h2>
            <p className="text-[#00A3FF] text-lg mb-4 font-mono">{data.tagline || 'System Architecture'}</p>
            <p className="text-gray-400 max-w-3xl">{data.executiveSummary || 'No summary available.'}</p>
        </div>
        
        {/* Maturity Index Display */}
        <div className="min-w-[200px] flex flex-col items-center justify-center bg-[#151921]/90 rounded-lg border border-gray-800 p-4 z-10 backdrop-blur">
            <span className="text-xs text-gray-500 uppercase tracking-widest mb-2">{t.maturity_index}</span>
            <div className={`text-5xl font-black ${getMaturityColor(maturityScore)}`}>
                {maturityScore}
            </div>
            <div className="text-sm text-gray-400 font-mono mt-1">{verdict}</div>
            <div className="w-full h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                <div 
                    className={`h-full ${maturityScore < 40 ? 'bg-red-500' : maturityScore < 70 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                    style={{ width: `${maturityScore}%` }}
                ></div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-[#333]">
        <TabButton 
          active={activeTab === 'analysis'} 
          onClick={() => setActiveTab('analysis')} 
          icon={<BrainCircuit size={18} />} 
          label={t.tab_analysis}
        />
        <TabButton 
          active={activeTab === 'scenario'} 
          onClick={() => setActiveTab('scenario')} 
          icon={<BookOpen size={18} />} 
          label={t.tab_scenario}
        />
        <TabButton 
          active={activeTab === 'ui'} 
          onClick={() => setActiveTab('ui')} 
          icon={<Layout size={18} />} 
          label={t.tab_ui} 
        />
        <TabButton 
          active={activeTab === 'logic'} 
          onClick={() => setActiveTab('logic')} 
          icon={<GitBranch size={18} />} 
          label={t.tab_logic} 
        />
        <TabButton 
          active={activeTab === 'stack'} 
          onClick={() => setActiveTab('stack')} 
          icon={<Layers size={18} />} 
          label={t.tab_stack}
        />
        <TabButton 
          active={activeTab === 'designs'} 
          onClick={() => setActiveTab('designs')} 
          icon={<Palette size={18} />} 
          label={t.tab_designs}
        />
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">

        {/* --- NEW ANALYSIS LAYER TAB --- */}
        {activeTab === 'analysis' && (
            <div className="space-y-6 animate-fade-in">
                {/* Gap Analysis */}
                <div className="bg-[#151921] border border-gray-800 p-5 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <ShieldCheck className="text-[#00A3FF]" /> {t.gap_analysis}
                    </h3>
                    <p className="text-gray-400 mb-4">{gapAnalysis}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/30 p-3 rounded border border-green-900/30">
                            <span className="text-xs text-green-500 font-bold uppercase block mb-2">{t.in_scope}</span>
                            <ul className="list-disc list-inside text-sm text-gray-400">
                                {inScope.length > 0 ? inScope.map((item, i) => (
                                    <li key={i}>{item}</li>
                                )) : <li className="text-gray-600">No defined scope.</li>}
                            </ul>
                        </div>
                        <div className="bg-black/30 p-3 rounded border border-red-900/30">
                            <span className="text-xs text-red-500 font-bold uppercase block mb-2">{t.out_scope}</span>
                            <ul className="list-disc list-inside text-sm text-gray-400">
                                {outOfScope.length > 0 ? outOfScope.map((item, i) => (
                                    <li key={i}>{item}</li>
                                )) : <li className="text-gray-600">No defined boundaries.</li>}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Assumptions */}
                    <div className="bg-[#151921] border border-gray-800 p-5 rounded-lg">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <BrainCircuit className="text-yellow-500" /> {t.assumptions}
                        </h3>
                        <div className="space-y-3">
                            {assumptions.map((assumption, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-[#0B0E14] rounded border border-gray-800">
                                    <div className={`mt-1 w-2 h-2 rounded-full ${assumption.confidenceScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    <div className="flex-grow">
                                        <p className="text-sm text-gray-300">{assumption.statement}</p>
                                        <div className="flex gap-2 mt-2">
                                            <CyberBadge label={`${assumption.confidenceScore}%`} type="info" />
                                            <CyberBadge label={assumption.riskLevel} type={assumption.riskLevel === 'High' ? 'error' : assumption.riskLevel === 'Medium' ? 'warning' : 'success'} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {assumptions.length === 0 && <p className="text-gray-500 text-sm italic">No assumptions generated.</p>}
                        </div>
                    </div>

                    {/* Conflicts */}
                    <div className="bg-[#151921] border border-gray-800 p-5 rounded-lg">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-red-500" /> {t.conflicts}
                        </h3>
                        {conflicts && conflicts.length > 0 ? (
                            <div className="space-y-3">
                                {conflicts.map((conflict, i) => (
                                    <div key={i} className="p-3 bg-red-900/10 border border-red-500/20 rounded">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-red-400 font-bold text-sm">{conflict.description}</span>
                                            <CyberBadge label={conflict.severity} type={conflict.severity === 'High' ? 'error' : 'warning'} />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2"><span className="text-gray-500 font-bold">Suggestion:</span> {conflict.resolutionSuggestion}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm italic p-4 text-center">No major logical conflicts detected.</div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'scenario' && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {data.scenarios?.map((scenario, idx) => (
              <div key={idx} className="bg-[#151921] border border-gray-800 p-6 rounded-lg hover:border-[#00A3FF]/50 transition-colors">
                <h3 className="text-xl font-bold text-white mb-3">{scenario.title}</h3>
                <div className="mb-4">
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">{t.user_story}</span>
                  <p className="text-gray-300 mt-1 italic">"{scenario.userStory}"</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">{t.acceptance_criteria}</span>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-400">
                    {scenario.acceptanceCriteria?.map((ac, i) => (
                      <li key={i}>{ac}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            {(!data.scenarios || data.scenarios.length === 0) && (
                 <div className="text-gray-500 col-span-2 text-center py-10">No scenarios generated.</div>
            )}
          </div>
        )}

        {activeTab === 'ui' && (
          <div className="space-y-12">
            {data.uiBlueprints?.map((comp, idx) => {
               const mode = uiViewMode[idx] || 'preview';
               return (
                <div key={idx} className="bg-[#151921] border border-gray-800 rounded-lg overflow-hidden flex flex-col shadow-2xl">
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-800 bg-[#0B0E14] flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-[#00A3FF] text-lg">{comp.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{comp.description}</p>
                    </div>
                    <div className="flex bg-[#0F1219] p-1 rounded border border-gray-800 gap-1">
                      <button 
                        onClick={() => setUiViewMode(prev => ({ ...prev, [idx]: 'preview' }))}
                        className={`p-2 rounded flex items-center gap-2 text-xs font-bold transition-all ${mode === 'preview' ? 'bg-[#00A3FF] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                      >
                        <Eye size={14} /> {t.preview}
                      </button>
                      <button 
                        onClick={() => setUiViewMode(prev => ({ ...prev, [idx]: 'code' }))}
                        className={`p-2 rounded flex items-center gap-2 text-xs font-bold transition-all ${mode === 'code' ? 'bg-[#7000FF] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                      >
                        <Terminal size={14} /> {t.code}
                      </button>
                      <button
                        onClick={() => handleCopy(comp.codeSnippet, idx)}
                        className={`p-2 rounded flex items-center gap-2 text-xs font-bold transition-all ${copiedStates[idx] ? 'text-green-500 bg-green-900/20' : 'text-gray-500 hover:text-white'}`}
                        title="Copy Code"
                      >
                          {copiedStates[idx] ? <Check size={14} /> : <Copy size={14} />}
                          {copiedStates[idx] ? t.copied : t.copy}
                      </button>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="relative group min-h-[300px] bg-[#0F1219]" dir="ltr">
                    {mode === 'preview' ? (
                      <div className="w-full h-full p-8 overflow-x-auto">
                        <div className="bg-black/50 border border-dashed border-gray-700 rounded-lg p-4 min-w-[300px]">
                           {/* DANGEROUSLY SET INNER HTML: Used for rendering AI generated UI mockups */}
                           <div dangerouslySetInnerHTML={{ __html: comp.codeSnippet }} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full overflow-auto max-h-[400px]">
                         <pre className="text-xs text-green-400 font-mono p-6 whitespace-pre-wrap">
                            {comp.codeSnippet}
                         </pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
             {(!data.uiBlueprints || data.uiBlueprints.length === 0) && (
                 <div className="text-gray-500 text-center py-10">No UI Blueprints generated.</div>
            )}
          </div>
        )}

        {activeTab === 'logic' && (
          <div className="bg-[#151921] border border-gray-800 rounded-lg p-6 h-[600px] flex flex-col">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="text-[#7000FF]" /> {t.tab_logic}
            </h3>
            <div className="flex-grow w-full" dir="ltr">
              {sankeyData.nodes.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <Sankey
                    data={sankeyData}
                    node={{ stroke: '#00A3FF', strokeWidth: 0, fill: '#00A3FF', width: 10 }}
                    link={{ stroke: '#7000FF', strokeOpacity: 0.3 }}
                  >
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#333', color: '#fff' }} 
                      itemStyle={{ color: '#00A3FF' }}
                    />
                  </Sankey>
                </ResponsiveContainer>
              ) : (
                 <div className="flex items-center justify-center h-full text-gray-500">
                    Not enough connections to visualize flow.
                 </div>
              )}
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
               {data.logicFlow?.map((node, i) => (
                 <div key={i} className="bg-[#0B0E14] p-3 rounded border border-gray-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-white">{node.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        node.type === 'Database' ? 'bg-yellow-900 text-yellow-200' : 
                        node.type === 'Process' ? 'bg-blue-900 text-blue-200' : 'bg-gray-800 text-gray-300'
                      }`}>{node.type}</span>
                    </div>
                    {node.connections && node.connections.length > 0 && (
                      <div className="text-xs text-gray-500">
                        To: {node.connections.join(', ')}
                      </div>
                    )}
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'stack' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.techStack?.map((item, idx) => (
                <div key={idx} className="bg-[#151921] border-l-4 border-[#7000FF] p-5 rounded-r-lg shadow-lg flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white text-lg">{item.tool}</h4>
                    <span className="text-xs font-mono bg-[#7000FF]/20 text-[#7000FF] px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>
                  
                  {/* Justification & Explainability */}
                  <div className="mb-4">
                      <p className="text-sm text-gray-300 leading-relaxed mb-2 font-semibold">{t.decision_justification}</p>
                      <p className="text-sm text-gray-400 leading-relaxed">{item.reasoning}</p>
                  </div>

                  {item.riskAssessment && (
                    <div className="mb-4 p-2 bg-yellow-900/10 border border-yellow-500/10 rounded">
                         <p className="text-xs text-yellow-500 font-bold uppercase mb-1 flex items-center gap-1">
                            <AlertTriangle size={10} /> {t.risk_assessment}
                         </p>
                         <p className="text-xs text-gray-400">{item.riskAssessment.severity} - {item.riskAssessment.mitigation}</p>
                    </div>
                  )}

                  {/* Alternatives */}
                   {item.rejectedAlternatives && item.rejectedAlternatives.length > 0 && (
                    <div className="mb-4">
                         <p className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-1">
                            <XCircle size={10} /> {t.rejected_alternatives}
                         </p>
                         <p className="text-xs text-gray-500">{item.rejectedAlternatives.map(a => a.name).join(', ')}</p>
                    </div>
                  )}
                  
                  {/* Pros & Cons Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800/50 mt-auto">
                    <div>
                        <h5 className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                             <CheckCircle2 size={12} /> {t.pros}
                        </h5>
                        <ul className="space-y-1">
                            {item.pros?.map((pro, pIdx) => (
                                <li key={pIdx} className="text-xs text-gray-400 pl-2 border-l border-green-500/20">{pro}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                             <XCircle size={12} /> {t.cons}
                        </h5>
                        <ul className="space-y-1">
                            {item.cons?.map((con, cIdx) => (
                                <li key={cIdx} className="text-xs text-gray-400 pl-2 border-l border-red-500/20">{con}</li>
                            ))}
                        </ul>
                    </div>
                  </div>
                </div>
              ))}
              {(!data.techStack || data.techStack.length === 0) && (
                 <div className="text-gray-500 text-center py-10 col-span-2">No Tech Stack generated.</div>
              )}
            </div>

            {groundingLinks && groundingLinks.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-800">
                <h4 className="text-sm font-bold text-[#00A3FF] mb-3 uppercase tracking-wider flex items-center gap-2">
                  <ExternalLink size={14} /> {t.research_sources}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groundingLinks.map((link, i) => (
                    link.web?.uri && (
                      <a 
                        key={i} 
                        href={link.web?.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex flex-col p-3 bg-[#0B0E14] border border-gray-800 rounded hover:border-[#00A3FF] transition-all group"
                      >
                        <span className="text-sm text-gray-300 font-medium truncate group-hover:text-[#00A3FF]">{link.web?.title || 'Source'}</span>
                        <span className="text-xs text-gray-600 truncate">{link.web?.uri}</span>
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* --- DESIGNS TAB --- */}
        {activeTab === 'designs' && (
          <div className="animate-fade-in">
             <div className="mb-6 flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-bold text-white mb-1">{t.design_assets}</h3>
                   <p className="text-sm text-gray-400">{t.design_assets_desc}</p>
                </div>
                <div className="px-3 py-1 bg-[#00A3FF]/10 border border-[#00A3FF]/30 rounded-full text-xs text-[#00A3FF] font-mono">
                   {designAssets.length} {t.assets_available}
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designAssets.map((asset, idx) => (
                  <div key={idx} className="bg-[#151921] border border-gray-800 rounded-lg overflow-hidden flex flex-col hover:border-[#00A3FF]/50 transition-all group shadow-lg">
                     <div className="p-3 bg-[#0B0E14] border-b border-gray-800 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="font-bold text-white text-sm">{asset.name}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{asset.source} • {asset.category}</span>
                        </div>
                        <button
                           onClick={() => handleCopy(asset.code, 1000 + idx)}
                           className={`p-1.5 rounded transition-all ${copiedStates[1000 + idx] ? 'text-green-500 bg-green-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                           title="Copy Source Code"
                        >
                           {copiedStates[1000 + idx] ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                     </div>
                     <div className="flex-grow flex items-center justify-center p-8 bg-[#0F1219] relative min-h-[160px]">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
                         <div className="relative z-10 transform group-hover:scale-105 transition-transform duration-300" dir="ltr">
                            {asset.preview}
                         </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 text-sm ${
      active 
        ? 'text-[#00A3FF] border-b-2 border-[#00A3FF] bg-[#00A3FF]/5' 
        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default Dashboard;
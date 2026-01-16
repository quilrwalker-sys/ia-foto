
import React, { useState } from 'react';
import { AspectRatio, ImageStyle, GeneratedImage, GenerationConfig } from './types';
import { generateAIImage, generatePromptIdea } from './geminiService';

const STYLE_METADATA: Record<ImageStyle, { icon: string; color: string; previewUrl: string }> = {
  [ImageStyle.NONE]: { icon: 'fa-wand-magic', color: 'bg-slate-700', previewUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop' },
  [ImageStyle.CINEMATIC]: { icon: 'fa-film', color: 'bg-zinc-900', previewUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop' },
  [ImageStyle.ANIME]: { icon: 'fa-clapperboard', color: 'bg-pink-600', previewUrl: 'https://images.unsplash.com/photo-1578632738988-6888af5a247b?w=400&h=300&fit=crop' },
  [ImageStyle.DIGITAL_ART]: { icon: 'fa-laptop-code', color: 'bg-violet-600', previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop' },
  [ImageStyle.PHOTOREALISTIC]: { icon: 'fa-camera', color: 'bg-blue-600', previewUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop' },
  [ImageStyle.OIL_PAINTING]: { icon: 'fa-paint-brush', color: 'bg-amber-700', previewUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop' },
  [ImageStyle.CYBERPUNK]: { icon: 'fa-bolt-lightning', color: 'bg-fuchsia-600', previewUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop' },
  [ImageStyle.MINIMALIST]: { icon: 'fa-border-none', color: 'bg-slate-400', previewUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=300&fit=crop' },
  [ImageStyle.SKETCH]: { icon: 'fa-pen-nib', color: 'bg-stone-500', previewUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop' },
};

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGettingIdea, setIsGettingIdea] = useState(false);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [isImageFullyLoaded, setIsImageFullyLoaded] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const [config, setConfig] = useState<GenerationConfig>({
    aspectRatio: "1:1",
    style: ImageStyle.NONE,
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Diga-me o que criar!");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setIsImageFullyLoaded(false); 
    if (window.innerWidth < 768) setShowSettings(false);

    try {
      const imageUrl = await generateAIImage(prompt, config.aspectRatio, config.style);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: prompt,
        timestamp: Date.now(),
        aspectRatio: config.aspectRatio,
        style: config.style,
      };
      setCurrentImage(newImage);
      setHistory(prev => [newImage, ...prev]);
    } catch (err: any) {
      if (err.message?.includes("403") || err.message?.includes("permission")) {
        setError("Erro de permissão. A chave configurada pode não ter acesso a este modelo.");
      } else {
        setError("Erro na geração. Tente novamente.");
      }
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetIdea = async () => {
    setIsGettingIdea(true);
    setError(null);
    try {
      const idea = await generatePromptIdea();
      setPrompt(idea);
    } catch (err: any) {
      setError("Não consegui obter uma ideia no momento.");
    } finally {
      setIsGettingIdea(false);
    }
  };

  const downloadImage = (img: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = img.url;
    link.download = `imagine-${img.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleHistorySelect = (img: GeneratedImage) => {
    if (currentImage?.id === img.id) return;
    setIsImageFullyLoaded(false);
    setTimeout(() => setCurrentImage(img), 50);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans">
      <header className="px-6 py-4 flex items-center justify-between glass sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fas fa-sparkles text-sm text-white"></i>
          </div>
          <span className="font-bold text-lg tracking-tight gradient-text">ImagineAI</span>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showSettings ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
        >
          <i className={`fas ${showSettings ? 'fa-times' : 'fa-sliders'}`}></i>
        </button>
      </header>

      <main className="flex-1 flex flex-col relative max-w-5xl mx-auto w-full">
        <div className={`transition-all duration-500 ease-in-out overflow-y-auto ${showSettings ? 'max-h-[85vh] opacity-100 py-6 px-6 border-b border-white/5 bg-slate-900/80 backdrop-blur-3xl' : 'max-h-0 opacity-0 p-0 pointer-events-none'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Proporção</label>
              <div className="flex flex-wrap gap-3">
                {(["1:1", "4:3", "3:4", "16:9", "9:16"] as AspectRatio[]).map(ratio => (
                  <button key={ratio} onClick={() => setConfig(prev => ({ ...prev, aspectRatio: ratio }))} className={`px-5 py-3 rounded-2xl text-xs font-medium border transition-all ${config.aspectRatio === ratio ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400 shadow-lg' : 'border-slate-800 bg-slate-800/40 text-slate-400'}`}>
                    {ratio}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Estilo</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.values(ImageStyle).map(style => (
                  <button key={style} onClick={() => setConfig(prev => ({ ...prev, style: style }))} className={`group relative overflow-hidden rounded-[24px] aspect-[4/3] border-2 transition-all ${config.style === style ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-800'}`}>
                    <img src={STYLE_METADATA[style].previewUrl} className={`absolute inset-0 w-full h-full object-cover transition-all ${config.style === style ? 'opacity-80 scale-110' : 'opacity-20 grayscale group-hover:opacity-50'}`} alt={style} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-gradient-to-t from-slate-950/60 to-transparent">
                      <i className={`fas ${STYLE_METADATA[style].icon} ${config.style === style ? 'text-white' : 'text-slate-400'}`}></i>
                      <span className="text-[10px] font-bold text-white uppercase">{style}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 min-h-[400px]">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm animate-pulse">Gerando sua obra de arte...</p>
            </div>
          ) : currentImage ? (
            <div className="relative group animate-in">
              {!isImageFullyLoaded && (
                <div className={`mx-auto rounded-3xl animate-shimmer-fast ${
                  currentImage.aspectRatio === "1:1" ? "aspect-square w-[320px]" :
                  currentImage.aspectRatio === "4:3" ? "aspect-[4/3] w-[420px]" :
                  currentImage.aspectRatio === "3:4" ? "aspect-[3/4] w-[320px]" :
                  currentImage.aspectRatio === "16:9" ? "aspect-[16/9] w-[520px]" : "aspect-[9/16] w-[280px]"
                }`}></div>
              )}
              <img key={currentImage.id} src={currentImage.url} onLoad={() => setIsImageFullyLoaded(true)} className={`rounded-3xl shadow-2xl max-h-[65vh] object-contain transition-all duration-700 ${isImageFullyLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`} />
              {isImageFullyLoaded && (
                <button onClick={() => downloadImage(currentImage)} className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-xl font-bold text-xs">
                  <i className="fas fa-download mr-2"></i> Baixar Imagem
                </button>
              )}
            </div>
          ) : (
            <div className="text-center space-y-6 max-w-sm px-10 py-16 glass rounded-[48px] border-dashed border-2 border-slate-800/40">
              <div className="w-20 h-20 bg-slate-800 rounded-3xl mx-auto flex items-center justify-center shadow-lg">
                <i className="fas fa-wand-sparkles text-3xl text-indigo-500"></i>
              </div>
              <h3 className="text-white font-bold">Crie algo incrível</h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Digite um prompt para começar</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 p-4 space-y-4 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent pt-12">
          {history.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {history.map(img => (
                <button key={img.id} onClick={() => handleHistorySelect(img)} className={`flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${currentImage?.id === img.id ? 'border-indigo-500 scale-110 shadow-lg' : 'border-slate-800 opacity-50'}`}>
                  <img src={img.url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="max-w-3xl mx-auto w-full">
            {error && <div className="mb-4 text-center text-[10px] font-bold text-rose-400 bg-rose-400/10 py-3 rounded-xl border border-rose-400/20">{error}</div>}
            <div className="relative flex items-center bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-[32px] shadow-2xl focus-within:ring-2 ring-indigo-500/30">
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Uma raposa mística feita de galáxias..." className="flex-1 bg-transparent border-none focus:ring-0 text-white p-4 text-sm min-h-[50px] max-h-32 resize-none" rows={1} />
              <div className="flex gap-2 pr-2">
                <button onClick={handleGetIdea} disabled={isGettingIdea || isGenerating} className="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-500 text-amber-950 transition-all active:scale-90 shadow-lg shadow-amber-500/20">
                  {isGettingIdea ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-lightbulb"></i>}
                </button>
                <button onClick={handleGenerate} disabled={isGenerating || isGettingIdea} className="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-600 text-white transition-all active:scale-90 shadow-lg shadow-indigo-600/20">
                   {isGenerating ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-arrow-up"></i>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .gradient-text { background: linear-gradient(135deg, #818cf8 0%, #22d3ee 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .glass { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(20px); }
        @keyframes shimmer-fast { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-shimmer-fast { background: linear-gradient(90deg, #0f172a 25%, #1e293b 50%, #0f172a 75%); background-size: 200% 100%; animation: shimmer-fast 1.5s infinite linear; }
        .animate-in { animation: fadeInScale 0.5s ease-out; }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default App;

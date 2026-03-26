import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function DetailView({ urlId, onOpenStream, onBack }: { urlId: string, onOpenStream: (chapterUrlId: string) => void, onBack: () => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDetail = async (retryAttempt = 0) => {
    if (retryAttempt === 0) setLoading(true);
    try {
      const data = await api.getDetail(urlId);
      setDetail(data);
      setErrorMsg(null);
      setLoading(false);
    } catch (error) {
      const delayBase = Math.pow(2, retryAttempt + 1);
      setErrorMsg(`Gagal memuat detail. Auto-retry dalam ${delayBase} detik...`);
      setTimeout(() => {
        fetchDetail(retryAttempt + 1);
      }, delayBase * 1000);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [urlId]);

  const DetailSkeleton = () => (
    <div className="animate-pulse flex flex-col w-full h-screen bg-black">
      <div className="w-full h-[40vh] bg-[#121212]"></div>
      <div className="p-4 sm:p-8 space-y-4">
        <div className="w-2/3 h-8 bg-[#1a1a1a] rounded"></div>
        <div className="w-full h-12 bg-[#1a1a1a] rounded-full"></div>
        <div className="w-full h-24 bg-[#1a1a1a] rounded"></div>
        <div className="space-y-2 mt-8">
          {[1,2,3,4].map(i => <div key={i} className="w-full h-16 bg-[#121212] rounded-xl"></div>)}
        </div>
      </div>
    </div>
  );

  if (loading) return <DetailSkeleton />;
  if (!detail) return <div className="text-center py-20 text-[#666666]">Data tidak ditemukan.</div>;

  const firstEpisode = detail.chapter && detail.chapter.length > 0 ? detail.chapter[detail.chapter.length - 1] : null;

  return (
    <div className="flex flex-col w-full bg-black min-h-screen pb-10">
      {errorMsg && (
        <div className="bg-[#10b981]/20 border border-[#10b981] text-[#10b981] text-sm text-center py-2 px-4 fixed top-0 w-full z-50">
          {errorMsg}
        </div>
      )}

      {/* Backdrop Area */}
      <div className="relative w-full h-[40vh] sm:h-[50vh]">
        <button 
          onClick={onBack}
          className="absolute top-6 left-4 z-40 bg-black/50 p-2 rounded-full text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>

        <img src={detail.cover} alt={detail.judul} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-4 sm:p-8 w-full">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 line-clamp-2">{detail.judul}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#aaaaaa] font-medium">
            <span className="flex items-center gap-1 text-[#10b981]"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> {detail.rating}</span>
            <span className="bg-[#1a1a1a] px-2 py-1 rounded">{detail.author}</span>
            <span className="bg-[#1a1a1a] px-2 py-1 rounded">{detail.published}</span>
            <span className="bg-[#1a1a1a] px-2 py-1 rounded">{detail.type}</span>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 max-w-5xl mx-auto w-full">
        {/* Action Buttons */}
        <div className="flex gap-4 mt-4 mb-6">
          <button 
            onClick={() => firstEpisode && onOpenStream(firstEpisode.url)}
            className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 rounded-full flex justify-center items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Mulai Tonton
          </button>
          <button className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] text-white font-bold py-3 rounded-full flex justify-center items-center gap-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            Subscribe
          </button>
        </div>

        {/* Synopsis */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-2">Synopsis</h3>
          <p className="text-sm leading-relaxed text-[#999999] whitespace-pre-line">
            {detail.sinopsis}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {detail.genre?.map((g: string) => (
              <span key={g} className="text-xs border border-[#333333] px-3 py-1 rounded-full text-[#888888]">{g}</span>
            ))}
          </div>
        </div>

        {/* Episodes List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Episodes ({detail.chapter?.length || 0})</h3>
          </div>
          <div className="flex flex-col gap-3">
            {detail.chapter?.map((ep: any) => (
              <div 
                key={ep.id} 
                onClick={() => onOpenStream(ep.url)}
                className="flex justify-between items-center bg-[#121212] hover:bg-[#1a1a1a] border border-[#1a1a1a] hover:border-[#333333] p-4 rounded-xl cursor-pointer transition-all"
              >
                <div>
                  <h4 className="text-white font-medium mb-1">Episode {ep.ch}</h4>
                  <div className="flex items-center gap-2 text-xs text-[#666666]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <span>{ep.date}</span>
                  </div>
                </div>
                <button className="text-[#10b981] font-bold text-sm bg-[#10b981]/10 px-4 py-2 rounded-full">
                  Putar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

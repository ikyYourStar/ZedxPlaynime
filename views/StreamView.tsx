import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function StreamView({ chapterUrlId, onBack }: { chapterUrlId: string, onBack: () => void }) {
  const [stream, setStream] = useState<any>(null);
  const [resolution, setResolution] = useState("480p");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStreamData = async (retryAttempt = 0) => {
    if (retryAttempt === 0) setLoading(true);
    try {
      const data = await api.getStream(chapterUrlId, resolution);
      const mp4Stream = data?.stream?.find((s: any) => s.link.endsWith(".mp4")) || data?.stream?.[0];
      setStream({ ...data, selectedVideo: mp4Stream });
      setErrorMsg(null);
      setLoading(false);
    } catch (error) {
      const delayBase = Math.pow(2, retryAttempt + 1);
      setErrorMsg(`Gagal memuat video. Auto-retry dalam ${delayBase} detik...`);
      setTimeout(() => {
        fetchStreamData(retryAttempt + 1);
      }, delayBase * 1000);
    }
  };

  useEffect(() => {
    fetchStreamData();
  }, [chapterUrlId, resolution]);

  const StreamSkeleton = () => (
    <div className="max-w-4xl mx-auto w-full animate-pulse flex flex-col gap-4 mt-6 px-4">
      <div className="w-32 h-6 bg-[#1a1a1a] rounded"></div>
      <div className="w-full aspect-video bg-[#121212] rounded-md"></div>
      <div className="w-full h-16 bg-[#121212] rounded-md"></div>
    </div>
  );

  if (loading) return <StreamSkeleton />;
  if (!stream && !loading) return <div className="text-center py-20 text-[#666666]">Gagal memuat stream.</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pt-6 px-4">
      {errorMsg && (
        <div className="bg-[#10b981]/20 border border-[#10b981] text-[#10b981] text-sm text-center py-2 px-4 rounded-md">
          {errorMsg}
        </div>
      )}

      <button 
        onClick={onBack}
        className="self-start text-sm text-[#888888] hover:text-white flex items-center gap-2 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Kembali ke Detail
      </button>
      
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-[#1a1a1a] shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        {stream.selectedVideo ? (
          <video 
            src={stream.selectedVideo.link} 
            controls 
            autoPlay 
            className="w-full h-full outline-none"
            controlsList="nodownload"
          ></video>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#666666]">
            Sumber video resolusi ini tidak tersedia.
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a0a0a] p-4 border border-[#1a1a1a] rounded-xl">
        <div className="flex gap-4 text-sm text-[#888888]">
          <span className="flex items-center gap-1 text-white"><span className="text-[#10b981]">👍</span> {stream.likeCount}</span>
          <span className="flex items-center gap-1"><span className="text-[#555555]">👎</span> {stream.dislikeCount}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#666666]">Resolusi:</span>
          <div className="flex bg-[#121212] border border-[#222222] rounded-lg overflow-hidden p-1">
            {stream.reso?.map((r: string) => (
              <button
                key={r}
                onClick={() => setResolution(r)}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                  resolution === r 
                    ? "bg-[#10b981] text-white" 
                    : "text-[#777777] hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

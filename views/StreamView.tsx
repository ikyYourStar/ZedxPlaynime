import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function StreamView({ chapterUrlId, onBack }: { chapterUrlId: string, onBack: () => void }) {
  const [stream, setStream] = useState<any>(null);
  const [resolution, setResolution] = useState("480p");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreamData = async () => {
      setLoading(true);
      try {
        const data = await api.getStream(chapterUrlId, resolution);
        const mp4Stream = data?.stream?.find((s: any) => s.link.endsWith(".mp4")) || data?.stream?.[0];
        setStream({ ...data, selectedVideo: mp4Stream });
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchStreamData();
  }, [chapterUrlId, resolution]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#333333] border-t-[#888888] rounded-full animate-spin"></div></div>;
  if (!stream) return <p className="text-[#666666]">Failed to load stream.</p>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <button 
        onClick={onBack}
        className="self-start text-sm text-[#888888] hover:text-[#cccccc] flex items-center gap-2 transition-colors"
      >
        ← Back to Details
      </button>
      
      <div className="w-full aspect-video bg-black rounded-md overflow-hidden border border-[#1a1a1a] shadow-[0_0_15px_rgba(0,0,0,0.8)]">
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
            Video source not found for this resolution.
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a0a0a] p-4 border border-[#1a1a1a] rounded-md">
        <div className="flex gap-4 text-sm text-[#888888]">
          <span className="flex items-center gap-1"><span className="text-[#555555]">👍</span> {stream.likeCount}</span>
          <span className="flex items-center gap-1"><span className="text-[#555555]">👎</span> {stream.dislikeCount}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#666666]">Resolution:</span>
          <div className="flex bg-[#111111] border border-[#222222] rounded-md overflow-hidden p-1">
            {stream.reso?.map((r: string) => (
              <button
                key={r}
                onClick={() => setResolution(r)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  resolution === r 
                    ? "bg-[#2a2a2a] text-white" 
                    : "text-[#777777] hover:text-[#aaaaaa] hover:bg-[#1a1a1a]"
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

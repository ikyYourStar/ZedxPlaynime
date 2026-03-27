import { useEffect, useState, useRef } from "react";
import { api } from "../lib/api";

export default function StreamView({ chapterUrlId, onBack }: { chapterUrlId: string, onBack: () => void }) {
  const [stream, setStream] = useState<any>(null);
  const [resolution, setResolution] = useState("480p");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State untuk Custom Video Player
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResMenu, setShowResMenu] = useState(false);

  // Auto-hide controls timer
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Player Handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const skipTime = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
      resetHideTimer(); // Reset timer auto-hide kalau user nge-skip
    }
  };

  const handleSeek = (e: any) => {
    const newTime = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      resetHideTimer(); // Reset timer auto-hide pas progress bar digeser
    }
  };

  // LOGIC SAKTI: Fullscreen + Otomatis Putar Layar (Landscape/Portrait)
  const toggleFullscreen = async () => {
    const playerContainer = document.getElementById("video-player-container");
    
    if (!document.fullscreenElement) {
      try {
        await playerContainer?.requestFullscreen();
        setIsFullscreen(true);
        // Paksa layar jadi Landscape (Miring) pas fullscreen
        if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
          await window.screen.orientation.lock("landscape");
        }
      } catch (err) {
        console.error("Gagal fullscreen atau putar layar:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
        // Lepas paksaan, balik ke Portrait (Berdiri)
        if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
          window.screen.orientation.unlock();
        }
      } catch (err) {
        console.error("Gagal keluar fullscreen:", err);
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Logic SAKTI buat nanganin Togle Muncul/Hilang & Auto-hide
  const resetHideTimer = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (videoRef.current && !videoRef.current.paused) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowResMenu(false);
      }, 3000);
    }
  };

  const handleVideoTap = (e: any) => {
    // Kalau yang di-klik itu tombol atau progress bar, UI jangan dihilangin, cukup reset timer aja
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.closest('button')) {
      resetHideTimer();
      return;
    }

    // Logic pencet muncul / pencet hilang di area kosong video
    if (showControls) {
      setShowControls(false);
      setShowResMenu(false);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      setShowControls(true);
      resetHideTimer();
    }
  };

  // Jalanin auto-hide timer pas video mulai muter
  useEffect(() => {
    resetHideTimer();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);


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
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pt-6 px-4 pb-12">
      {errorMsg && (
        <div className="bg-[#10b981]/20 border border-[#10b981] text-[#10b981] text-sm text-center py-2 px-4 rounded-md">
          {errorMsg}
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col gap-3 border-b border-[#1a1a1a] pb-4">
         <button 
           onClick={onBack}
           className="self-start text-sm text-[#888888] hover:text-white flex items-center gap-2 transition-colors mb-2"
         >
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
           Kembali ke Detail
         </button>
         
         <div className="flex items-center gap-4">
           {/* Placeholder Foto Anime di atas Player (Mirip Referensi) */}
           <img 
              src={stream.coverUrl || "/assets/placeholder/pc.png"} 
              alt="Anime Cover" 
              className="w-12 h-12 rounded-full object-cover border border-[#333]" 
              onError={(e: any) => { e.target.onerror = null; e.target.src = "/assets/placeholder/pc.png"; }}
           />
           <div>
             <h2 className="text-white font-bold text-lg leading-tight line-clamp-1">{stream.judul || "Eris no Seihai"}</h2>
             <p className="text-[#888888] text-xs">Episode Terkini • {stream.likeCount || 0} Likes</p>
           </div>
         </div>
         
         <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
           <button className="bg-[#1a1a1a] hover:bg-[#222] text-[#ccc] text-xs py-1.5 px-4 rounded-full flex items-center gap-2 transition-colors border border-[#333] flex-shrink-0">
              <span className="text-[#10b981]">👍</span> Suka
           </button>
           <button className="bg-[#1a1a1a] hover:bg-[#222] text-[#ccc] text-xs py-1.5 px-4 rounded-full flex items-center gap-2 transition-colors border border-[#333] flex-shrink-0">
              <span className="text-white">⬇</span> Download
           </button>
           <button className="bg-[#1a1a1a] hover:bg-[#222] text-[#ccc] text-xs py-1.5 px-4 rounded-full flex items-center gap-2 transition-colors border border-[#333] ml-auto flex-shrink-0">
              Share
           </button>
         </div>
      </div>

      {/* CUSTOM VIDEO PLAYER CONTAINER */}
      <div 
        id="video-player-container"
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group cursor-pointer"
        onClick={handleVideoTap}
      >
        {/* Background Placeholder untuk Video (Muncul sebelum play/loading) */}
        {!isPlaying && currentTime === 0 && (
           <div className="absolute inset-0 z-0">
             <img 
               src="/assets/icons/loading_bg.png" 
               alt="Video Background" 
               className="w-full h-full object-cover opacity-30"
               onError={(e: any) => { e.target.style.display = 'none'; }} 
             />
           </div>
        )}

        {stream.selectedVideo ? (
          <video 
            ref={videoRef}
            src={stream.selectedVideo.link} 
            className="w-full h-full object-contain relative z-10"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            playsInline
            controls={false} // MATIKAN CONTROLS BAWAAN BROWSER BIAR PAKAI CUSTOM KITA
          ></video>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#666666] relative z-10">
            Sumber video resolusi ini tidak tersedia.
          </div>
        )}

        {/* CUSTOM CONTROLS OVERLAY */}
        {stream.selectedVideo && (
          <div 
            className={`absolute inset-0 z-20 flex flex-col justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.8) 100%)' }}
          >
            {/* Top Bar (Buat nampilin judul kalau di Fullscreen) */}
            <div className="p-4 flex justify-between items-center">
              {isFullscreen && <span className="text-white font-semibold drop-shadow-md line-clamp-1">{stream.judul}</span>}
            </div>

            {/* Center Play/Pause/Skip Controls */}
            <div className="flex items-center justify-center gap-8 sm:gap-16">
              <button onClick={() => skipTime(-10)} className="w-10 h-10 sm:w-14 sm:h-14 hover:scale-110 transition-transform focus:outline-none bg-black/40 rounded-full p-2">
                <img src="/assets/icons/rewind.png" alt="Rewind" className="w-full h-full object-contain" onError={(e: any) => e.target.style.display='none'} />
              </button>
              
              <button onClick={togglePlay} className="w-14 h-14 sm:w-20 sm:h-20 hover:scale-110 transition-transform focus:outline-none bg-black/40 rounded-full p-3 border border-white/20 backdrop-blur-sm shadow-lg">
                <img src={isPlaying ? "/assets/icons/pause.png" : "/assets/icons/play.png"} alt="Play/Pause" className="w-full h-full object-contain ml-0.5" onError={(e: any) => e.target.style.display='none'} />
              </button>

              <button onClick={() => skipTime(10)} className="w-10 h-10 sm:w-14 sm:h-14 hover:scale-110 transition-transform focus:outline-none bg-black/40 rounded-full p-2">
                <img src="/assets/icons/forward.png" alt="Forward" className="w-full h-full object-contain" onError={(e: any) => e.target.style.display='none'} />
              </button>
            </div>

            {/* Bottom Control Bar */}
            <div className="px-4 pb-4">
              {/* Progress Bar yang bisa digeser */}
              <div className="flex items-center gap-3 mb-2" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs text-white font-medium font-mono drop-shadow-md">{formatTime(currentTime)}</span>
                <input 
                  type="range" 
                  min="0" 
                  max={duration || 100} 
                  value={currentTime} 
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/30 rounded-full appearance-none outline-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.3) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.3) 100%)`
                  }}
                />
                <span className="text-xs text-[#aaa] font-medium font-mono">{formatTime(duration)}</span>
              </div>

              {/* Tools (Reso, Maximize, Settings) */}
              <div className="flex justify-between items-center">
                <div className="text-xs font-bold bg-[#10b981] text-white px-2 py-0.5 rounded flex items-center gap-1 shadow-md cursor-pointer hover:bg-[#059669] transition-colors" onClick={(e) => { e.stopPropagation(); setShowResMenu(!showResMenu); }}>
                   {resolution} <span className="text-[10px]">▼</span>
                </div>

                <div className="flex items-center gap-4">
                  <button className="w-5 h-5 opacity-80 hover:opacity-100 transition-opacity focus:outline-none">
                    <img src="/assets/icons/settings.png" alt="Settings" className="w-full h-full object-contain" onError={(e: any) => e.target.style.display='none'} />
                  </button>
                  <button onClick={toggleFullscreen} className="w-5 h-5 opacity-80 hover:opacity-100 transition-opacity focus:outline-none">
                    <img src="/assets/icons/maximize.png" alt="Fullscreen" className="w-full h-full object-contain" onError={(e: any) => e.target.style.display='none'} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Menu Pop-up Resolusi (Mengambang di atas player) */}
            {showResMenu && (
              <div className="absolute bottom-16 left-4 bg-black/90 backdrop-blur-md border border-[#333] rounded-lg p-2 flex flex-col gap-1 min-w-[120px] shadow-2xl z-30" onClick={(e) => e.stopPropagation()}>
                <div className="text-[10px] text-[#888] font-bold uppercase mb-1 px-2">Pilih Kualitas Video</div>
                {stream.reso?.map((r: string) => (
                  <button
                    key={r}
                    onClick={() => {
                      setResolution(r);
                      setShowResMenu(false);
                      setIsPlaying(false); // Pause dulu buat nunggu load ulang
                    }}
                    className={`px-3 py-2 text-xs font-medium rounded text-left transition-colors flex items-center justify-between ${
                      resolution === r 
                        ? "text-[#10b981] bg-[#1a1a1a]" 
                        : "text-[#ccc] hover:bg-[#222]"
                    }`}
                  >
                    {r}
                    {resolution === r && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
            
          </div>
        )}
      </div>

    </div>
  );
}

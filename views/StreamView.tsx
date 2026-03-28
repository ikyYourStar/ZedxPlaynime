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
  
  // State biar pas buffering loadingnya keren
  const [isVideoLoading, setIsVideoLoading] = useState(true);

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
      resetHideTimer(); 
    }
  };

  const handleSeek = (e: any) => {
    const newTime = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      resetHideTimer(); 
    }
  };

  const toggleFullscreen = async () => {
    const playerContainer = document.getElementById("video-player-container");
    if (!document.fullscreenElement) {
      try {
        await playerContainer?.requestFullscreen();
        setIsFullscreen(true);
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
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.closest('button')) {
      resetHideTimer();
      return;
    }
    if (showControls) {
      setShowControls(false);
      setShowResMenu(false);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      setShowControls(true);
      resetHideTimer();
    }
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  const StreamSkeleton = () => (
    <div className="w-full animate-pulse flex flex-col gap-4">
      <div className="w-full aspect-video bg-[#121212]"></div>
      <div className="px-4 space-y-4">
        <div className="w-32 h-6 bg-[#1a1a1a] rounded"></div>
        <div className="w-full h-16 bg-[#121212] rounded-md"></div>
      </div>
    </div>
  );

  if (loading) return <StreamSkeleton />;
  if (!stream && !loading) return <div className="text-center py-20 text-[#666666]">Gagal memuat stream.</div>;

  return (
    <div className="w-full flex flex-col pb-12 bg-black min-h-screen">
      
      {/* HEADER NAVBAR KECIL (Biar bisa back dari atas kalau gak di fullscreen) */}
      {!isFullscreen && (
        <div className="absolute top-0 left-0 right-0 p-4 z-50 flex items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
           <button onClick={onBack} className="text-white hover:text-[#10b981] transition-colors pointer-events-auto">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
           </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-[#10b981]/20 border border-[#10b981] text-[#10b981] text-sm text-center py-2 px-4">
          {errorMsg}
        </div>
      )}

      {/* CUSTOM VIDEO PLAYER CONTAINER */}
      <div 
        id="video-player-container"
        className="relative w-full aspect-video bg-black overflow-hidden group cursor-pointer select-none"
        onClick={handleVideoTap}
      >
        {stream.selectedVideo ? (
          <video 
            ref={videoRef}
            src={stream.selectedVideo.link} 
            className="w-full h-full object-contain relative z-10"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => { setIsPlaying(true); setIsVideoLoading(false); }}
            onPause={() => setIsPlaying(false)}
            onWaiting={() => setIsVideoLoading(true)}
            onCanPlay={() => setIsVideoLoading(false)}
            playsInline
            controls={false} // MATIKAN CONTROLS BAWAAN BROWSER
          ></video>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#666666] relative z-10">
            Sumber video resolusi ini tidak tersedia.
          </div>
        )}

        {/* LOADING BUFFFERING (Balik pakai spinner murni, logo abu gede ngawur DIBUANG) */}
        {isVideoLoading && stream.selectedVideo && (
           <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
             <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
           </div>
        )}

        {/* CUSTOM CONTROLS OVERLAY */}
        {stream.selectedVideo && (
          <div 
            className={`absolute inset-0 z-30 flex flex-col transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)' }}
          >
            {/* Top Bar - Muncul judul pas Fullscreen */}
            <div className="p-4 flex items-center gap-3">
              {isFullscreen && (
                <>
                  <button onClick={toggleFullscreen} className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  </button>
                  <span className="text-white font-medium drop-shadow-md line-clamp-1 text-sm">{stream.judul}</span>
                </>
              )}
            </div>

            {/* Center Play/Pause/Skip Controls (Sekarang beneran di TENGAH layar video) */}
            <div className="flex-1 flex items-center justify-center w-full">
              {!isVideoLoading && (
                <div className="flex items-center justify-center gap-12 sm:gap-20">
                  <button onClick={() => skipTime(-10)} className="w-10 h-10 sm:w-14 sm:h-14 hover:scale-110 transition-transform focus:outline-none bg-black/30 rounded-full p-2">
                    <img src="/assets/icons/rewind.png" alt="Rewind" className="w-full h-full object-contain" onError={(e: any) => e.target.style.display='none'} />
                  </button>
                  
                  <button onClick={togglePlay} className="w-14 h-14 sm:w-20 sm:h-20 hover:scale-110 transition-transform focus:outline-none bg-black/30 rounded-full p-3 shadow-lg">
                    <img src={isPlaying ? "/assets/icons/pause.png" : "/assets/icons/play.png"} alt="Play/Pause" className="w-full h-full object-contain ml-0.5" onError={(e: any) => e.target.style.display='none'} />
                  </button>

                  <button onClick={() => skipTime(10)} className="w-10 h-10 sm:w-14 sm:h-14 hover:scale-110 transition-transform focus:outline-none bg-black/30 rounded-full p-2">
                    <img src="/assets/icons/forward.png" alt="Forward" className="w-full h-full object-contain" onError={(e: any) => e.target.style.display='none'} />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Control Bar (Mirip referensi screenshot) */}
            <div className="w-full pb-1 relative">
              
              {/* Text Waktu & Setting di atas Progress Bar */}
              <div className="flex justify-between items-center px-4 mb-2">
                <div className="text-white text-xs font-medium font-mono drop-shadow-md">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                <div className="flex items-center gap-4 text-white font-medium text-xs">
                  <button onClick={(e) => { e.stopPropagation(); setShowResMenu(!showResMenu); }} className="hover:text-[#10b981] drop-shadow-md transition-colors">
                    {resolution}
                  </button>
                  <span className="drop-shadow-md">1x</span>
                  <button onClick={toggleFullscreen} className="w-5 h-5 focus:outline-none opacity-90 hover:opacity-100">
                    <img src="/assets/icons/maximize.png" alt="Fullscreen" className="w-full h-full object-contain drop-shadow-md" onError={(e: any) => e.target.style.display='none'} />
                  </button>
                </div>
              </div>

              {/* Garis Progress Bar Merah Memanjang */}
              <div className="px-2" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="range" 
                  min="0" 
                  max={duration || 100} 
                  value={currentTime} 
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/30 appearance-none outline-none cursor-pointer transition-all hover:h-1.5"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.3) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.3) 100%)`
                  }}
                />
              </div>
            </div>
            
            {/* Menu Pop-up Resolusi (Mengambang) */}
            {showResMenu && (
              <div className="absolute bottom-14 right-4 bg-[#1a1a1a]/95 backdrop-blur-md border border-[#333] rounded-md p-2 flex flex-col min-w-[150px] shadow-2xl z-40" onClick={(e) => e.stopPropagation()}>
                <div className="text-[10px] text-[#888] font-bold uppercase mb-2 px-2">Pilihan Kualitas Video</div>
                {stream.reso?.map((r: string) => (
                  <button
                    key={r}
                    onClick={() => {
                      setResolution(r);
                      setShowResMenu(false);
                      setIsPlaying(false); 
                    }}
                    className={`px-3 py-2 text-xs font-medium rounded text-left transition-colors flex items-center justify-between ${
                      resolution === r 
                        ? "text-[#10b981] bg-[#222]" 
                        : "text-[#ccc] hover:bg-[#333]"
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

      {/* ===================== INFO DI BAWAH VIDEO ===================== */}
      <div className="flex flex-col w-full">
        
        {/* Avatar & Judul Row */}
        <div className="flex items-center gap-3 mt-4 px-4">
          <img 
             src={stream.coverUrl || "/assets/placeholder/pc.png"} 
             alt="Avatar" 
             className="w-10 h-10 rounded-full object-cover border border-[#333]" 
             onError={(e: any) => { e.target.onerror = null; e.target.src = "/assets/placeholder/pc.png"; }}
          />
          <div>
            <h2 className="text-white font-medium text-sm leading-tight">{stream.judul || "Anime Terkini"}</h2>
            <p className="text-[#888888] text-[11px] mt-0.5">
              Episode Terkini • {stream.likeCount || "0"} Likes • Baru saja
            </p>
          </div>
        </div>

        {/* Buttons Row 1 (Like, Dislike, Quality, Download) */}
        <div className="flex gap-2 mt-4 px-4 overflow-x-auto no-scrollbar pb-1">
           <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-[#ccc] text-[11px] font-medium py-2 px-4 rounded-full border border-transparent transition-colors whitespace-nowrap">
              👍 {stream.likeCount || "343"}
           </button>
           <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-[#ccc] text-[11px] font-medium py-2 px-4 rounded-full border border-transparent transition-colors whitespace-nowrap">
              👎 0
           </button>
           <button onClick={() => setShowResMenu(!showResMenu)} className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-[#ccc] text-[11px] font-medium py-2 px-4 rounded-full border border-transparent transition-colors whitespace-nowrap">
              ▶ {resolution} Quality
           </button>
           <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-[#ccc] text-[11px] font-medium py-2 px-4 rounded-full border border-transparent transition-colors whitespace-nowrap">
              ⬇ Download
           </button>
        </div>

        {/* Buttons Row 2 (Share, Report) */}
        <div className="flex gap-2 mt-2 px-4 overflow-x-auto no-scrollbar pb-4 border-b border-[#1a1a1a]">
           <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-[#ccc] text-[11px] font-medium py-2 px-4 rounded-full border border-transparent transition-colors whitespace-nowrap">
              ➦ Share
           </button>
           <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-[#ccc] text-[11px] font-medium py-2 px-4 rounded-full border border-transparent transition-colors whitespace-nowrap">
              ⚑ Report
           </button>
        </div>

        {/* Episode List Section - GEMBOK DIHAPUS, ANGKA BISA DIKLIK */}
        <div className="mt-4 px-4 border-b border-[#1a1a1a] pb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white text-sm font-medium">Episode List</h3>
            <span className="text-[#888888] text-[11px] flex items-center gap-1">Total Ep</span>
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {/* Render Episode Boxes */}
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(ep => (
               <button 
                 key={ep} 
                 onClick={() => alert("Mustahil ganti episode dari sini doang cuy! \nFitur ini butuh akses ke page.tsx buat ganti chapterUrlId.")}
                 className={`min-w-[48px] h-[48px] rounded flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${ep === 12 ? 'bg-white text-black' : 'bg-[#1a1a1a] text-[#ccc] hover:bg-[#222]'}`}
               >
                 {ep}
               </button>
            ))}
          </div>
        </div>

        {/* Synopsis Section */}
        <div className="px-4 mt-4 mb-8">
          <p className="text-[#888888] text-[11px] leading-relaxed line-clamp-3">
            {stream.sinopsis || "Saksikan petualangan seru ini hanya di ZedxPlay. Jangan lupa untuk mengikuti aturan komunitas kami dan nikmati kualitas terbaik tanpa batas."}
            <span className="text-[#3b82f6] cursor-pointer ml-1">Selengkapnya ▼</span>
          </p>
          <div className="mt-4 p-3 bg-[#121212] rounded flex items-center gap-2 border border-[#1a1a1a]">
            <span className="text-[#888888] text-[10px]">
              Jangan lupa untuk membuat komentar yang sopan dan santun dan mengikuti <span className="text-[#3b82f6]">Aturan Komunitas</span> kami
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}

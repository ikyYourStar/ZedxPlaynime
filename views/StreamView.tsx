import { useEffect, useState, useRef } from "react";
import { api } from "../lib/api";
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';
import { auth } from "../lib/firebase";

export default function StreamView({ chapterUrlId, onBack }: { chapterUrlId: string, onBack: () => void }) {
  const [stream, setStream] = useState<any>(null);
  const [resolution, setResolution] = useState("480p");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResMenu, setShowResMenu] = useState(false);
  
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const lockPortraitOnMount = async () => {
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
      } catch (e) {}
    };
    lockPortraitOnMount();
  }, []);

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

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://165.22.253.30:8010/api/comments/${chapterUrlId}`);
      const json = await res.json();
      if (json.success) {
        setComments(json.data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchStreamData();
    fetchComments();
  }, [chapterUrlId, resolution]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !user) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://165.22.253.30:8010/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter_id: chapterUrlId,
          user_name: user.displayName || "Wibu Anonim",
          user_photo: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'A'}&background=10b981&color=fff`,
          comment_text: newComment
        })
      });
      const json = await res.json();
      if (json.success) {
        setNewComment("");
        fetchComments();
      }
    } catch (error) {
      alert("Error jaringan saat kirim komentar.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        try {
          await StatusBar.hide();
          await ScreenOrientation.lock({ orientation: 'landscape' });
        } catch (err) {}
      } catch (err) {}
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
        try {
          await StatusBar.show();
          await ScreenOrientation.lock({ orientation: 'portrait' });
        } catch (err) {}
      } catch (err) {}
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

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

      <div 
        id="video-player-container"
        className="relative w-full aspect-video bg-black overflow-hidden group cursor-pointer select-none"
        onClick={handleVideoTap}
      >
        {stream.selectedVideo ? (
          <video 
            ref={videoRef}
            src={stream.selectedVideo.link} 
            poster="/assets/icons/loading_bg.png" 
            className="w-full h-full object-contain relative z-10 bg-black"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => { setIsPlaying(true); setIsVideoLoading(false); }}
            onPause={() => setIsPlaying(false)}
            onWaiting={() => setIsVideoLoading(true)}
            onCanPlay={() => setIsVideoLoading(false)}
            playsInline
            controls={false}
          ></video>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#666666] relative z-10 bg-black">
            Sumber video resolusi ini tidak tersedia.
          </div>
        )}

        {isVideoLoading && stream.selectedVideo && (
           <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
             <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
           </div>
        )}

        {stream.selectedVideo && (
          <div 
            className={`absolute inset-0 z-30 flex flex-col transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)' }}
          >
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

            <div className="w-full pb-1 relative">
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

      <div className="flex flex-col w-full">
        
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

        <div className="flex gap-2 mt-2 px-4 overflow-x-auto no-scrollbar pb-4 border-b border-[#1a1a1a]">
           <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-[#ccc] text-[11px] font-medium py-2 px-4 rounded-full border border-transparent transition-colors whitespace-nowrap">
              ➦ Share
           </button>
           <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-[#ccc] text-[11px] font-medium py-2 px-4 rounded-full border border-transparent transition-colors whitespace-nowrap">
              ⚑ Report
           </button>
        </div>

        <div className="px-4 mt-4 mb-2">
          <p className="text-[#888888] text-[11px] leading-relaxed line-clamp-3">
            {stream.sinopsis || "Saksikan petualangan seru ini hanya di ZedxPlay. Jangan lupa untuk mengikuti aturan komunitas kami dan nikmati kualitas terbaik tanpa batas."}
            <span className="text-[#3b82f6] cursor-pointer ml-1">Selengkapnya ▼</span>
          </p>
        </div>

        <div className="px-4 mt-6 mb-8 pt-6 border-t border-[#1a1a1a]">
          <h3 className="text-white text-sm font-medium mb-4">{comments.length} Comments</h3>
          
          <div className="flex gap-3 mb-8">
            <img 
              src={user?.photoURL || "/assets/placeholder/pc.png"} 
              alt="User" 
              className="w-8 h-8 rounded-full object-cover border border-[#333]"
            />
            <div className="flex-1 flex flex-col gap-2">
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "Tambahkan komentar..." : "Login dulu buat komentar cuy..."} 
                className="w-full bg-[#0a0a0a] border-b border-[#333] focus:border-[#10b981] text-xs text-white px-1 py-2 outline-none transition-colors"
                disabled={isSubmitting || !user}
              />
              <div className="flex justify-end">
                <button 
                  onClick={handlePostComment}
                  disabled={isSubmitting || !newComment.trim() || !user}
                  className="bg-[#1a1a1a] hover:bg-[#222] disabled:opacity-50 text-white border border-[#333] text-[11px] font-bold py-1.5 px-4 rounded-full transition-colors mt-1"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {comments.map((c: any) => (
              <div key={c.id} className="flex gap-3">
                <img src={c.user_photo} alt={c.user_name} className="w-8 h-8 rounded-full object-cover border border-[#222]" />
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white text-[11px] font-bold">{c.user_name}</span>
                    <span className="text-[#666] text-[9px]">
                      {new Date(c.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                    </span>
                  </div>
                  <p className="text-[#ccc] text-[11px] mt-1 leading-relaxed">{c.comment_text}</p>
                </div>
              </div>
            ))}
            
            {comments.length === 0 && (
              <div className="text-[#666] text-xs text-center py-6 bg-[#0a0a0a] rounded border border-[#1a1a1a]">
                Belum ada komentar. Jadilah yang pertama!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

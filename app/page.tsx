"use client";

import { useState, useEffect } from "react";

export default function AnimeApp() {
  const [view, setView] = useState("home");
  const [latest, setLatest] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [detailData, setDetailData] = useState(null);
  const [streamData, setStreamData] = useState(null);
  const [selectedResolution, setSelectedResolution] = useState("480p");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (view === "home") {
      fetchHomeData();
    }
  }, [view]);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const resLatest = await fetch("https://api.sansekai.my.id/api/anime/latest");
      const dataLatest = await resLatest.json();
      setLatest(dataLatest);

      const resRec = await fetch("https://api.sansekai.my.id/api/anime/recommended");
      const dataRec = await resRec.json();
      setRecommended(dataRec);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    setView("search");
    try {
      const res = await fetch(`https://api.sansekai.my.id/api/anime/search?query=${searchQuery}`);
      const json = await res.json();
      setSearchResults(json.data[0]?.result || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const openDetail = async (urlId) => {
    setLoading(true);
    setView("detail");
    try {
      const res = await fetch(`https://api.sansekai.my.id/api/anime/detail?urlId=${urlId}`);
      const json = await res.json();
      setDetailData(json.data[0]);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const openStream = async (chapterUrlId, reso = "480p") => {
    setLoading(true);
    setView("stream");
    setSelectedResolution(reso);
    try {
      const res = await fetch(`https://api.sansekai.my.id/api/anime/getvideo?chapterUrlId=${chapterUrlId}&reso=${reso}`);
      const json = await res.json();
      const videoData = json.data[0];
      
      const mp4Stream = videoData?.stream?.find((s) => s.link.endsWith(".mp4")) || videoData?.stream[0];
      
      setStreamData({
        ...videoData,
        selectedVideo: mp4Stream,
        chapterUrlId: chapterUrlId
      });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const changeResolution = (reso) => {
    if (streamData?.chapterUrlId) {
      openStream(streamData.chapterUrlId, reso);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#E0E0E0] font-sans selection:bg-[#2A2A2A] selection:text-white">
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#1A1A1A] p-4 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all">
        <h1 
          className="text-xl font-semibold tracking-wide cursor-pointer text-[#CCCCCC] hover:text-white transition-colors"
          onClick={() => setView("home")}
        >
          OLED<span className="text-[#4A4A4A]">NIME</span>
        </h1>
        <form onSubmit={handleSearch} className="w-full sm:w-auto flex">
          <input
            type="text"
            placeholder="Search anime..."
            className="w-full sm:w-64 bg-[#121212] text-[#CCCCCC] border border-[#222222] rounded-l-md px-4 py-2 focus:outline-none focus:border-[#444444] transition-colors placeholder-[#666666]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="bg-[#1A1A1A] hover:bg-[#252525] text-[#AAAAAA] px-4 py-2 rounded-r-md transition-colors border border-l-0 border-[#222222]">
            Search
          </button>
        </form>
      </nav>

      <main className="p-4 sm:p-8 max-w-7xl mx-auto">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-[#333333] border-t-[#888888] rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && view === "home" && (
          <div className="space-y-12">
            <section>
              <h2 className="text-lg font-medium text-[#BBBBBB] mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#333333] rounded-full"></span> Latest Updates
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {latest.map((anime) => (
                  <div key={anime.id} onClick={() => openDetail(anime.url)} className="group cursor-pointer flex flex-col gap-2">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[#121212] border border-[#1A1A1A] group-hover:border-[#333333] transition-colors">
                      <img src={anime.cover} alt={anime.judul} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-300" loading="lazy" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 pt-6">
                        <span className="text-[10px] sm:text-xs font-medium bg-[#1A1A1A]/90 px-2 py-1 rounded text-[#AAAAAA] backdrop-blur-sm">
                          {anime.lastch}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm text-[#CCCCCC] group-hover:text-white line-clamp-2 transition-colors">{anime.judul}</h3>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium text-[#BBBBBB] mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#333333] rounded-full"></span> Recommended
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {recommended.map((anime) => (
                  <div key={anime.id} onClick={() => openDetail(anime.url)} className="group cursor-pointer flex flex-col gap-2">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[#121212] border border-[#1A1A1A] group-hover:border-[#333333] transition-colors">
                      <img src={anime.cover} alt={anime.judul} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-300" loading="lazy" />
                      <div className="absolute top-2 right-2">
                        <span className="text-[10px] font-bold bg-black/80 px-2 py-1 rounded border border-[#222222] text-[#AAAAAA]">
                          ★ {anime.score}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm text-[#CCCCCC] group-hover:text-white line-clamp-2 transition-colors">{anime.judul}</h3>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {!loading && view === "search" && (
          <div>
            <h2 className="text-lg font-medium text-[#BBBBBB] mb-6">Search Results for "{searchQuery}"</h2>
            {searchResults.length === 0 ? (
              <p className="text-[#666666]">No results found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {searchResults.map((anime) => (
                  <div key={anime.id} onClick={() => openDetail(anime.url)} className="group cursor-pointer flex flex-col gap-2">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[#121212] border border-[#1A1A1A] group-hover:border-[#333333] transition-colors">
                      <img src={anime.cover} alt={anime.judul} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-300" loading="lazy" />
                      <div className="absolute top-2 right-2">
                        <span className="text-[10px] font-bold bg-black/80 px-2 py-1 rounded border border-[#222222] text-[#AAAAAA]">
                          ★ {anime.score}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm text-[#CCCCCC] group-hover:text-white line-clamp-2 transition-colors">{anime.judul}</h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && view === "detail" && detailData && (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/4 flex-shrink-0">
              <div className="rounded-md overflow-hidden border border-[#1A1A1A] bg-[#0A0A0A]">
                <img src={detailData.cover} alt={detailData.judul} className="w-full h-auto object-cover opacity-90" />
              </div>
              <div className="mt-4 p-4 bg-[#0A0A0A] border border-[#1A1A1A] rounded-md space-y-3 text-sm text-[#999999]">
                <p><span className="text-[#555555]">Rating:</span> ★ {detailData.rating}</p>
                <p><span className="text-[#555555]">Status:</span> {detailData.status}</p>
                <p><span className="text-[#555555]">Studio:</span> {detailData.author}</p>
                <p><span className="text-[#555555]">Released:</span> {detailData.published}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {detailData.genre?.map((g) => (
                    <span key={g} className="text-xs bg-[#111111] border border-[#222222] px-2 py-1 rounded text-[#888888]">{g}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-3/4 flex flex-col gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-[#EEEEEE] mb-4">{detailData.judul}</h1>
                <p className="text-sm leading-relaxed text-[#999999] whitespace-pre-line bg-[#0A0A0A] p-4 rounded-md border border-[#1A1A1A]">
                  {detailData.sinopsis}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-[#BBBBBB] mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#333333] rounded-full"></span> Episodes
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {detailData.chapter?.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => openStream(ep.url)}
                      className="bg-[#0A0A0A] hover:bg-[#151515] border border-[#1A1A1A] hover:border-[#333333] text-[#CCCCCC] py-3 px-2 rounded-md transition-all text-sm font-medium"
                    >
                      Episode {ep.ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && view === "stream" && streamData && (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <button 
              onClick={() => setView("detail")}
              className="self-start text-sm text-[#888888] hover:text-[#CCCCCC] flex items-center gap-2 transition-colors"
            >
              ← Back to Details
            </button>
            
            <div className="w-full aspect-video bg-black rounded-md overflow-hidden border border-[#1A1A1A] shadow-[0_0_15px_rgba(0,0,0,0.8)]">
              {streamData.selectedVideo ? (
                <video 
                  src={streamData.selectedVideo.link} 
                  controls 
                  autoPlay 
                  className="w-full h-full outline-none"
                  controlsList="nodownload"
                ></video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#666666]">
                  Video source not found.
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0A0A0A] p-4 border border-[#1A1A1A] rounded-md">
              <div className="flex gap-4 text-sm text-[#888888]">
                <span className="flex items-center gap-1"><span className="text-[#555555]">👍</span> {streamData.likeCount}</span>
                <span className="flex items-center gap-1"><span className="text-[#555555]">👎</span> {streamData.dislikeCount}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#666666]">Resolution:</span>
                <div className="flex bg-[#111111] border border-[#222222] rounded-md overflow-hidden p-1">
                  {streamData.reso?.map((r) => (
                    <button
                      key={r}
                      onClick={() => changeResolution(r)}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        selectedResolution === r 
                          ? "bg-[#2A2A2A] text-white" 
                          : "text-[#777777] hover:text-[#AAAAAA] hover:bg-[#1A1A1A]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #000000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #222222;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333333;
        }
      `}</style>
    </div>
  );
}

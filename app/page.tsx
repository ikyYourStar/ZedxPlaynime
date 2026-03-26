"use client";

import { useState, useEffect } from "react";
import { App as CapacitorApp } from '@capacitor/app';
import Navbar from "../components/Navbar";
import HomeView from "../views/HomeView";
import SearchView from "../views/SearchView";
import DetailView from "../views/DetailView";
import StreamView from "../views/StreamView";

export default function ZedxPlayApp() {
  const [view, setView] = useState<"home" | "search" | "detail" | "stream">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeUrlId, setActiveUrlId] = useState("");
  const [activeChapterId, setActiveChapterId] = useState("");

  // Logic Tombol Back Fisik Native Android (Capacitor)
  useEffect(() => {
    let lastTimeBackPress = 0;
    const timePeriodToExit = 2000; // 2 detik untuk double tap

    const backListener = CapacitorApp.addListener('backButton', () => {
      if (view === "stream") {
        setView("detail");
      } else if (view === "detail" || view === "search") {
        setView("home");
      } else if (view === "home") {
        const currentTime = new Date().getTime();
        if (currentTime - lastTimeBackPress < timePeriodToExit) {
          CapacitorApp.exitApp(); // Keluar dari apk
        } else {
          lastTimeBackPress = currentTime;
          // Harus tap 2x cepat buat keluar
        }
      }
    });

    return () => {
      backListener.remove();
    };
  }, [view]);

  const goHome = () => setView("home");
  
  const goSearch = (query: string) => {
    setSearchQuery(query);
    setView("search");
  };

  const goDetail = (urlId: string) => {
    setActiveUrlId(urlId);
    setView("detail");
  };

  const goStream = (chapterUrlId: string) => {
    setActiveChapterId(chapterUrlId);
    setView("stream");
  };

  return (
    <div className="min-h-screen bg-black text-[#e0e0e0] font-sans selection:bg-[#10b981] selection:text-white no-scrollbar">
      {/* Navbar dan Search bar (Cuma Tampil Navbar biasa di Detail/Stream, tapi input Search hilang) */}
      {view !== 'detail' && view !== 'stream' && (
         <Navbar onGoHome={goHome} onSearch={goSearch} showSearch={view === "home" || view === "search"} />
      )}
      
      <main className={view === "detail" ? "no-scrollbar" : "max-w-7xl mx-auto no-scrollbar"}>
        {view === "home" && <HomeView onOpenDetail={goDetail} />}
        {view === "search" && <SearchView query={searchQuery} onOpenDetail={goDetail} />}
        {view === "detail" && <DetailView urlId={activeUrlId} onOpenStream={goStream} onBack={goHome} />}
        {view === "stream" && <StreamView chapterUrlId={activeChapterId} onBack={() => setView("detail")} />}
      </main>
    </div>
  );
}

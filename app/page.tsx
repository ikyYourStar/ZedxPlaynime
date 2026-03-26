"use client";

import { useState } from "react";
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
    <div className="min-h-screen bg-black text-[#e0e0e0] font-sans selection:bg-[#2a2a2a] selection:text-white">
      <Navbar onGoHome={goHome} onSearch={goSearch} />
      <main className="p-4 sm:p-8 max-w-7xl mx-auto">
        {view === "home" && <HomeView onOpenDetail={goDetail} />}
        {view === "search" && <SearchView query={searchQuery} onOpenDetail={goDetail} />}
        {view === "detail" && <DetailView urlId={activeUrlId} onOpenStream={goStream} />}
        {view === "stream" && <StreamView chapterUrlId={activeChapterId} onBack={() => setView("detail")} />}
      </main>
    </div>
  );
}

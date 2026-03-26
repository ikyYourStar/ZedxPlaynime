import { useEffect, useState } from "react";
import { api } from "../lib/api";
import AnimeCard from "../components/AnimeCard";

export default function HomeView({ onOpenDetail }: { onOpenDetail: (urlId: string) => void }) {
  const [latest, setLatest] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [heroAnime, setHeroAnime] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async (retryAttempt = 0) => {
    if (retryAttempt === 0) setLoading(true);
    try {
      const [dataLatest, dataRec, dataMovie] = await Promise.all([
        api.getLatest(),
        api.getRecommended(),
        api.getMovies()
      ]);
      setLatest(dataLatest);
      setRecommended(dataRec);
      setMovies(dataMovie);
      
      if (dataRec && dataRec.length > 0) {
        const randomIndex = Math.floor(Math.random() * dataRec.length);
        setHeroAnime(dataRec[randomIndex]);
      }
      setErrorMsg(null);
      setLoading(false);
    } catch (error) {
      const delayBase = Math.pow(2, retryAttempt + 1); // 2, 4, 8...
      setErrorMsg(`Koneksi lambat. Auto-retry dalam ${delayBase} detik...`);
      setTimeout(() => {
        loadData(retryAttempt + 1);
      }, delayBase * 1000);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const HomeSkeleton = () => (
    <div className="animate-pulse space-y-8">
      <div className="w-full h-[400px] bg-[#121212] rounded-b-3xl"></div>
      <div className="space-y-4">
        <div className="w-40 h-6 bg-[#1a1a1a] rounded"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="aspect-[3/4] bg-[#121212] rounded-md"></div>)}
        </div>
      </div>
    </div>
  );

  if (loading) return <HomeSkeleton />;

  const Section = ({ title, data }: { title: string, data: any[] }) => (
    <section className="mb-12 px-4 sm:px-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <span className="text-sm font-medium text-[#10b981] cursor-pointer hover:text-white transition-colors">Lainnya</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data.map((anime: any) => (
          <AnimeCard key={anime.id} anime={anime} onClick={() => onOpenDetail(anime.url)} />
        ))}
      </div>
    </section>
  );

  return (
    <div className="pb-8">
      {errorMsg && (
        <div className="bg-[#10b981]/20 border border-[#10b981] text-[#10b981] text-sm text-center py-2 px-4 sticky top-0 z-40">
          {errorMsg}
        </div>
      )}

      {/* Hero Banner Area */}
      {heroAnime && (
        <div className="relative w-full h-[60vh] sm:h-[70vh] mb-8 cursor-pointer group" onClick={() => onOpenDetail(heroAnime.url)}>
          <div className="absolute inset-0 bg-black">
            <img src={heroAnime.cover} alt="Hero" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 flex flex-col justify-end">
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-lg line-clamp-2">
              {heroAnime.judul}
            </h1>
            <p className="text-[#cccccc] text-sm sm:text-base line-clamp-2 sm:line-clamp-3 mb-6 max-w-3xl drop-shadow-md">
              {heroAnime.sinopsis || "Saksikan petualangan seru ini hanya di ZedxPlay. Kualitas terbaik tanpa batas."}
            </p>
            <div className="flex items-center gap-3">
              <button className="bg-white text-black font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full flex items-center gap-2 hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="black"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Menonton
              </button>
              <button className="bg-[#121212]/80 backdrop-blur-sm border border-[#333333] text-white font-medium py-2 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-[#222222] transition-colors">
                Lainnya
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <Section title="Latest Updates" data={latest} />
        <Section title="Recommended" data={recommended} />
        <Section title="Movies" data={movies} />
      </div>
    </div>
  );
}

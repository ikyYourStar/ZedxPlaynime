import { useEffect, useState } from "react";
import { api } from "../lib/api";
import AnimeCard from "../components/AnimeCard";

export default function HomeView({ onOpenDetail }: { onOpenDetail: (urlId: string) => void }) {
  const [latest, setLatest] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [dataLatest, dataRec, dataMovie] = await Promise.all([
          api.getLatest(),
          api.getRecommended(),
          api.getMovies()
        ]);
        setLatest(dataLatest);
        setRecommended(dataRec);
        setMovies(dataMovie);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#333333] border-t-[#888888] rounded-full animate-spin"></div></div>;

  const Section = ({ title, data }: { title: string, data: any[] }) => (
    <section className="mb-12">
      <h2 className="text-lg font-medium text-[#bbbbbb] mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-[#333333] rounded-full"></span> {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {data.map((anime: any) => (
          <AnimeCard key={anime.id} anime={anime} onClick={() => onOpenDetail(anime.url)} />
        ))}
      </div>
    </section>
  );

  return (
    <div>
      <Section title="Latest Updates" data={latest} />
      <Section title="Recommended" data={recommended} />
      <Section title="Movies" data={movies} />
    </div>
  );
}

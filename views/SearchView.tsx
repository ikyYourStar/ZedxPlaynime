import { useEffect, useState } from "react";
import { api } from "../lib/api";
import AnimeCard from "../components/AnimeCard";

export default function SearchView({ query, onOpenDetail }: { query: string, onOpenDetail: (urlId: string) => void }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await api.searchAnime(query);
        setResults(data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchResults();
  }, [query]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#333333] border-t-[#888888] rounded-full animate-spin"></div></div>;

  return (
    <div>
      <h2 className="text-lg font-medium text-[#bbbbbb] mb-6">Search Results for "{query}"</h2>
      {results.length === 0 ? (
        <p className="text-[#666666]">No results found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((anime: any) => (
            <AnimeCard key={anime.id} anime={anime} onClick={() => onOpenDetail(anime.url)} />
          ))}
        </div>
      )}
    </div>
  );
}

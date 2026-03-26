import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function DetailView({ urlId, onOpenStream }: { urlId: string, onOpenStream: (chapterUrlId: string) => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await api.getDetail(urlId);
        setDetail(data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [urlId]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#333333] border-t-[#888888] rounded-full animate-spin"></div></div>;
  if (!detail) return <p className="text-[#666666]">Failed to load details.</p>;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/4 flex-shrink-0">
        <div className="rounded-md overflow-hidden border border-[#1a1a1a] bg-[#0a0a0a]">
          <img src={detail.cover} alt={detail.judul} className="w-full h-auto object-cover opacity-90" />
        </div>
        <div className="mt-4 p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-md space-y-3 text-sm text-[#999999]">
          <p><span className="text-[#555555]">Rating:</span> ★ {detail.rating}</p>
          <p><span className="text-[#555555]">Status:</span> {detail.status}</p>
          <p><span className="text-[#555555]">Studio:</span> {detail.author}</p>
          <p><span className="text-[#555555]">Released:</span> {detail.published}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {detail.genre?.map((g: string) => (
              <span key={g} className="text-xs bg-[#111111] border border-[#222222] px-2 py-1 rounded text-[#888888]">{g}</span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-3/4 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#eeeeee] mb-4">{detail.judul}</h1>
          <p className="text-sm leading-relaxed text-[#999999] whitespace-pre-line bg-[#0a0a0a] p-4 rounded-md border border-[#1a1a1a]">
            {detail.sinopsis}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-[#bbbbbb] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#333333] rounded-full"></span> Episodes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {detail.chapter?.map((ep: any) => (
              <button
                key={ep.id}
                onClick={() => onOpenStream(ep.url)}
                className="bg-[#0a0a0a] hover:bg-[#151515] border border-[#1a1a1a] hover:border-[#333333] text-[#cccccc] py-3 px-2 rounded-md transition-all text-sm font-medium"
              >
                Episode {ep.ch}
            </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

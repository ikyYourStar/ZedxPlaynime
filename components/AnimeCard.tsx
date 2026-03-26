export default function AnimeCard({ anime, onClick }: { anime: any, onClick: () => void }) {
  return (
    <div onClick={onClick} className="group cursor-pointer flex flex-col gap-2 transform-gpu">
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[#0a0a0a] border border-[#1a1a1a] group-hover:border-[#333333] transition-colors">
        <img 
          src={anime.cover} 
          alt={anime.judul} 
          className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-300 transform-gpu" 
          loading="lazy" 
          decoding="async"
        />
        {anime.score && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-bold bg-black/80 px-2 py-1 rounded border border-[#222222] text-[#aaaaaa]">
              ★ {anime.score}
            </span>
          </div>
        )}
        {anime.lastch && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 pt-6">
            <span className="text-[10px] sm:text-xs font-medium bg-[#1a1a1a]/90 px-2 py-1 rounded text-[#aaaaaa] backdrop-blur-sm">
              {anime.lastch}
            </span>
          </div>
        )}
      </div>
      <h3 className="text-sm text-[#cccccc] group-hover:text-white line-clamp-2 transition-colors">{anime.judul}</h3>
    </div>
  );
}

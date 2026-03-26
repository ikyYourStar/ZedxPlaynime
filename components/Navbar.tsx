export default function Navbar({ onGoHome, onSearch }: { onGoHome: () => void, onSearch: (query: string) => void }) {
  const handleSearch = (e: any) => {
    e.preventDefault();
    const val = e.target.elements.search.value;
    if (val) onSearch(val);
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#1a1a1a] p-4 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all">
      <h1 
        className="text-xl font-semibold tracking-wide cursor-pointer text-[#cccccc] hover:text-white transition-colors"
        onClick={onGoHome}
      >
        Zedx<span className="text-[#4a4a4a]">Play</span>
      </h1>
      <form onSubmit={handleSearch} className="w-full sm:w-auto flex">
        <input
          type="text"
          name="search"
          placeholder="Search anime..."
          className="w-full sm:w-64 bg-[#0a0a0a] text-[#cccccc] border border-[#222222] rounded-l-md px-4 py-2 focus:outline-none focus:border-[#444444] transition-colors placeholder-[#666666]"
        />
        <button type="submit" className="bg-[#1a1a1a] hover:bg-[#252525] text-[#aaaaaa] px-4 py-2 rounded-r-md transition-colors border border-l-0 border-[#222222]">
          Search
        </button>
      </form>
    </nav>
  );
}

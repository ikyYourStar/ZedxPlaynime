export default function Navbar({ 
  onGoHome, 
  onSearch, 
  showSearch 
}: { 
  onGoHome: () => void, 
  onSearch: (query: string) => void,
  showSearch: boolean 
}) {
  const handleSearch = (e: any) => {
    e.preventDefault();
    const val = e.target.elements.search.value;
    if (val) onSearch(val);
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-[#1a1a1a] p-4 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all">
      <h1 
        className="text-2xl font-bold tracking-wide cursor-pointer text-white transition-colors"
        onClick={onGoHome}
      >
        Zedx<span className="text-[#10b981]">Play</span>
      </h1>
      
      {showSearch && (
        <form onSubmit={handleSearch} className="w-full sm:w-auto flex">
          <input
            type="text"
            name="search"
            placeholder="Search anime..."
            className="w-full sm:w-64 bg-[#121212] text-[#cccccc] border border-[#222222] rounded-l-md px-4 py-2 focus:outline-none focus:border-[#10b981] transition-colors placeholder-[#666666]"
          />
          <button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-r-md transition-colors border border-l-0 border-[#10b981] font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
      )}
    </nav>
  );
}

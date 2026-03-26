import { useState, useEffect } from "react";
import { auth, signOut } from "../lib/firebase";

export default function Navbar({ 
  onGoHome, 
  onSearch, 
  showSearch 
}: { 
  onGoHome: () => void, 
  onSearch: (query: string) => void,
  showSearch: boolean 
}) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Gagal Logout:", error);
    }
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    const val = e.target.elements.search.value;
    if (val) onSearch(val);
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-[#1a1a1a] p-4 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all">
      <div className="flex justify-between items-center w-full sm:w-auto">
        <h1 
          className="text-2xl font-bold tracking-wide cursor-pointer text-white transition-colors"
          onClick={onGoHome}
        >
          Zedx<span className="text-[#10b981]">Play</span>
        </h1>
        
        {/* Foto Profil versi Mobile (Muncul di kanan judul kalau di HP) - Klik untuk Logout */}
        <div className="sm:hidden flex items-center">
          {user && (
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout} title="Klik untuk Logout">
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=10b981&color=fff`} alt="Profile" className="w-8 h-8 rounded-full border-2 border-[#10b981] shadow-sm" />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex w-full sm:w-auto items-center gap-4">
        {showSearch && (
          <form onSubmit={handleSearch} className="w-full flex">
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
        
        {/* Foto Profil versi Desktop (Muncul di paling kanan laptop) - Klik untuk Logout */}
        <div className="hidden sm:block">
          {user && (
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout} title="Klik untuk Logout">
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=10b981&color=fff`} alt="Profile" className="w-9 h-9 rounded-full border-2 border-[#10b981] shadow-sm hover:opacity-80 transition-opacity" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

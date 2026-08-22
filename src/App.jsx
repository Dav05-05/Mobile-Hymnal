import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, BookOpen, Maximize, Heart, X } from 'lucide-react';
import { HYMN_DATABASE } from './data/hymns';

export default function App() {
  const [currentView, setCurrentView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHymnId, setSelectedHymnId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('hiligaynon_hymnal_favs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('hiligaynon_hymnal_favs', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const filteredHymns = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return HYMN_DATABASE.filter(hymn => {
      const idStr = hymn.id.toString();
      const paddedIdStr = String(hymn.id).padStart(3, '0');
      const matchesSearch = !query || idStr.includes(query) || paddedIdStr.includes(query) || hymn.title.toLowerCase().includes(query);
      const matchesTab = activeTab === 'all' || favorites.includes(hymn.id);
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab, favorites]);

  return (
    <div className="bg-slate-50 h-screen w-full flex flex-col font-sans overflow-hidden text-slate-900">
      {currentView === 'list' ? (
        <HymnList 
          hymns={filteredHymns} searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
          onSelectHymn={(id) => { setSelectedHymnId(id); setCurrentView('viewer'); }}
          activeTab={activeTab} setActiveTab={setActiveTab} favorites={favorites} toggleFavorite={toggleFavorite}
        />
      ) : (
        <HymnViewer 
          key={selectedHymnId}
          hymn={HYMN_DATABASE.find(h => h.id === selectedHymnId)} 
          onClose={() => setCurrentView('list')} 
          onNavigate={(dir) => {
            const idx = HYMN_DATABASE.findIndex(h => h.id === selectedHymnId);
            if (dir === 'next' && idx < HYMN_DATABASE.length - 1) setSelectedHymnId(HYMN_DATABASE[idx + 1].id);
            if (dir === 'prev' && idx > 0) setSelectedHymnId(HYMN_DATABASE[idx - 1].id);
          }}
          isFirst={selectedHymnId === 1} isLast={selectedHymnId === HYMN_DATABASE.length}
          isFavorite={favorites.includes(selectedHymnId)} onToggleFavorite={() => toggleFavorite(selectedHymnId)}
        />
      )}
    </div>
  );
}

function HymnList({ hymns, searchQuery, setSearchQuery, onSelectHymn, activeTab, setActiveTab, favorites, toggleFavorite }) {
  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto bg-white shadow-lg">
      <header className="bg-blue-800 text-white p-4 shadow-md z-10">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen size={28} />
          <h1 className="text-xl font-bold">Mga Ambahanon</h1>
        </div>
        <div className="relative mb-3">
          <Search size={20} className="absolute left-3 top-3.5 text-blue-300 pointer-events-none" />
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2.5 border border-transparent rounded-xl bg-blue-900 text-white placeholder-blue-300 focus:outline-none focus:bg-white focus:text-slate-900 transition-colors"
            placeholder="Pangitaa (e.g. 5, 005, ukon 'Dios')..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-blue-300 hover:text-white bg-blue-900 p-1 rounded-full">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex bg-blue-900 p-1 rounded-lg">
          <button onClick={() => setActiveTab('all')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${activeTab === 'all' ? 'bg-white text-blue-900 shadow' : 'text-blue-200 hover:text-white'}`}>
            Tanan ({HYMN_DATABASE.length})
          </button>
          <button onClick={() => setActiveTab('favorites')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 ${activeTab === 'favorites' ? 'bg-white text-blue-900 shadow' : 'text-blue-200 hover:text-white'}`}>
            <Heart size={14} className={activeTab === 'favorites' ? 'fill-red-500 text-red-500' : ''} /> Paborito ({favorites.length})
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-slate-100">
          {hymns.map((hymn) => (
            <li key={hymn.id} className="flex items-center hover:bg-blue-50 active:bg-blue-100 transition-colors">
              <button onClick={() => onSelectHymn(hymn.id)} className="flex-1 text-left px-4 py-4 flex items-center gap-4">
                <span className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-lg">{hymn.id}</span>
                <span className="flex-1 text-lg font-medium text-slate-800">{hymn.title}</span>
              </button>
              <button onClick={() => toggleFavorite(hymn.id)} className="p-4 text-slate-300 hover:text-red-500 transition-colors">
                <Heart size={24} className={favorites.includes(hymn.id) ? 'fill-red-500 text-red-500' : ''} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HymnViewer({ hymn, onClose, onNavigate, isFirst, isLast, isFavorite, onToggleFavorite }) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);

  if (!hymn) return null;

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <header className="bg-blue-800 text-white p-2 flex items-center justify-between shadow-md z-20">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-700"><ArrowLeft size={24} /></button>
        <div className="text-center flex-1 px-2 truncate">
          <span className="text-xs text-blue-300 block uppercase font-medium">Hymn {hymn.id}</span>
          <h2 className="text-sm md:text-base font-bold truncate">{hymn.title}</h2>
        </div>
        <div className="flex gap-1">
          <button onClick={onToggleFavorite} className="p-2 rounded-full hover:bg-blue-700 transition-colors">
            <Heart size={22} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-white'} />
          </button>
          <button onClick={() => setZoom(p => Math.max(p - 0.5, 1))} disabled={zoom === 1} className="p-2 rounded-full disabled:opacity-50 hover:bg-blue-700 transition-colors"><ZoomOut size={22} /></button>
          <button onClick={() => setZoom(p => Math.min(p + 0.5, 3))} disabled={zoom === 3} className="p-2 rounded-full disabled:opacity-50 hover:bg-blue-700 transition-colors"><ZoomIn size={22} /></button>
        </div>
      </header>
      <div ref={containerRef} className="flex-1 overflow-auto relative flex items-start justify-start bg-slate-900 touch-pan-x touch-pan-y">
        <div className="flex min-w-full flex-col items-center gap-4 p-2">
          {hymn.pages.map((page) => (
            <img key={page} src={`/scans/page-${String(page).padStart(3, '0')}.jpg`} alt={`${hymn.title}, page ${page}`} className="max-w-full origin-top-left transition-transform duration-200" style={{ transform: `scale(${zoom})` }} />
          ))}
        </div>
        {zoom > 1 && <button onClick={() => setZoom(1)} className="fixed bottom-20 right-4 bg-slate-800/90 text-white p-3 rounded-full shadow-lg backdrop-blur-sm"><Maximize size={20} /></button>}
      </div>
      <div className="bg-blue-900 text-white p-3 flex justify-between items-center safe-area-bottom">
        <button onClick={() => onNavigate('prev')} disabled={isFirst} className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-800 disabled:opacity-40 hover:bg-blue-700 transition-colors w-28"><ChevronLeft size={20} /> Antis</button>
        <span className="text-sm text-blue-300 font-bold">{hymn.id} / {HYMN_DATABASE.length}</span>
        <button onClick={() => onNavigate('next')} disabled={isLast} className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-800 disabled:opacity-40 hover:bg-blue-700 transition-colors w-28">Sunod <ChevronRight size={20} /></button>
      </div>
    </div>
  );
}

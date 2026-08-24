import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, 
  BookOpen, Maximize, Heart, X, Music, Globe, Layers, ArrowUpDown,
  Palette, Sun, Moon, Check
} from 'lucide-react';
import { HYMN_DATABASE } from './data/hymns';
import { hymnLyrics } from './lyrics';

const APP_VERSION = "1.1.0";

const PALETTES = [
  { id: 'maroon', name: 'Classic Maroon', color: '#881337', isGradient: false },
  { id: 'emerald', name: 'Forest Emerald', color: '#065f46', isGradient: false },
  { id: 'sage', name: 'Pastel Sage', color: '#a7f3d0', isGradient: false },
  { id: 'lavender', name: 'Pastel Lavender', color: '#ddd6fe', isGradient: false },
  { id: 'peach', name: 'Pastel Peach', color: '#ffedd5', isGradient: false },
  { id: 'sunset', name: 'Sunset Gradient', color: 'linear-gradient(135deg, #581c87, #881337, #78350f)', isGradient: true },
  { id: 'aurora', name: 'Aurora Gradient', color: 'linear-gradient(135deg, #0f172a, #134e4a, #312e81)', isGradient: true },
];

const getHymnKey = (hymn) => `${hymn.category}-${hymn.id}`;

export default function App() {
  const [currentView, setCurrentView] = useState('songbooks');
  const [selectedCategory, setSelectedCategory] = useState('hiligaynon');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('number');
  const [selectedHymnKey, setSelectedHymnKey] = useState(null);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const [themeConfig, setThemeConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('hiligaynon_hymnal_theme');
      return saved ? JSON.parse(saved) : { palette: 'maroon', isDark: true };
    } catch {
      return { palette: 'maroon', isDark: true };
    }
  });

  useEffect(() => {
    localStorage.setItem('hiligaynon_hymnal_theme', JSON.stringify(themeConfig));
  }, [themeConfig]);

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('hiligaynon_hymnal_favs');
      return saved ? JSON.parse(saved) : [];
    } catch { 
      return []; 
    }
  });

  useEffect(() => {
    localStorage.setItem('hiligaynon_hymnal_favs', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (hymn) => {
    const key = typeof hymn === 'string' ? hymn : getHymnKey(hymn);
    setFavorites(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleSelectSongbook = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setCurrentView('list');
  };

  const categoryHymns = useMemo(() => {
    if (selectedCategory === 'favorites') {
      return HYMN_DATABASE.filter(h => favorites.includes(getHymnKey(h)));
    }
    if (selectedCategory === 'all') {
      return HYMN_DATABASE;
    }
    return HYMN_DATABASE.filter(h => h.category === selectedCategory);
  }, [selectedCategory, favorites]);

  const filteredHymns = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let result = categoryHymns.filter(hymn => {
      const idStr = hymn.id.toString();
      const paddedIdStr = String(hymn.id).padStart(3, '0');
      return !query || idStr.includes(query) || paddedIdStr.includes(query) || hymn.title.toLowerCase().includes(query);
    });

    if (sortBy === 'alpha') {
      return [...result].sort((a, b) => a.title.localeCompare(b.title));
    }
    return [...result].sort((a, b) => a.id - b.id);
  }, [searchQuery, categoryHymns, sortBy]);

  const currentIndex = categoryHymns.findIndex(h => getHymnKey(h) === selectedHymnKey);
  const selectedHymn = categoryHymns[currentIndex];

  const themeClasses = useMemo(() => {
    const { palette, isDark } = themeConfig;

    if (palette === 'sunset') {
      return {
        mainBg: 'bg-gradient-to-br from-purple-950 via-rose-950 to-amber-950 text-white',
        headerBg: 'bg-rose-950/80 backdrop-blur-md border-rose-800/50 text-white',
        cardBg: 'bg-purple-900/40 hover:bg-purple-900/60 border-purple-800/40 text-purple-100',
        badgeBg: 'bg-amber-400 text-rose-950',
        inputBg: 'bg-purple-900/60 text-white placeholder-purple-300',
        accentText: 'text-amber-300',
        listBg: isDark ? 'bg-purple-950 text-white' : 'bg-rose-50 text-stone-900',
        listItemHover: isDark ? 'hover:bg-purple-900/40' : 'hover:bg-rose-100/60'
      };
    }

    if (palette === 'aurora') {
      return {
        mainBg: 'bg-gradient-to-br from-slate-950 via-teal-950 to-indigo-950 text-white',
        headerBg: 'bg-teal-950/80 backdrop-blur-md border-teal-800/50 text-white',
        cardBg: 'bg-teal-900/30 hover:bg-teal-900/50 border-teal-800/40 text-teal-100',
        badgeBg: 'bg-emerald-400 text-teal-950',
        inputBg: 'bg-teal-900/60 text-white placeholder-teal-300',
        accentText: 'text-emerald-300',
        listBg: isDark ? 'bg-slate-950 text-white' : 'bg-teal-50 text-stone-900',
        listItemHover: isDark ? 'hover:bg-teal-900/40' : 'hover:bg-teal-100/60'
      };
    }

    if (palette === 'emerald') {
      return {
        mainBg: isDark ? 'bg-emerald-950 text-white' : 'bg-emerald-50 text-stone-900',
        headerBg: 'bg-emerald-900 text-white border-emerald-800',
        cardBg: isDark ? 'bg-emerald-900/40 hover:bg-emerald-900/70 border-emerald-800/50 text-emerald-100' : 'bg-white hover:bg-emerald-100/50 border-emerald-200 text-stone-800',
        badgeBg: 'bg-amber-400 text-emerald-950',
        inputBg: isDark ? 'bg-emerald-900 text-white placeholder-emerald-300' : 'bg-emerald-100 text-stone-900 placeholder-emerald-700',
        accentText: 'text-amber-300',
        listBg: isDark ? 'bg-emerald-950 text-white' : 'bg-white text-stone-900',
        listItemHover: isDark ? 'hover:bg-emerald-900/40' : 'hover:bg-emerald-50'
      };
    }

    if (palette === 'sage') {
      return {
        mainBg: isDark ? 'bg-slate-900 text-teal-100' : 'bg-emerald-50/80 text-teal-950',
        headerBg: isDark ? 'bg-teal-950 border-teal-900 text-emerald-200' : 'bg-emerald-200/90 border-emerald-300 text-teal-950',
        cardBg: isDark ? 'bg-teal-900/40 border-teal-800/40 text-teal-100 hover:bg-teal-900/60' : 'bg-white border-emerald-200/80 text-teal-950 hover:bg-emerald-100/60',
        badgeBg: 'bg-teal-600 text-white',
        inputBg: isDark ? 'bg-teal-900/80 text-white placeholder-teal-300' : 'bg-emerald-100/80 text-teal-950 placeholder-teal-700',
        accentText: isDark ? 'text-emerald-300' : 'text-teal-800',
        listBg: isDark ? 'bg-slate-900 text-white' : 'bg-white text-stone-900',
        listItemHover: isDark ? 'hover:bg-teal-900/30' : 'hover:bg-emerald-50'
      };
    }

    if (palette === 'lavender') {
      return {
        mainBg: isDark ? 'bg-slate-950 text-purple-100' : 'bg-purple-50 text-purple-950',
        headerBg: isDark ? 'bg-purple-950 border-purple-900 text-purple-100' : 'bg-purple-200 border-purple-300 text-purple-950',
        cardBg: isDark ? 'bg-purple-900/30 border-purple-800/40 text-purple-100 hover:bg-purple-900/50' : 'bg-white border-purple-200 text-purple-950 hover:bg-purple-100/60',
        badgeBg: 'bg-purple-600 text-white',
        inputBg: isDark ? 'bg-purple-900/60 text-white placeholder-purple-300' : 'bg-purple-100 text-purple-950 placeholder-purple-600',
        accentText: isDark ? 'text-purple-300' : 'text-purple-900',
        listBg: isDark ? 'bg-slate-950 text-white' : 'bg-white text-stone-900',
        listItemHover: isDark ? 'hover:bg-purple-900/30' : 'hover:bg-purple-50'
      };
    }

    if (palette === 'peach') {
      return {
        mainBg: isDark ? 'bg-stone-950 text-orange-100' : 'bg-orange-50/70 text-orange-950',
        headerBg: isDark ? 'bg-stone-900 border-stone-800 text-orange-200' : 'bg-orange-200/80 border-orange-300 text-orange-950',
        cardBg: isDark ? 'bg-stone-900/60 border-stone-800 text-orange-100 hover:bg-stone-800/80' : 'bg-white border-orange-200 text-orange-950 hover:bg-orange-100/60',
        badgeBg: 'bg-orange-500 text-white',
        inputBg: isDark ? 'bg-stone-800 text-white placeholder-orange-300' : 'bg-orange-100 text-orange-950 placeholder-orange-700',
        accentText: isDark ? 'text-orange-300' : 'text-orange-900',
        listBg: isDark ? 'bg-stone-950 text-white' : 'bg-white text-stone-900',
        listItemHover: isDark ? 'hover:bg-stone-900' : 'hover:bg-orange-50'
      };
    }

    // Default: Maroon
    return {
      mainBg: isDark ? 'bg-stone-950 text-white' : 'bg-stone-100 text-stone-900',
      headerBg: 'bg-rose-950 text-white border-rose-900',
      cardBg: isDark ? 'bg-rose-950/40 hover:bg-rose-950/70 border-rose-900/40 text-stone-100' : 'bg-white hover:bg-rose-50 border-stone-200 text-stone-900',
      badgeBg: 'bg-amber-400 text-rose-950',
      inputBg: 'bg-rose-900/80 text-white placeholder-rose-300/80',
      accentText: 'text-amber-400',
      listBg: isDark ? 'bg-stone-900 text-white' : 'bg-white text-stone-900',
      listItemHover: isDark ? 'hover:bg-rose-900/30' : 'hover:bg-rose-50/60'
    };
  }, [themeConfig]);

  return (
    <div className={`h-screen w-full flex flex-col font-sans overflow-hidden select-none ${themeClasses.mainBg}`}>
      {currentView === 'songbooks' && (
        <SongbookSelection 
          onSelectCategory={handleSelectSongbook}
          favoritesCount={favorites.length}
          themeClasses={themeClasses}
          onOpenTheme={() => setIsThemeOpen(true)}
        />
      )}

      {currentView === 'list' && (
        <HymnList 
          hymns={filteredHymns} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          sortBy={sortBy}
          setSortBy={setSortBy}
          onSelectHymn={(hymn) => { setSelectedHymnKey(getHymnKey(hymn)); setCurrentView('viewer'); }}
          selectedCategory={selectedCategory}
          onBackToSongbooks={() => setCurrentView('songbooks')}
          favorites={favorites} 
          toggleFavorite={toggleFavorite}
          themeClasses={themeClasses}
          onOpenTheme={() => setIsThemeOpen(true)}
        />
      )}

      {currentView === 'viewer' && selectedHymn && (
        <HymnViewer 
          key={selectedHymnKey}
          hymn={selectedHymn} 
          onClose={() => setCurrentView('list')} 
          onNavigate={(dir) => {
            if (dir === 'next' && currentIndex < categoryHymns.length - 1) {
              setSelectedHymnKey(getHymnKey(categoryHymns[currentIndex + 1]));
            }
            if (dir === 'prev' && currentIndex > 0) {
              setSelectedHymnKey(getHymnKey(categoryHymns[currentIndex - 1]));
            }
          }}
          isFirst={currentIndex === 0} 
          isLast={currentIndex === categoryHymns.length - 1}
          isFavorite={favorites.includes(getHymnKey(selectedHymn))} 
          onToggleFavorite={() => toggleFavorite(selectedHymn)}
          themeClasses={themeClasses}
        />
      )}

      {isThemeOpen && (
        <ThemeModal 
          themeConfig={themeConfig} 
          setThemeConfig={setThemeConfig} 
          onClose={() => setIsThemeOpen(false)} 
        />
      )}
    </div>
  );
}

function ThemeModal({ themeConfig, setThemeConfig, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 text-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={22} className="text-amber-400" />
            <h3 className="font-bold text-lg">App Theme</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-stone-800 active:scale-90 text-stone-400 hover:text-white transition-all duration-150"
          >
            <X size={20} />
          </button>
        </div>

        {/* Display Mode Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-stone-400 tracking-wider">Display Mode</label>
          <div className="grid grid-cols-2 gap-2 bg-stone-950 p-1 rounded-2xl border border-stone-800">
            <button
              onClick={() => setThemeConfig(prev => ({ ...prev, isDark: false }))}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${
                !themeConfig.isDark ? 'bg-amber-400 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Sun size={16} /> Light
            </button>
            <button
              onClick={() => setThemeConfig(prev => ({ ...prev, isDark: true }))}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${
                themeConfig.isDark ? 'bg-amber-400 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Moon size={16} /> Dark
            </button>
          </div>
        </div>

        {/* Palette Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-stone-400 tracking-wider">Color Palette</label>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
            {PALETTES.map((p) => {
              const isSelected = themeConfig.palette === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setThemeConfig(prev => ({ ...prev, palette: p.id }))}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all duration-150 active:scale-[0.98] ${
                    isSelected ? 'border-amber-400 bg-stone-800/90' : 'border-stone-800 bg-stone-950/60 hover:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-7 h-7 rounded-full border border-white/20 flex-shrink-0 shadow-inner" 
                      style={{ background: p.color }}
                    />
                    <span className="text-sm font-medium text-stone-200">{p.name}</span>
                  </div>
                  {isSelected && <Check size={18} className="text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-stone-950 font-bold rounded-2xl transition-all duration-150 shadow-md"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function SongbookSelection({ onSelectCategory, favoritesCount, themeClasses, onOpenTheme }) {
  const counts = useMemo(() => {
    return {
      hiligaynon: HYMN_DATABASE.filter(h => h.category === 'hiligaynon').length,
      english: HYMN_DATABASE.filter(h => h.category === 'english').length,
      worship: HYMN_DATABASE.filter(h => h.category === 'worship').length,
      all: HYMN_DATABASE.length
    };
  }, []);

  const songbooks = [
    {
      id: 'hiligaynon',
      title: 'Hiligaynon Hymnal',
      subtitle: 'Mga Ambahanon sa Pagdayaw',
      count: counts.hiligaynon,
      icon: BookOpen
    },
    {
      id: 'english',
      title: 'English Hymnal',
      subtitle: 'Classic Sacred Songs & Hymns',
      count: counts.english,
      icon: Globe
    },
    {
      id: 'worship',
      title: 'Worship Songs',
      subtitle: 'Contemporary Praise & Chords',
      count: counts.worship,
      icon: Music
    },
    {
      id: 'all',
      title: 'All Songs',
      subtitle: 'Complete Songbook Collection',
      count: counts.all,
      icon: Layers
    },
    {
      id: 'favorites',
      title: 'Paborito (Favorites)',
      subtitle: 'Your Saved Songs',
      count: favoritesCount,
      icon: Heart
    }
  ];

  return (
    <div className={`flex flex-col h-full w-full max-w-2xl mx-auto justify-between overflow-y-auto ${themeClasses.mainBg}`}>
      <div>
        <div className="p-6 pt-10 text-center relative">
          <button 
            onClick={onOpenTheme} 
            className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 backdrop-blur-md transition-all duration-150"
            title="Theme Settings"
          >
            <Palette size={20} />
          </button>

          <div className="inline-flex p-3 bg-black/20 text-amber-400 rounded-2xl mb-3 border border-white/10 shadow-inner">
            <BookOpen size={36} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Pili sang Songbook</h1>
          <p className="text-sm opacity-80 mt-1">Select a hymnal category to browse</p>
        </div>

        <div className="p-4 space-y-3">
          {songbooks.map((sb) => {
            const Icon = sb.icon;
            return (
              <button
                key={sb.id}
                onClick={() => onSelectCategory(sb.id)}
                className={`w-full text-left border rounded-2xl p-4 flex items-center justify-between transition-all duration-150 ease-out active:scale-[0.98] hover:shadow-md ${themeClasses.cardBg}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 bg-black/20">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base">{sb.title}</h2>
                    <p className="text-xs opacity-75">{sb.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${themeClasses.badgeBg}`}>
                    {sb.count}
                  </span>
                  <ChevronRight size={18} className="opacity-50" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 text-center text-xs opacity-60 border-t border-white/10">
        Hiligaynon Hymnal App • v{APP_VERSION}
      </div>
    </div>
  );
}

function HymnList({ hymns, searchQuery, setSearchQuery, sortBy, setSortBy, onSelectHymn, selectedCategory, onBackToSongbooks, favorites, toggleFavorite, themeClasses, onOpenTheme }) {
  const categoryTitles = {
    hiligaynon: 'Hiligaynon Hymnal',
    english: 'English Hymnal',
    worship: 'Worship Songs',
    all: 'Tanan nga Ambahanon',
    favorites: 'Paborito'
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'english':
        return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded">ENG</span>;
      case 'worship':
        return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-900 rounded">WORSHIP</span>;
      case 'hiligaynon':
        return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-rose-100 text-rose-900 rounded">HIL</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col h-full w-full max-w-2xl mx-auto shadow-lg ${themeClasses.listBg}`}>
      <header className={`p-4 shadow-md z-10 border-b ${themeClasses.headerBg}`}>
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={onBackToSongbooks}
            className="flex items-center gap-1 text-xs bg-black/20 hover:bg-black/30 active:bg-black/50 active:scale-95 transition-all duration-150 px-3 py-1.5 rounded-lg font-medium"
          >
            <ArrowLeft size={16} /> Songbooks
          </button>
          
          <h1 className="text-base font-bold truncate px-2">{categoryTitles[selectedCategory] || 'Ambahanon'}</h1>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSortBy(prev => prev === 'number' ? 'alpha' : 'number')}
              className="flex items-center gap-1 text-xs bg-black/20 hover:bg-black/30 active:bg-black/50 active:scale-95 transition-all duration-150 px-2.5 py-1.5 rounded-lg font-medium"
              title="Toggle sort order"
            >
              <ArrowUpDown size={14} />
              <span>{sortBy === 'number' ? 'By No.' : 'A–Z'}</span>
            </button>

            <button 
              onClick={onOpenTheme} 
              className="p-1.5 bg-black/20 hover:bg-black/30 active:bg-black/50 active:scale-95 rounded-lg transition-all duration-150"
              title="Theme Settings"
            >
              <Palette size={16} />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search size={20} className="absolute left-3 top-3.5 opacity-60 pointer-events-none" />
          <input
            type="text"
            className={`block w-full pl-10 pr-10 py-2.5 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${themeClasses.inputBg}`}
            placeholder="Pangitaa (e.g. 1, 001, ukon 'Amazing')..."
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 opacity-80 hover:opacity-100 active:scale-90 bg-black/30 p-1 rounded-full transition-transform">
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-white/5">
          {hymns.length === 0 ? (
            <li className="p-8 text-center opacity-50">Wala sing ambahanon nga nakaplagan.</li>
          ) : (
            hymns.map((hymn) => {
              const key = getHymnKey(hymn);
              const isFav = favorites.includes(key);
              return (
                <li key={key} className={`flex items-center transition-all duration-150 active:scale-[0.99] ${themeClasses.listItemHover}`}>
                  <button onClick={() => onSelectHymn(hymn)} className="flex-1 text-left px-4 py-3.5 flex items-center gap-3">
                    <span className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border border-white/10 ${themeClasses.badgeBg}`}>
                      {hymn.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium truncate">{hymn.title}</span>
                        {(selectedCategory === 'all' || selectedCategory === 'favorites') && getCategoryBadge(hymn.category)}
                      </div>
                    </div>
                  </button>
                  <button onClick={() => toggleFavorite(hymn)} className="p-4 opacity-40 hover:opacity-100 active:scale-90 transition-all duration-150">
                    <Heart size={22} className={isFav ? 'fill-rose-500 text-rose-500 opacity-100' : ''} />
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

function HymnViewer({ hymn, onClose, onNavigate, isFirst, isLast, isFavorite, onToggleFavorite, themeClasses }) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);

  if (!hymn) return null;

  const hasScans = hymn.category === 'hiligaynon' || (hymn.pages && hymn.pages.length > 0);
  const [viewMode, setViewMode] = useState(hasScans ? 'scan' : 'lyrics');

  const key = getHymnKey(hymn);
  const rawLyrics = hymnLyrics[key] || hymnLyrics[hymn.id] || '';
  const plainLyrics = rawLyrics.replace(/\[.*?\]/g, '');

  const renderChords = (text) => {
    if (!text) {
      return <p className="opacity-50 italic text-center my-8">Wala pa sing lyrics/chords para sa sini nga ambahanon.</p>;
    }

    return text.split('\n').map((line, lineIdx) => {
      const parts = line.split(/\[(.*?)\]/);
      const blocks = [];

      if (parts[0]) blocks.push({ chord: '', text: parts[0] });

      for (let i = 1; i < parts.length; i += 2) {
        blocks.push({
          chord: parts[i],
          text: parts[i + 1] || '',
        });
      }

      return (
        <div key={lineIdx} className="flex flex-wrap mb-2 leading-tight">
          {blocks.map((b, i) => (
            <span key={i} className="inline-flex flex-col items-start mr-1">
              <span className={`font-bold text-xs min-h-[1.1rem] ${themeClasses.accentText}`}>{b.chord}</span>
              <span className="text-base">{b.text || '\u00A0'}</span>
            </span>
          ))}
        </div>
      );
    });
  };

  return (
    <div className={`flex flex-col h-full w-full ${themeClasses.listBg}`}>
      <header className={`p-2 flex items-center justify-between shadow-md z-20 border-b ${themeClasses.headerBg}`}>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-black/20 active:scale-90 transition-all duration-150"><ArrowLeft size={24} /></button>
        <div className="text-center flex-1 px-2 truncate">
          <span className={`text-xs block uppercase font-medium ${themeClasses.accentText}`}>
            Hymn {hymn.id} • {hymn.category}
          </span>
          <h2 className="text-sm md:text-base font-bold truncate">{hymn.title}</h2>
        </div>

        <div className="flex gap-1">
          <button onClick={onToggleFavorite} className="p-2 rounded-full hover:bg-black/20 active:scale-90 transition-all duration-150">
            <Heart size={22} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
          </button>
          {viewMode === 'scan' && (
            <>
              <button onClick={() => setZoom(p => Math.max(p - 0.5, 1))} disabled={zoom === 1} className="p-2 rounded-full disabled:opacity-40 hover:bg-black/20 active:scale-90 transition-all duration-150"><ZoomOut size={22} /></button>
              <button onClick={() => setZoom(p => Math.min(p + 0.5, 3))} disabled={zoom === 3} className="p-2 rounded-full disabled:opacity-40 hover:bg-black/20 active:scale-90 transition-all duration-150"><ZoomIn size={22} /></button>
            </>
          )}
        </div>
      </header>

      <div className="bg-black/20 px-4 py-2 flex justify-center border-b border-white/10 z-10">
        <div className="flex bg-black/30 p-1 rounded-xl max-w-xs w-full">
          {hasScans && (
            <button
              onClick={() => setViewMode('scan')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 active:scale-95 ${viewMode === 'scan' ? `${themeClasses.badgeBg} shadow` : 'opacity-60 hover:opacity-100'}`}
            >
              Scan
            </button>
          )}
          <button
            onClick={() => setViewMode('lyrics')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 active:scale-95 ${viewMode === 'lyrics' ? `${themeClasses.badgeBg} shadow` : 'opacity-60 hover:opacity-100'}`}
          >
            Lyrics
          </button>
          <button
            onClick={() => setViewMode('chords')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 active:scale-95 ${viewMode === 'chords' ? `${themeClasses.badgeBg} shadow` : 'opacity-60 hover:opacity-100'}`}
          >
            Chords
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto relative touch-pan-x touch-pan-y">
        {viewMode === 'scan' && (
          <div className="flex min-w-full flex-col items-center gap-4 p-2 bg-stone-900">
            {hymn.pages?.map((page) => (
              <img 
                key={page} 
                src={`/scans/page-${String(page).padStart(3, '0')}.jpg`} 
                alt={`${hymn.title}, page ${page}`} 
                className="max-w-full origin-top-left transition-transform duration-200" 
                style={{ transform: `scale(${zoom})` }} 
              />
            ))}
          </div>
        )}

        {viewMode === 'lyrics' && (
          <div className="p-6 max-w-xl mx-auto">
            {plainLyrics ? (
              <pre className="whitespace-pre-wrap font-sans text-lg leading-relaxed">{plainLyrics}</pre>
            ) : (
              <p className="opacity-50 italic text-center my-8">Wala pa sing lyrics para sa sini nga ambahanon.</p>
            )}
          </div>
        )}

        {viewMode === 'chords' && (
          <div className="p-6 max-w-xl mx-auto">
            {renderChords(rawLyrics)}
          </div>
        )}

        {viewMode === 'scan' && zoom > 1 && (
          <button onClick={() => setZoom(1)} className="fixed bottom-20 right-4 bg-black/80 text-white p-3 rounded-full shadow-lg backdrop-blur-sm active:scale-90 transition-transform">
            <Maximize size={20} />
          </button>
        )}
      </div>

      <div className={`p-3 flex justify-between items-center border-t border-white/10 safe-area-bottom ${themeClasses.headerBg}`}>
        <button onClick={() => onNavigate('prev')} disabled={isFirst} className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-black/30 disabled:opacity-30 hover:bg-black/50 active:scale-95 transition-all duration-150 w-28 font-medium">
          <ChevronLeft size={20} /> Antis
        </button>
        <span className={`text-sm font-bold ${themeClasses.accentText}`}>Hymn {hymn.id}</span>
        <button onClick={() => onNavigate('next')} disabled={isLast} className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-black/30 disabled:opacity-30 hover:bg-black/50 active:scale-95 transition-all duration-150 w-28 font-medium">
          Sunod <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

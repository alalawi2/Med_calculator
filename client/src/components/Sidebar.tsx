import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Heart, Zap, Wind, AlertTriangle, Clock, Star } from "lucide-react";
import { calculators, categories } from "@/lib/calculators";

interface SidebarProps {
  selectedCalculatorId: string;
  onSelectCalculator: (id: string) => void;
  recentlyUsed: string[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Critical Care": <AlertTriangle className="w-4 h-4" />,
  Cardiology: <Heart className="w-4 h-4" />,
  Vascular: <Zap className="w-4 h-4" />,
  Respiratory: <Wind className="w-4 h-4" />,
};

export function Sidebar({
  selectedCalculatorId,
  onSelectCalculator,
  recentlyUsed,
  favorites,
  onToggleFavorite,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCalculators = useMemo(() => {
    return calculators.filter((calc) => {
      const matchesSearch =
        calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        calc.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !activeCategory || calc.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const recentCalculators = useMemo(() => {
    return calculators.filter((calc) => recentlyUsed.includes(calc.id));
  }, [recentlyUsed]);

  const favoriteCalculators = useMemo(() => {
    return calculators.filter((calc) => favorites.includes(calc.id));
  }, [favorites]);

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Calculators</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search calculators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Recently Used */}
          {recentCalculators.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-semibold text-slate-600 uppercase">Recently Used</h3>
              </div>
              <div className="space-y-1">
                {recentCalculators.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => onSelectCalculator(calc.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedCalculatorId === calc.id
                        ? "bg-blue-100 text-blue-900 font-medium"
                        : "text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{calc.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(calc.id);
                        }}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            favorites.includes(calc.id)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300 hover:text-yellow-400"
                          }`}
                        />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Favorites */}
          {favoriteCalculators.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <h3 className="text-xs font-semibold text-slate-600 uppercase">Favorites</h3>
              </div>
              <div className="space-y-1">
                {favoriteCalculators.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => onSelectCalculator(calc.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedCalculatorId === calc.id
                        ? "bg-blue-100 text-blue-900 font-medium"
                        : "text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{calc.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(calc.id);
                        }}
                        className="focus:outline-none"
                      >
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveCategory(null)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeCategory === null
                    ? "bg-blue-100 text-blue-900 font-medium"
                    : "text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Calculators
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                    activeCategory === category
                      ? "bg-blue-100 text-blue-900 font-medium"
                      : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {categoryIcons[category]}
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* All Calculators */}
          <div>
            <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2">
              {activeCategory ? `${activeCategory} Calculators` : "All Calculators"}
            </h3>
            <div className="space-y-1">
              {filteredCalculators.map((calc) => (
                <button
                  key={calc.id}
                  onClick={() => onSelectCalculator(calc.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedCalculatorId === calc.id
                      ? "bg-blue-100 text-blue-900 font-medium"
                      : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {categoryIcons[calc.category]}
                        <span className="font-medium">{calc.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{calc.description}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(calc.id);
                      }}
                      className="focus:outline-none ml-2"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          favorites.includes(calc.id)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-300 hover:text-yellow-400"
                        }`}
                      />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

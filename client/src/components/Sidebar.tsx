import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Heart, AlertTriangle, Clock, Star, Stethoscope } from "lucide-react";
import { calculators } from "@/lib/calculators";

interface SidebarProps {
  selectedCalculatorId: string | null;
  onSelectCalculator: (id: string) => void;
  recentlyUsed: string[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Critical Care": <AlertTriangle className="w-4 h-4 text-red-600" />,
  Cardiology: <Heart className="w-4 h-4 text-red-500" />,
  Neurology: <Stethoscope className="w-4 h-4 text-purple-600" />,
  "Emergency Medicine": <AlertTriangle className="w-4 h-4 text-orange-600" />,
  Infectious: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
  Respiratory: <Stethoscope className="w-4 h-4 text-blue-600" />,
  Hepatology: <Stethoscope className="w-4 h-4 text-green-600" />,
  Nephrology: <Stethoscope className="w-4 h-4 text-cyan-600" />,
  Gastroenterology: <Stethoscope className="w-4 h-4 text-amber-600" />,
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

  // Get all unique categories from calculators
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    calculators.forEach((calc) => {
      if (Array.isArray(calc.categories)) {
        calc.categories.forEach((cat) => categories.add(cat));
      }
    });
    return Array.from(categories).sort();
  }, []);

  // Filter calculators based on search and category
  const filteredCalculators = useMemo(() => {
    return calculators.filter((calc) => {
      const matchesSearch =
        calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        calc.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !activeCategory || 
        (Array.isArray(calc.categories) && calc.categories.includes(activeCategory));
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  // Get recent and favorite calculators
  const recentCalculators = useMemo(() => {
    return calculators.filter((calc) => recentlyUsed.includes(calc.id)).slice(0, 5);
  }, [recentlyUsed]);

  const favoriteCalculators = useMemo(() => {
    return calculators.filter((calc) => favorites.includes(calc.id));
  }, [favorites]);

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || <Stethoscope className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Calculators</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search..."
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
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-semibold text-slate-600 uppercase">Recently Used</h3>
              </div>
              <div className="space-y-1">
                {recentCalculators.map((calc) => (
                  <div
                    key={calc.id}
                    onClick={() => onSelectCalculator(calc.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      selectedCalculatorId === calc.id
                        ? "bg-blue-100 text-blue-900 font-medium"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{calc.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(calc.id);
                        }}
                        className="ml-2"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            favorites.includes(calc.id)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorites */}
          {favoriteCalculators.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-yellow-500" />
                <h3 className="text-xs font-semibold text-slate-600 uppercase">Favorites</h3>
              </div>
              <div className="space-y-1">
                {favoriteCalculators.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => onSelectCalculator(calc.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCalculatorId === calc.id
                        ? "bg-blue-100 text-blue-900 font-medium"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{calc.name}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold text-slate-600 uppercase mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCategory === null
                    ? "bg-blue-100 text-blue-900 font-medium"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                All Calculators
              </button>
              {allCategories.map((category) => {
                const count = calculators.filter(
                  (calc) =>
                    Array.isArray(calc.categories) && calc.categories.includes(category)
                ).length;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      activeCategory === category
                        ? "bg-blue-100 text-blue-900 font-medium"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getCategoryIcon(category)}
                      <span className="truncate">{category}</span>
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculator List */}
          {filteredCalculators.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-600 uppercase mb-3">
                {activeCategory ? `${activeCategory} (${filteredCalculators.length})` : `All (${filteredCalculators.length})`}
              </h3>
              <div className="space-y-1">
                {filteredCalculators.map((calc) => (
                  <div
                    key={calc.id}
                    onClick={() => onSelectCalculator(calc.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      selectedCalculatorId === calc.id
                        ? "bg-blue-100 text-blue-900 font-medium"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="truncate flex-1">
                        <p className="font-medium truncate">{calc.name}</p>
                        <p className="text-xs text-slate-500 truncate">{calc.description}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(calc.id);
                        }}
                        className="ml-2 flex-shrink-0"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            favorites.includes(calc.id)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredCalculators.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No calculators found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

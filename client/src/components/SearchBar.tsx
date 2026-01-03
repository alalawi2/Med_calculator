import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  name: string;
  type: "calculator" | "medication";
  category?: string;
  description?: string;
}

interface SearchBarProps {
  calculators: any[];
  medications: any[];
  onSelectCalculator?: (id: string) => void;
  onSelectMedication?: (id: string) => void;
  onClose?: () => void;
}

export function SearchBar({
  calculators,
  medications,
  onSelectCalculator,
  onSelectMedication,
  onClose,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search calculators
    calculators.forEach((calc: any) => {
      if (
        calc.name.toLowerCase().includes(query) ||
        calc.description?.toLowerCase().includes(query) ||
        calc.category?.toLowerCase().includes(query) ||
        calc.clinicalUses?.some((use: string) => use.toLowerCase().includes(query))
      ) {
        results.push({
          id: calc.id,
          name: calc.name,
          type: "calculator",
          category: calc.category,
          description: calc.description,
        });
      }
    });

    // Search medications
    medications.forEach((med: any) => {
      if (
        med.name.toLowerCase().includes(query) ||
        med.genericName?.toLowerCase().includes(query) ||
        med.indications?.some((ind: string) => ind.toLowerCase().includes(query))
      ) {
        results.push({
          id: med.id,
          name: med.name,
          type: "medication",
          description: med.genericName || med.indications?.[0],
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [searchQuery, calculators, medications]);

  const handleSelectResult = (result: SearchResult) => {
    if (result.type === "calculator" && onSelectCalculator) {
      onSelectCalculator(result.id);
    } else if (result.type === "medication" && onSelectMedication) {
      onSelectMedication(result.id);
    }
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search calculators, medications, conditions..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (searchQuery || searchResults.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg">
          <div className="max-h-96 overflow-y-auto">
            {searchResults.length === 0 && searchQuery ? (
              <div className="p-4 text-center text-slate-600">
                <p>No results found for "{searchQuery}"</p>
                <p className="text-xs text-slate-500 mt-1">Try searching by calculator name, condition, or medication</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-slate-600">
                <p className="text-sm">Start typing to search calculators and medications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {/* Calculators Section */}
                {searchResults.filter((r) => r.type === "calculator").length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-slate-50 sticky top-0">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Clinical Calculators</p>
                    </div>
                    {searchResults
                      .filter((r) => r.type === "calculator")
                      .map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleSelectResult(result)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-none"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{result.name}</p>
                              <p className="text-sm text-slate-600 line-clamp-1">{result.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              {result.category}
                            </Badge>
                          </div>
                        </button>
                      ))}
                  </div>
                )}

                {/* Medications Section */}
                {searchResults.filter((r) => r.type === "medication").length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-slate-50 sticky top-0">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Medications</p>
                    </div>
                    {searchResults
                      .filter((r) => r.type === "medication")
                      .map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleSelectResult(result)}
                          className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-none"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{result.name}</p>
                              <p className="text-sm text-slate-600 line-clamp-1">{result.description}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs whitespace-nowrap">
                              Medication
                            </Badge>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Backdrop to close search */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            onClose?.();
          }}
        />
      )}
    </div>
  );
}

import React, { useState } from "react";
import { Menu, X, Search, Heart, Wind, Brain, Droplet, Liver, Stomach, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SidebarMobileProps {
  calculators: any[];
  selectedCalculator: string | null;
  onSelectCalculator: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  favorites: string[];
  recentlyUsed: string[];
}

export default function SidebarMobile({
  calculators,
  selectedCalculator,
  onSelectCalculator,
  onToggleFavorite,
  favorites,
  recentlyUsed,
}: SidebarMobileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "category" | "favorites">("all");

  const categoryIcons: Record<string, React.ReactNode> = {
    "Critical Care": <AlertTriangle className="w-4 h-4" />,
    "Cardiology": <Heart className="w-4 h-4" />,
    "Neurology": <Brain className="w-4 h-4" />,
    "Respiratory": <Wind className="w-4 h-4" />,
    "Renal": <Droplet className="w-4 h-4" />,
    "Hepatology": <Liver className="w-4 h-4" />,
    "Gastroenterology": <Stomach className="w-4 h-4" />,
    "Geriatric": <Users className="w-4 h-4" />,
  };

  const filteredCalculators = calculators.filter((calc) =>
    calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    calc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteCalculators = filteredCalculators.filter((c) => favorites.includes(c.id));
  const recentCalculators = filteredCalculators.filter((c) => recentlyUsed.includes(c.id));

  const displayCalculators =
    activeTab === "favorites"
      ? favoriteCalculators
      : activeTab === "recently-used"
      ? recentCalculators
      : filteredCalculators;

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-border z-40 p-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">MedResearch</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 top-16"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border z-40 transform transition-transform duration-300 md:hidden overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search calculators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-sm"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab("all")}
              className={`text-sm font-medium pb-2 px-2 border-b-2 transition-colors ${
                activeTab === "all"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              All
            </button>
            {recentlyUsed.length > 0 && (
              <button
                onClick={() => setActiveTab("recently-used")}
                className={`text-sm font-medium pb-2 px-2 border-b-2 transition-colors ${
                  activeTab === "recently-used"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                Recent
              </button>
            )}
            {favorites.length > 0 && (
              <button
                onClick={() => setActiveTab("favorites")}
                className={`text-sm font-medium pb-2 px-2 border-b-2 transition-colors ${
                  activeTab === "favorites"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                ⭐
              </button>
            )}
          </div>

          {/* Calculator List */}
          <div className="space-y-2">
            {displayCalculators.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No calculators found
              </p>
            ) : (
              displayCalculators.map((calc) => (
                <div
                  key={calc.id}
                  onClick={() => {
                    onSelectCalculator(calc.id);
                    setIsOpen(false);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                    selectedCalculator === calc.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {calc.shortName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {calc.categories?.[0] || calc.category}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(calc.id);
                      }}
                      className="text-lg"
                    >
                      {favorites.includes(calc.id) ? "⭐" : "☆"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-muted/30 md:overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search calculators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab("all")}
              className={`text-sm font-medium pb-2 px-2 border-b-2 transition-colors ${
                activeTab === "all"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              All
            </button>
            {recentlyUsed.length > 0 && (
              <button
                onClick={() => setActiveTab("recently-used")}
                className={`text-sm font-medium pb-2 px-2 border-b-2 transition-colors ${
                  activeTab === "recently-used"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                Recent
              </button>
            )}
            {favorites.length > 0 && (
              <button
                onClick={() => setActiveTab("favorites")}
                className={`text-sm font-medium pb-2 px-2 border-b-2 transition-colors ${
                  activeTab === "favorites"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                ⭐
              </button>
            )}
          </div>

          {/* Calculator List */}
          <div className="space-y-2">
            {displayCalculators.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No calculators found
              </p>
            ) : (
              displayCalculators.map((calc) => (
                <div
                  key={calc.id}
                  onClick={() => onSelectCalculator(calc.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                    selectedCalculator === calc.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {calc.shortName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {calc.categories?.[0] || calc.category}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(calc.id);
                      }}
                      className="text-lg"
                    >
                      {favorites.includes(calc.id) ? "⭐" : "☆"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

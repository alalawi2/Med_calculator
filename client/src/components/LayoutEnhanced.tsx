import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LayoutEnhancedProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header?: React.ReactNode;
}

export function LayoutEnhanced({ children, sidebar, header }: LayoutEnhancedProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900">MedResearch Academy</h1>
                <p className="text-xs text-slate-500">Clinical Decision Support</p>
              </div>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search calculators, medications..."
                  className="pl-10 pr-4 h-9 text-sm"
                />
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2"
              >
                <Search className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>

            {/* Desktop Header Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          {searchOpen && (
            <div className="md:hidden pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search calculators, medications..."
                  className="pl-10 pr-4 h-9 text-sm w-full"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 bg-white border-r border-slate-200 overflow-y-auto sticky top-16 h-[calc(100vh-4rem)]">
          {sidebar}
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar Content */}
            <aside className="absolute left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 overflow-y-auto">
              {sidebar}
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {header && <div className="mb-8">{header}</div>}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

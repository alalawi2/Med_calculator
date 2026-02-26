import React, { createContext, useContext, useState, useEffect } from "react";
import type { UnitSystem } from "@/lib/unit-conversions";

interface UnitSystemContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
  toggleUnitSystem: () => void;
}

const UnitSystemContext = createContext<UnitSystemContextType | undefined>(undefined);

export function UnitSystemProvider({ children }: { children: React.ReactNode }) {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
    // Load from localStorage or default to SI units (Gulf region standard)
    const stored = localStorage.getItem("medad_unit_system");
    return (stored as UnitSystem) || "si";
  });

  const setUnitSystem = (system: UnitSystem) => {
    setUnitSystemState(system);
    localStorage.setItem("medad_unit_system", system);
  };

  const toggleUnitSystem = () => {
    setUnitSystem(unitSystem === "american" ? "si" : "american");
  };

  return (
    <UnitSystemContext.Provider value={{ unitSystem, setUnitSystem, toggleUnitSystem }}>
      {children}
    </UnitSystemContext.Provider>
  );
}

export function useUnitSystem() {
  const context = useContext(UnitSystemContext);
  if (context === undefined) {
    throw new Error("useUnitSystem must be used within a UnitSystemProvider");
  }
  return context;
}

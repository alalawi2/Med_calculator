import { useUnitSystem } from "@/contexts/UnitSystemContext";
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";

export function UnitToggle() {
  const { unitSystem, toggleUnitSystem } = useUnitSystem();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleUnitSystem}
      className="gap-2"
      title="Toggle between American and International units"
    >
      <Repeat className="w-4 h-4" />
      <span className="hidden sm:inline">
        {unitSystem === "american" ? "American" : "SI"} Units
      </span>
      <span className="sm:hidden">
        {unitSystem === "american" ? "US" : "SI"}
      </span>
    </Button>
  );
}

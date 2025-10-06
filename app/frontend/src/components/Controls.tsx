import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Pause, Play, RotateCcw } from "lucide-react";

interface ControlsProps {
  isPaused: boolean;
  speed: number;
  showOrbits: boolean;
  showLabels: boolean;
  onTogglePause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onToggleOrbits: () => void;
  onToggleLabels: () => void;
}

export const Controls = ({
  isPaused,
  speed,
  showOrbits,
  showLabels,
  onTogglePause,
  onReset,
  onSpeedChange,
  onToggleOrbits,
  onToggleLabels,
}: ControlsProps) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur border border-border rounded-lg px-6 py-3 shadow-lg">
      <div className="flex items-center gap-6">
        <Button size="icon" variant="ghost" onClick={onTogglePause} className="h-8 w-8">
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>

        <Button size="icon" variant="ghost" onClick={onReset} className="h-8 w-8">
          <RotateCcw className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3 min-w-[200px]">
          <Label className="text-sm whitespace-nowrap">Velocidade: {speed.toFixed(1)}x</Label>
          <Slider
            value={[speed]}
            onValueChange={(value) => onSpeedChange(value[0])}
            min={0.1}
            max={5}
            step={0.1}
            className="w-32"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={showOrbits} onCheckedChange={onToggleOrbits} id="orbits" />
          <Label htmlFor="orbits" className="text-sm cursor-pointer">
            Mostrar Órbitas
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={showLabels} onCheckedChange={onToggleLabels} id="labels" />
          <Label htmlFor="labels" className="text-sm cursor-pointer">
            Mostrar Nomes
          </Label>
        </div>
      </div>
    </div>
  );
};

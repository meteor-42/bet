import { useState } from "react";
import { MatchCard } from "./MatchCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Match } from "@/lib/supabase";

interface MatchSliderProps {
  matches: Match[];
}

export const MatchSlider = ({ matches }: MatchSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextMatch = () => {
    setCurrentIndex((prev) => (prev + 1) % matches.length);
  };

  const prevMatch = () => {
    setCurrentIndex((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const goToMatch = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-6">
      {/* Match Display */}
      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {matches.map((match, index) => (
              <div key={match.id} className="w-full flex-shrink-0 px-2">
                <MatchCard match={match} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {matches.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm border-border hover:bg-accent"
              onClick={prevMatch}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-background/80 backdrop-blur-sm border-border hover:bg-accent"
              onClick={nextMatch}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Dots Navigation */}
      {matches.length > 1 && (
        <div className="flex justify-center space-x-2">
          {matches.map((_, index) => (
            <button
              key={index}
              onClick={() => goToMatch(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-foreground scale-125"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Match Counter */}
      <div className="text-center text-sm text-muted-foreground">
        {currentIndex + 1} / {matches.length}
      </div>
    </div>
  );
};

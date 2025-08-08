import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";

interface MatchCardProps {
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    time: string;
    league: string;
    stage: string;
    status: "upcoming" | "live" | "finished";
  };
}

export const MatchCard = ({ match }: MatchCardProps) => {
  const [homeScore, setHomeScore] = useState([1]);
  const [awayScore, setAwayScore] = useState([0]);
  const [hasBet, setHasBet] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (match.status !== "upcoming") return;

    const calculateTimeLeft = () => {
      // Создаем дату матча (для демонстрации используем завтрашний день)
      const matchDate = new Date();
      matchDate.setDate(matchDate.getDate() + 1);
      matchDate.setHours(21, 0, 0, 0); // 21:00

      const now = new Date();
      const difference = matchDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [match.status]);

  const getStatusText = (status: string) => {
    switch (status) {
      case "live":
        return "ИДЕТ";
      case "upcoming":
        return "ПРЕДСТОЯЩИЙ";
      case "finished":
        return "ЗАКОНЧЕН";
      default:
        return status.toUpperCase();
    }
  };

  return (
    <Card className="p-6 space-y-4 border border-border hover:shadow-hover transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {match.league} • {match.stage}
          </p>
          <Badge variant={match.status === "live" ? "default" : "secondary"} className="text-xs">
            {getStatusText(match.status)}
          </Badge>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>{match.date}</p>
          <p>{match.time}</p>
        </div>
      </div>

      {/* Teams */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground">
          {match.homeTeam} vs {match.awayTeam}
        </h3>
      </div>

      {/* Score Prediction */}
      <div className={`space-y-4 p-4 rounded border ${
        match.status === "upcoming"
          ? "bg-muted/30 border-border"
          : "bg-muted/10 border-muted"
      }`}>
        <h4 className="text-xs font-medium text-center text-muted-foreground uppercase tracking-wide">
          {match.status === "upcoming" ? "Прогноз счета" : "Прогноз заблокирован"}
        </h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-sm ${
              match.status === "upcoming" ? "text-foreground" : "text-muted-foreground"
            }`}>{match.homeTeam}</span>
            <span className={`text-xl font-medium ${
              match.status === "upcoming" ? "text-foreground" : "text-muted-foreground"
            }`}>{homeScore[0]}</span>
          </div>
          <Slider
            value={homeScore}
            onValueChange={match.status === "upcoming" ? setHomeScore : undefined}
            max={5}
            step={1}
            disabled={match.status !== "upcoming"}
            className={`w-full ${
              match.status !== "upcoming" ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />

          <div className="flex items-center justify-between">
            <span className={`text-sm ${
              match.status === "upcoming" ? "text-foreground" : "text-muted-foreground"
            }`}>{match.awayTeam}</span>
            <span className={`text-xl font-medium ${
              match.status === "upcoming" ? "text-foreground" : "text-muted-foreground"
            }`}>{awayScore[0]}</span>
          </div>
          <Slider
            value={awayScore}
            onValueChange={match.status === "upcoming" ? setAwayScore : undefined}
            max={5}
            step={1}
            disabled={match.status !== "upcoming"}
            className={`w-full ${
              match.status !== "upcoming" ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      {match.status === "upcoming" && (
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setHasBet(true)}
          >
            {hasBet ? "Изменить" : "Сделать ставку"}
          </Button>
        </div>
      )}

      {match.status === "live" && (
        <div className="pt-4 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            Матч начался
          </p>
        </div>
      )}

      {match.status === "finished" && (
        <div className="pt-4 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            Матч закончен
          </p>
        </div>
      )}
    </Card>
  );
};

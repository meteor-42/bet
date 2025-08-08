import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useBets } from "@/hooks/useBets";
import { useAuth } from "@/contexts/AuthContext";
import type { Match } from "@/lib/supabase";

interface MatchCardProps {
  match: Match;
}

export const MatchCard = ({ match }: MatchCardProps) => {
  const { user } = useAuth();
  const { upsertBet, getBetForMatch, hasBetForMatch } = useBets(user?.id);

  const existingBet = getBetForMatch(match.id);
  const [homeScore, setHomeScore] = useState([existingBet?.predicted_home_score || 1]);
  const [awayScore, setAwayScore] = useState([existingBet?.predicted_away_score || 0]);
  const [isSaving, setIsSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Обновляем значения слайдеров при изменении существующей ставки
  useEffect(() => {
    if (existingBet) {
      setHomeScore([existingBet.predicted_home_score]);
      setAwayScore([existingBet.predicted_away_score]);
    }
  }, [existingBet]);

  // Функция сохранения ставки
  const handleSaveBet = async () => {
    if (!user) return;

    setIsSaving(true);
    const success = await upsertBet({
      match_id: match.id,
      predicted_home_score: homeScore[0],
      predicted_away_score: awayScore[0]
    });
    setIsSaving(false);
  };

  useEffect(() => {
    if (match.status !== "upcoming") return;

    const calculateTimeLeft = () => {
      // Создаем дату матча из match_date и match_time
      const [day, month] = match.match_date.split('.');
      const [hours, minutes] = match.match_time.split(':');

      const matchDate = new Date();
      matchDate.setDate(parseInt(day));
      matchDate.setMonth(parseInt(month) - 1);
      matchDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

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
  }, [match.status, match.match_date, match.match_time]);

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
          <p>{match.match_date}</p>
          <p>{match.match_time}</p>
        </div>
      </div>

      {/* Teams */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground">
          {match.home_team} vs {match.away_team}
        </h3>
        {match.status === "finished" && match.home_score !== null && match.away_score !== null && (
          <div className="text-2xl font-bold text-primary mt-2">
            {match.home_score} - {match.away_score}
          </div>
        )}
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
            }`}>{match.home_team}</span>
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
            }`}>{match.away_team}</span>
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

          {existingBet && existingBet.is_calculated && (
            <div className="text-center pt-2 border-t border-border">
              <Badge
                variant={existingBet.points_earned! > 0 ? "default" : "outline"}
                className="text-sm"
              >
                {existingBet.points_earned! > 0 ? "+" : ""}{existingBet.points_earned} очков
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {match.status === "upcoming" && user && (
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleSaveBet}
            disabled={isSaving}
          >
            {isSaving ? "Сохранение..." : (hasBetForMatch(match.id) ? "Изменить ставку" : "Сделать ставку")}
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

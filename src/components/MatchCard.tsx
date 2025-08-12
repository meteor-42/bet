import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useBets } from "@/hooks/useBets";
import { useAuth } from "@/contexts/AuthContext";
import type { Match } from "@/lib/supabase";
import { cn } from "@/lib/utils";

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

  // Compute if match has started based on Moscow time from match_date (DD.MM.YYYY) and match_time (HH:mm)
  const matchStarted = (() => {
    const dateParts = (match.match_date || "").split("."); // DD.MM.YYYY
    const timeParts = (match.match_time || "").split(":"); // HH:mm
    if (dateParts.length !== 3 || timeParts.length < 2) return false;
    const [dd, mm, yyyy] = dateParts.map((p) => parseInt(p, 10));
    const [HH, MM] = timeParts.map((p) => parseInt(p, 10));
    if (!yyyy || !mm || !dd || isNaN(HH) || isNaN(MM)) return false;
    // Build ISO string with +03:00 offset (Moscow, no DST)
    const iso = `${yyyy.toString().padStart(4, '0')}-${mm.toString().padStart(2, '0')}-${dd
      .toString()
      .padStart(2, '0')}T${HH.toString().padStart(2, '0')}:${MM.toString().padStart(2, '0')}:00+03:00`;
    const start = new Date(iso).getTime();
    if (Number.isNaN(start)) return false;
    return Date.now() >= start;
  })();

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
    if (matchStarted || match.status !== "upcoming") return;

    setIsSaving(true);
    const success = await upsertBet({
      match_id: match.id,
      predicted_home_score: homeScore[0],
      predicted_away_score: awayScore[0]
    });
    setIsSaving(false);
  };

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
            {match.league} {match.tour && `• ${match.tour} ТУР`}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant={match.status === "live" ? "default" : "secondary"} className="text-xs">
              {getStatusText(match.status)}
            </Badge>
            {/* Removed top points badge per request */}
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>{match.match_date}</p>
          <p>{match.match_time} (МСК)</p>
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
      <div className={cn(
        "space-y-4 p-4 rounded border",
        match.status === "upcoming" ? "bg-muted/30 border-border" : "bg-muted/10 border-muted",
        matchStarted && "opacity-60"
      )}>
        <h4 className="text-xs font-medium text-center text-muted-foreground uppercase tracking-wide">
          {match.status !== "upcoming" || matchStarted ? "Прогноз заблокирован" : "Прогноз счета"}
        </h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={cn("text-sm", match.status === "upcoming" && !matchStarted ? "text-foreground" : "text-muted-foreground")}>{match.home_team}</span>
            <span className={`text-xl font-medium ${
              match.status === "upcoming" && !matchStarted ? "text-foreground" : "text-muted-foreground"
            }`}>{homeScore[0]}</span>
          </div>
          <Slider
            value={homeScore}
            onValueChange={match.status === "upcoming" && !matchStarted ? setHomeScore : undefined}
            max={5}
            step={1}
            disabled={match.status !== "upcoming" || matchStarted}
            className={`w-full ${
              match.status !== "upcoming" || matchStarted ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />

          <div className="flex items-center justify-between">
            <span className={cn("text-sm", match.status === "upcoming" && !matchStarted ? "text-foreground" : "text-muted-foreground")}>{match.away_team}</span>
            <span className={`text-xl font-medium ${
              match.status === "upcoming" && !matchStarted ? "text-foreground" : "text-muted-foreground"
            }`}>{awayScore[0]}</span>
          </div>
          <Slider
            value={awayScore}
            onValueChange={match.status === "upcoming" && !matchStarted ? setAwayScore : undefined}
            max={5}
            step={1}
            disabled={match.status !== "upcoming" || matchStarted}
            className={`w-full ${
              match.status !== "upcoming" || matchStarted ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
        </div>
      </div>

      {/* Action Buttons */}
      {match.status === "upcoming" && user && (
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            variant="default"
            className="flex-1 bg-black text-white hover:bg-black/90"
            onClick={handleSaveBet}
            disabled={isSaving || matchStarted}
          >
            {matchStarted ? "Приём ставок закрыт" : (isSaving ? "Сохранение..." : (hasBetForMatch(match.id) ? "Изменить ставку" : "Сделать ставку"))}
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

      {/* When bet is calculated, show points line at bottom with pluralization; replaces 'Матч закончен' */}
      {existingBet && existingBet.is_calculated && (
        <div className="pt-4 border-t border-border">
          {(() => {
            const pts = existingBet.points_earned || 0;
            // Russian pluralization for очко/очка/очков (simple version)
            const mod10 = Math.abs(pts) % 10;
            const mod100 = Math.abs(pts) % 100;
            let word = 'очков';
            if (mod10 === 1 && mod100 !== 11) word = 'очко';
            else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = 'очка';
            return (
              <p className="text-center text-sm text-muted-foreground">{pts > 0 ? `+${pts}` : `${pts}`} {word}</p>
            );
          })()}
        </div>
      )}
    </Card>
  );
};

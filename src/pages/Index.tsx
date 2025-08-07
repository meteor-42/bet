import { Header } from "@/components/Header";
import { MatchSlider } from "@/components/MatchSlider";
import { Leaderboard } from "@/components/Leaderboard";
import { StatsCard } from "@/components/StatsCard";
import { GameRules } from "@/components/GameRules";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMatches } from "@/hooks/useMatches";

const Index = () => {
  const { matches, loading } = useMatches();

  // Преобразуем данные из базы в формат для компонентов
  const formattedMatches = matches.map(match => ({
    id: match.id,
    homeTeam: match.home_team,
    awayTeam: match.away_team,
    date: match.match_date,
    time: match.match_time,
    league: match.league,
    stage: match.stage,
    status: match.status
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-medium text-foreground">
              Футбольные прогнозы
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Делайте прогнозы и соревнуйтесь с другими игроками
            </p>
          </div>

          {/* Navigation */}
          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto h-10">
              <TabsTrigger value="matches" className="text-sm">Матчи</TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-sm">Рейтинг</TabsTrigger>
              <TabsTrigger value="stats" className="text-sm">Статистика</TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="space-y-8 mt-12">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Загрузка матчей...</p>
                </div>
              ) : (
              <div className="max-w-md mx-auto">
                <MatchSlider matches={formattedMatches} />
              </div>
              )}
              <GameRules />
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-12">
              <div className="max-w-2xl mx-auto">
                <Leaderboard />
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-12">
              <div className="max-w-md mx-auto">
                <StatsCard />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;

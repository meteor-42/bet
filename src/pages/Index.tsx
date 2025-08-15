import { Header } from "@/components/Header";
import { MatchSlider } from "@/components/MatchSlider";
import { Leaderboard } from "@/components/Leaderboard";
import { StatsCard } from "@/components/StatsCard";
import { MyBets } from "@/components/MyBets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveMatches } from "@/hooks/useActiveMatches";
import { Trophy, MessageCircle, Goal } from "lucide-react";

const Index = () => {
  const { matches, loading } = useActiveMatches();

  // Используем данные из базы напрямую
  const formattedMatches = matches;

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
            <p className="text-muted-foreground max-w-lg mx-auto flex flex-col items-center gap-2 hidden sm:flex">
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                3 очка за точный счет
                <span className="opacity-50">•</span>
                <Goal className="w-4 h-4" />
                1 очко за точный результат
              </span>
            </p>
          </div>

          {/* Navigation */}
          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto h-10">
              <TabsTrigger value="matches" className="text-sm">Матчи</TabsTrigger>
              <TabsTrigger value="bets" className="text-sm">Ставки</TabsTrigger>
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
            </TabsContent>

            <TabsContent value="bets" className="mt-12">
              <div className="max-w-4xl mx-auto">
                <MyBets />
              </div>
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

import { Header } from "@/components/Header";
import { MatchSlider } from "@/components/MatchSlider";
import { Leaderboard } from "@/components/Leaderboard";
import { StatsCard } from "@/components/StatsCard";
import { GameRules } from "@/components/GameRules";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  // Mock data for matches
  const mockMatches = [
    {
      id: "1",
      homeTeam: "CSKA",
      awayTeam: "Spartak",
      date: "15/04/2025",
      time: "21:00 МСК",
      league: "RPL",
      stage: "Matchday 3",
      status: "finished" as const
    },
    {
      id: "2", 
      homeTeam: "Baltika",
      awayTeam: "Pari NN",
      date: "15/04/2025",
      time: "00:00 МСК",
      league: "RPL",
      stage: "1/4 Final",
      status: "finished" as const
    },
    {
      id: "3",
      homeTeam: "PSG",
      awayTeam: "Marseille",
      date: "15/04/2025",
      time: "23:00 МСК",
      league: "Ligue 1",
      stage: "Round 15",
      status: "live" as const
    },
    {
      id: "4",
      homeTeam: "Bayern Munich",
      awayTeam: "Werder",
      date: "15/04/2025",
      time: "19:30 МСК",
      league: "Bundesliga",
      stage: "Der Klassiker",
      status: "upcoming" as const
    }
  ];

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
              <div className="max-w-md mx-auto">
                <MatchSlider matches={mockMatches} />
              </div>
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

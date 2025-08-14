import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Filter, ArrowLeft } from "lucide-react";
import { useAllBets } from "@/hooks/useAllBets";
import { useBets } from "@/hooks/useBets";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const AllBets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const betsPerPage = 15;

  // Получаем текущий таб из URL или устанавливаем по умолчанию
  const currentTab = searchParams.get('tab') || 'all';

  // Получаем все ставки и личные ставки
  const { allBets, isLoading: allBetsLoading } = useAllBets();
  const { bets: myBets, isLoading: myBetsLoading } = useBets(user?.id);

  // Фильтрация ставок
  const filteredBets = allBets.filter(bet => {
    const playerMatch = !selectedPlayer || bet.player_id === selectedPlayer;
    const searchMatch = !searchTerm ||
      bet.match.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.match.away_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.player.name.toLowerCase().includes(searchTerm.toLowerCase());
    return playerMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredBets.length / betsPerPage);
  const startIndex = (currentPage - 1) * betsPerPage;
  const currentBets = filteredBets.slice(startIndex, startIndex + betsPerPage);

  // Получить уникальных игроков
  const uniquePlayers = Array.from(
    new Map(allBets.map(bet => [bet.player.id, bet.player])).values()
  );

  const getStatusText = (bet: typeof allBets[0]) => {
    if (!bet.is_calculated) return "Ожидание";
    if ((bet.points_earned || 0) === 3) return "Точный счет";
    if ((bet.points_earned || 0) === 1) return "Исход";
    return "Промах";
  };

  const getStatusVariant = (bet: typeof allBets[0]) => {
    if (!bet.is_calculated) return "secondary";
    if ((bet.points_earned || 0) > 0) return "default";
    return "outline";
  };

  const resetFilters = () => {
    setSelectedPlayer("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const renderBetsList = (bets: typeof allBets | typeof myBets, showPlayer = true) => {
    if (bets.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Ставки не найдены</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {bets.map((bet, idx) => (
          <Card key={bet.id} className="p-4 sm:p-6 border border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded bg-muted flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                  #{startIndex + idx + 1}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {bet.match.match_date} • {bet.match.match_time} (МСК)
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-foreground">
                    {bet.match.home_team} <span className="text-muted-foreground">vs</span> {bet.match.away_team}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {bet.match.league}{typeof bet.match.tour === 'number' ? ` • ${bet.match.tour} ТУР` : ''}
                    {showPlayer && 'player' in bet && (
                      <span className="ml-2 font-medium text-foreground">• {bet.player.name}</span>
                    )}
                  </div>
                </div>
              </div>
              <Badge variant={getStatusVariant(bet)} className="px-2.5 py-1 text-xs sm:text-sm">
                {bet.is_calculated ? `ОЧКИ: ${(bet.points_earned || 0) > 0 ? "+" : ""}${bet.points_earned || 0}` : getStatusText(bet)}
              </Badge>
            </div>

            <Separator className="my-3" />

            <div className="grid grid-cols-2 gap-3 sm:gap-6 items-stretch">
              <div className="text-center p-3 sm:p-4 border border-border rounded">
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Прогноз{showPlayer && 'player' in bet ? ` (${bet.player.name})` : ''}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {bet.predicted_home_score}-{bet.predicted_away_score}
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 border border-border rounded">
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mb-1">Результат</div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {bet.match.status === 'finished' && bet.match.home_score !== null && bet.match.away_score !== null
                    ? `${bet.match.home_score}-${bet.match.away_score}`
                    : '—'}
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <Badge variant={
                bet.match.status === 'finished' ? 'default' :
                bet.match.status === 'live' ? 'destructive' : 'secondary'
              }>
                {bet.match.status === 'finished' ? 'Завершен' : bet.match.status === 'live' ? 'Идет' : 'Ожидается'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            На главную
          </Button>

          <h1 className="text-2xl font-bold text-foreground mb-2">Все ставки</h1>
          <p className="text-muted-foreground">Просмотр всех ставок и личной статистики</p>
        </div>

        <Tabs value={currentTab} onValueChange={(value) => navigate(`/bets?tab=${value}`)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Все ставки</TabsTrigger>
            <TabsTrigger value="my">Мои ставки</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Фильтры для всех ставок */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по командам или игроку..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Выберите игрока" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Все игроки</SelectItem>
                      {uniquePlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(selectedPlayer || searchTerm) && (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Сбросить
                  </Button>
                )}
              </div>
            </Card>

            {/* Статистика */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{filteredBets.length}</div>
                <div className="text-sm text-muted-foreground">Всего ставок</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{uniquePlayers.length}</div>
                <div className="text-sm text-muted-foreground">Игроков</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {filteredBets.filter(bet => bet.is_calculated).length}
                </div>
                <div className="text-sm text-muted-foreground">Рассчитано</div>
              </Card>
            </div>

            {/* Список всех ставок */}
            {allBetsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2 text-muted-foreground">Загрузка ставок...</span>
              </div>
            ) : (
              <>
                {renderBetsList(currentBets, true)}

                {/* Пагинация */}
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="my" className="space-y-6">
            {/* Личная статистика */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{myBets.length}</div>
                <div className="text-sm text-muted-foreground">Моих ставок</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {myBets.filter(bet => bet.is_calculated).reduce((sum, bet) => sum + (bet.points_earned || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Всего очков</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {myBets.filter(bet => bet.is_calculated).length}
                </div>
                <div className="text-sm text-muted-foreground">Рассчитано</div>
              </Card>
            </div>

            {/* Мои ставки */}
            {myBetsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2 text-muted-foreground">Загрузка ставок...</span>
              </div>
            ) : (
              renderBetsList(myBets, false)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

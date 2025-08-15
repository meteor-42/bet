import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useBets } from "@/hooks/useBets";
import { useAllBets } from "@/hooks/useAllBets";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Search, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const MyBets = () => {
  const { user } = useAuth();
  const { bets: myBets, isLoading: myBetsLoading } = useBets(user?.id);
  const { allBets, isLoading: allBetsLoading } = useAllBets();

  const [currentTab, setCurrentTab] = useState("my");
  const [currentPage, setCurrentPage] = useState(1);
  const [allBetsCurrentPage, setAllBetsCurrentPage] = useState(1);
  const [selectedTour, setSelectedTour] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const betsPerPage = 7; // Изменено с 10 на 7

  // Фильтрация всех ставок
  const filteredAllBets = allBets.filter(bet => {
    const tourMatch = selectedTour === "all" || bet.match.tour?.toString() === selectedTour;
    const searchMatch = !searchTerm ||
      bet.match.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.match.away_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.player.name.toLowerCase().includes(searchTerm.toLowerCase());
    return tourMatch && searchMatch;
  });

  // Получить уникальные туры
  const uniqueTours = Array.from(
    new Set(allBets.map(bet => bet.match.tour).filter(tour => tour !== null && tour !== undefined))
  ).sort((a, b) => a - b);

  // Пагинация для моих ставок
  const myBetsTotalPages = Math.ceil(myBets.length / betsPerPage);
  const myBetsStartIndex = (currentPage - 1) * betsPerPage;
  const currentMyBets = myBets.slice(myBetsStartIndex, myBetsStartIndex + betsPerPage);

  // Пагинация для всех ставок
  const allBetsTotalPages = Math.ceil(filteredAllBets.length / betsPerPage);
  const allBetsStartIndex = (allBetsCurrentPage - 1) * betsPerPage;
  const currentAllBets = filteredAllBets.slice(allBetsStartIndex, allBetsStartIndex + betsPerPage);

  const totalPoints = myBets
    .filter(bet => bet.is_calculated)
    .reduce((sum, bet) => sum + (bet.points_earned || 0), 0);

  const getStatusText = (bet: typeof myBets[0]) => {
    if (!bet.is_calculated) return "Ожидает";
    if ((bet.points_earned || 0) === 3) return "Точный счет";
    if ((bet.points_earned || 0) === 1) return "Исход";
    return "Промах";
  };

  const formatTime = (time: string) => {
    // Убираем секунды из времени, оставляем только HH:MM
    return time.split(':').slice(0, 2).join(':');
  };

  const formatPlayerName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      // Если в базе "Фамилия Имя" -> "Фамилия И."
      const lastName = parts[0]; // Фамилия
      const firstName = parts[1]; // Имя
      return `${lastName} ${firstName.charAt(0).toUpperCase()}.`;
    }
    return name;
  };

  const getStatusVariant = (bet: typeof myBets[0]) => {
    if (!bet.is_calculated) return "secondary";
    if ((bet.points_earned || 0) > 0) return "default";
    return "outline";
  };

  const resetFilters = () => {
    setSelectedTour("all");
    setSearchTerm("");
    setAllBetsCurrentPage(1);
  };

  const renderCompactBetsList = (bets: typeof myBets | typeof allBets, showPlayer = false, currentPageNum = 1, indexOffset = 0) => {
    if (bets.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {showPlayer ? "Ставки не найдены" : "У вас пока нет ставок"}
          </p>
          {!showPlayer && (
            <p className="text-sm text-muted-foreground mt-2">Сделайте ставку на предстоящий матч!</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {bets.map((bet, idx) => (
          <Card key={bet.id} className="p-3 border border-border hover:bg-muted/20 hover:shadow-sm transition-all duration-200 cursor-pointer">
            {/* Desktop view - compact one line with all info */}
            <div className="hidden sm:flex items-center gap-2 min-h-[2rem]">
              <Badge variant="secondary" className="h-7 px-2 flex items-center justify-center font-mono text-xs min-w-[2.5rem] rounded-none border-0">
                #{indexOffset + idx + 1}
              </Badge>

              {bet.match.tour && (
                <Badge variant="secondary" className="h-7 px-2 flex items-center justify-center text-xs rounded-none">
                  Тур {bet.match.tour}
                </Badge>
              )}

              <Badge variant="secondary" className="h-7 px-2 flex items-center justify-center text-xs whitespace-nowrap rounded-none">
                {bet.match.match_date} {formatTime(bet.match.match_time)}
              </Badge>

              <div className="flex items-center text-xs font-medium min-w-[200px] max-w-[250px]">
                <span className="truncate">{bet.match.home_team}</span>
                <span className="mx-1">-</span>
                <span className="truncate">{bet.match.away_team}</span>
              </div>

              <Badge variant="outline" className="h-7 px-2 flex items-center justify-center text-xs rounded-none">
                {bet.predicted_home_score}:{bet.predicted_away_score}
              </Badge>

              {bet.match.status === 'finished' && bet.match.home_score !== null && bet.match.away_score !== null && (
                <Badge variant="default" className="h-7 px-2 flex items-center justify-center text-xs rounded-none">
                  {bet.match.home_score}:{bet.match.away_score}
                </Badge>
              )}

              {showPlayer && 'player' in bet && (
                <Badge variant="outline" className="h-7 px-2 flex items-center justify-center text-xs max-w-[120px] truncate rounded-none">
                  {formatPlayerName(bet.player.name)}
                </Badge>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <Badge variant={
                  bet.match.status === 'finished' ? 'default' :
                  bet.match.status === 'live' ? 'destructive' : 'secondary'
                } className="h-7 px-2 flex items-center justify-center text-xs rounded-none">
                  {bet.match.status === 'finished' ? 'Завершен' : bet.match.status === 'live' ? 'Идет' : 'Не начат'}
                </Badge>
                <Badge variant={getStatusVariant(bet)} className="h-7 px-2 flex items-center justify-center text-xs min-w-[3rem] rounded-none">
                  {bet.is_calculated ? `${(bet.points_earned || 0) > 0 ? "+" : ""}${bet.points_earned || 0}` : getStatusText(bet)}
                </Badge>
              </div>
            </div>

            {/* Mobile view - compact column layout */}
            <div className="sm:hidden space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-6 px-2 flex items-center justify-center font-mono text-xs rounded-none">
                    #{indexOffset + idx + 1}
                  </Badge>
                  {bet.match.tour && (
                    <Badge variant="secondary" className="h-6 px-2 flex items-center justify-center text-xs rounded-none">
                      Тур {bet.match.tour}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="h-6 px-2 flex items-center justify-center text-xs rounded-none">
                    {bet.match.match_date} {formatTime(bet.match.match_time)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="font-medium flex items-center">
                  <span className="truncate max-w-[100px]">{bet.match.home_team}</span>
                  <span className="mx-1">-</span>
                  <span className="truncate max-w-[100px]">{bet.match.away_team}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-6 px-2 flex items-center justify-center text-xs rounded-none">
                    {bet.predicted_home_score}:{bet.predicted_away_score}
                  </Badge>
                  {bet.match.status === 'finished' && bet.match.home_score !== null && bet.match.away_score !== null && (
                    <Badge variant="default" className="h-6 px-2 flex items-center justify-center text-xs rounded-none">
                      {bet.match.home_score}:{bet.match.away_score}
                    </Badge>
                  )}
                </div>
              </div>

              {showPlayer && 'player' in bet && (
                <Badge variant="outline" className="h-6 px-2 flex items-center justify-center text-xs w-full rounded-none">
                  {formatPlayerName(bet.player.name)}
                </Badge>
              )}

              <div className="flex items-center gap-2">
                <Badge variant={
                  bet.match.status === 'finished' ? 'default' :
                  bet.match.status === 'live' ? 'destructive' : 'secondary'
                } className="h-6 px-2 flex items-center justify-center text-xs rounded-none">
                  {bet.match.status === 'finished' ? 'Завершен' : bet.match.status === 'live' ? 'Идет' : 'Не начат'}
                </Badge>
                <Badge variant={getStatusVariant(bet)} className="h-6 px-2 flex items-center justify-center text-xs rounded-none">
                  {bet.is_calculated ? `${(bet.points_earned || 0) > 0 ? "+" : ""}${bet.points_earned || 0}` : getStatusText(bet)}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my">Мои ставки</TabsTrigger>
          <TabsTrigger value="all">Все ставки</TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-6">
          {/* Header summary для моих ставок */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-medium text-foreground">Мои ставки</h3>
              <p className="text-sm text-muted-foreground">Всего: {myBets.length} • Рассчитано: {myBets.filter(b => b.is_calculated).length}</p>
            </div>
            <div className="text-sm text-muted-foreground">Очки всего: <span className="font-medium text-foreground">{totalPoints}</span></div>
          </div>

          {myBetsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2 text-muted-foreground">Загрузка ставок...</span>
            </div>
          ) : (
            <>
              {renderCompactBetsList(currentMyBets, false, currentPage, myBetsStartIndex)}

              {/* Пагинация для моих ставок */}
              {myBetsTotalPages > 1 && (
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

                    {Array.from({ length: myBetsTotalPages }, (_, i) => i + 1).map((page) => (
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
                          if (currentPage < myBetsTotalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === myBetsTotalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </TabsContent>

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
                <Select value={selectedTour} onValueChange={setSelectedTour}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Выберите тур" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все туры</SelectItem>
                    {uniqueTours.map((tour) => (
                      <SelectItem key={tour} value={tour.toString()}>
                        Тур {tour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(selectedTour !== "all" || searchTerm) && (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Сбросить
                </Button>
              )}
            </div>
          </Card>

          {/* Статистика для всех ставок */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{filteredAllBets.length}</div>
              <div className="text-sm text-muted-foreground">Всего ставок</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {Array.from(
                  new Map(allBets.map(bet => [bet.player.id, bet.player])).values()
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">Игроков</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {filteredAllBets.filter(bet => bet.is_calculated).length}
              </div>
              <div className="text-sm text-muted-foreground">Рассчитано</div>
            </Card>
          </div>

          {allBetsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2 text-muted-foreground">Загрузка ставок...</span>
            </div>
          ) : (
            <>
              {renderCompactBetsList(currentAllBets, true, allBetsCurrentPage, allBetsStartIndex)}

              {/* Пагинация для всех ставок */}
              {allBetsTotalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (allBetsCurrentPage > 1) setAllBetsCurrentPage(allBetsCurrentPage - 1);
                        }}
                        className={allBetsCurrentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {Array.from({ length: allBetsTotalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setAllBetsCurrentPage(page);
                          }}
                          isActive={allBetsCurrentPage === page}
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
                          if (allBetsCurrentPage < allBetsTotalPages) setAllBetsCurrentPage(allBetsCurrentPage + 1);
                        }}
                        className={allBetsCurrentPage === allBetsTotalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

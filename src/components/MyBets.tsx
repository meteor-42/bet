import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const MyBets = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const betsPerPage = 3;
  
  const mockBets = [
    {
      id: "1",
      match: "Manchester City vs Liverpool",
      date: "15 дек",
      time: "21:00 МСК",
      league: "Premier League",
      prediction: "2-1",
      actualScore: "2-1",
      points: 3,
      status: "won"
    },
    {
      id: "2",
      match: "Barcelona vs Real Madrid",
      date: "16 дек",
      time: "00:00 МСК",
      league: "La Liga",
      prediction: "1-0",
      actualScore: "0-1",
      points: 1,
      status: "partial"
    },
    {
      id: "3",
      match: "PSG vs Marseille",
      date: "14 дек",
      time: "23:00 МСК",
      league: "Ligue 1",
      prediction: "3-0",
      actualScore: "1-2",
      points: 0,
      status: "lost"
    },
    {
      id: "4",
      match: "Bayern Munich vs Bochum",
      date: "17 дек",
      time: "19:30 МСК",
      league: "Bundesliga",
      prediction: "2-0",
      actualScore: "2-0",
      points: 3,
      status: "won"
    },
    {
      id: "5",
      match: "Arsenal vs Chelsea",
      date: "18 дек",
      time: "22:00 МСК",
      league: "Premier League",
      prediction: "1-1",
      actualScore: "1-1",
      points: 3,
      status: "won"
    },
    {
      id: "6",
      match: "Inter vs Milan",
      date: "19 дек",
      time: "20:45 МСК",
      league: "Serie A",
      prediction: "0-2",
      actualScore: "1-0",
      points: 0,
      status: "lost"
    }
  ];

  const totalPoints = mockBets.reduce((sum, bet) => sum + bet.points, 0);
  const totalPages = Math.ceil(mockBets.length / betsPerPage);
  const startIndex = (currentPage - 1) * betsPerPage;
  const currentBets = mockBets.slice(startIndex, startIndex + betsPerPage);

  return (
    <div className="space-y-6">
      <div className="text-center pb-4 border-b border-border">
        <p className="text-lg text-muted-foreground">Всего очков: <span className="font-medium text-foreground">{totalPoints}</span></p>
      </div>

      <div className="space-y-4">
        {currentBets.map((bet) => (
          <Card key={bet.id} className="p-6 border border-border hover:shadow-md transition-shadow">
            <div className="space-y-4">
              {/* Header with date/time and points badge */}
              <div className="flex items-start justify-between">
                <div className="text-sm text-muted-foreground font-medium">
                  {bet.date} • {bet.time}
                </div>
                <Badge
                  variant={bet.status === "won" ? "default" : bet.status === "partial" ? "secondary" : "outline"}
                  className="text-sm px-3 py-1"
                >
                  {bet.points > 0 && "+"}{bet.points}
                </Badge>
              </div>

              {/* Team names */}
              <div className="text-center">
                <h3 className="font-semibold text-foreground text-lg mb-1">
                  {bet.match}
                </h3>
                <p className="text-sm text-muted-foreground">{bet.league}</p>
              </div>

              {/* Prediction vs Result */}
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Мой прогноз
                  </div>
                  <div className="text-2xl font-bold text-foreground bg-muted/50 rounded-lg px-4 py-2 min-w-[80px]">
                    {bet.prediction}
                  </div>
                </div>

                <div className="text-muted-foreground text-lg font-medium">
                  vs
                </div>

                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Результат
                  </div>
                  <div className="text-2xl font-bold text-foreground bg-muted rounded-lg px-4 py-2 min-w-[80px]">
                    {bet.actualScore}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
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
    </div>
  );
};

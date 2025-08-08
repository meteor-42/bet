import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit2, Save, X } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { type Match, type CreateMatchData } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/PaginationControls";

export const AdminPanel = () => {
  const { matches, loading, createMatch, updateMatch, deleteMatch } = useMatches();
  const { leaderboard, loading: leaderboardLoading, createPlayer, updatePlayer, deletePlayer } = useLeaderboard();

  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);

  // Пагинация для матчей
  const matchesPagination = usePagination({
    totalItems: matches.length,
    itemsPerPage: 5,
    initialPage: 1
  });

  // Пагинация для игроков
  const playersPagination = usePagination({
    totalItems: leaderboard.length,
    itemsPerPage: 8,
    initialPage: 1
  });
  const [newMatch, setNewMatch] = useState<CreateMatchData>({
    home_team: "",
    away_team: "",
    match_date: "",
    match_time: "",
    league: "",
    stage: "",
    status: "upcoming"
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    email: "",
    password: "",
    role: "player" as "admin" | "player",
    points: 0,
    correct_predictions: 0,
    total_predictions: 0
  });

  const handleEditMatch = (matchId: string) => {
    setEditingMatch(matchId);
  };

  const handleSaveMatch = async (matchId: string, updatedMatch: Partial<Match>) => {
    const success = await updateMatch({ id: matchId, ...updatedMatch });
    if (success) {
      setEditingMatch(null);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    await deleteMatch(matchId);
  };

  const handleAddMatch = async () => {
    if (!newMatch.home_team || !newMatch.away_team || !newMatch.match_date || !newMatch.match_time) {
      return;
    }

    const success = await createMatch(newMatch);
    if (success) {
      setNewMatch({
        home_team: "",
        away_team: "",
        match_date: "",
        match_time: "",
        league: "",
        stage: "",
        status: "upcoming"
      });
      setShowAddForm(false);
    }
  };

  const handleEditPlayer = (playerId: string) => {
    setEditingPlayer(playerId);
  };

  const handleSavePlayer = async (playerId: string, updatedData: any) => {
    const success = await updatePlayer({ id: playerId, ...updatedData });
    if (success) {
      setEditingPlayer(null);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    await deletePlayer(playerId);
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.name || !newPlayer.password) {
      return;
    }

    const success = await createPlayer(newPlayer);
    if (success) {
      setNewPlayer({
        name: "",
        email: "",
        password: "",
        points: 0,
        correct_predictions: 0,
        total_predictions: 0
      });
      setShowAddPlayerForm(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "live":
        return "default";
      case "finished":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "live":
        return "LIVE";
      case "upcoming":
        return "ПРЕДСТОЯЩИЙ";
      case "finished":
        return "ЗАВЕРШЕН";
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      {(loading || leaderboardLoading) && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      )}

      <div>
        <h2 className="text-xl font-medium text-foreground">Админ-панель</h2>
        <p className="text-sm text-muted-foreground">Управление матчами и игроками</p>
      </div>

      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="matches">Матчи</TabsTrigger>
          <TabsTrigger value="players">Игроки</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-lg font-medium text-foreground">Управление матчами</h3>
            <p className="text-sm text-muted-foreground">Создание и редактирование матчей</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Добавить матч
        </Button>
      </div>

      {/* Add New Match Form */}
      {showAddForm && (
        <Card className="p-6 border border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Новый матч</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="homeTeam">Домашняя команда *</Label>
                <Input
                  id="homeTeam"
                  value={newMatch.home_team || ""}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, home_team: e.target.value }))}
                  placeholder="Название команды"
                />
              </div>
              <div>
                <Label htmlFor="awayTeam">Гостевая команда *</Label>
                <Input
                  id="awayTeam"
                  value={newMatch.away_team || ""}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, away_team: e.target.value }))}
                  placeholder="Название команды"
                />
              </div>
              <div>
                <Label htmlFor="date">Дата *</Label>
                <Input
                  id="date"
                  value={newMatch.match_date || ""}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, match_date: e.target.value }))}
                  placeholder="15 дек"
                />
              </div>
              <div>
                <Label htmlFor="time">Время *</Label>
                <Input
                  id="time"
                  value={newMatch.match_time || ""}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, match_time: e.target.value }))}
                  placeholder="21:00 МСК"
                />
              </div>
              <div>
                <Label htmlFor="league">Лига</Label>
                <Input
                  id="league"
                  value={newMatch.league || ""}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, league: e.target.value }))}
                  placeholder="RPL, Premier League..."
                />
              </div>
              <div>
                <Label htmlFor="stage">Этап</Label>
                <Input
                  id="stage"
                  value={newMatch.stage || ""}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, stage: e.target.value }))}
                  placeholder="Matchday 3, 1/4 Final..."
                />
              </div>
              <div>
                <Label htmlFor="status">Статус</Label>
                <Select value={newMatch.status} onValueChange={(value) => setNewMatch(prev => ({ ...prev, status: value as any }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Предстоящий</SelectItem>
                    <SelectItem value="live">В прямом эфире</SelectItem>
                    <SelectItem value="finished">Завершен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddMatch}>Создать матч</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Отмена</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Matches List */}
      <div className="space-y-4">
        {matches
          .slice(matchesPagination.startIndex, matchesPagination.endIndex)
          .map((match) => (
            <MatchEditCard
              key={match.id}
              match={match}
              isEditing={editingMatch === match.id}
              onEdit={() => handleEditMatch(match.id)}
              onSave={(updatedMatch) => handleSaveMatch(match.id, updatedMatch)}
              onCancel={() => setEditingMatch(null)}
              onDelete={() => handleDeleteMatch(match.id)}
              getStatusBadgeVariant={getStatusBadgeVariant}
              getStatusText={getStatusText}
            />
          ))}
      </div>

      {/* Matches Pagination */}
      <PaginationControls
        currentPage={matchesPagination.currentPage}
        totalPages={matchesPagination.totalPages}
        totalItems={matchesPagination.totalItems}
        itemsPerPage={matchesPagination.itemsPerPage}
        pageNumbers={matchesPagination.pageNumbers}
        canGoToNext={matchesPagination.canGoToNext}
        canGoToPrevious={matchesPagination.canGoToPrevious}
        onPageChange={matchesPagination.goToPage}
        onNextPage={matchesPagination.goToNextPage}
        onPreviousPage={matchesPagination.goToPreviousPage}
      />
        </TabsContent>

        <TabsContent value="players" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-foreground">Управление игроками</h3>
              <p className="text-sm text-muted-foreground">Создание и редактирование игроков</p>
            </div>
            <Button onClick={() => setShowAddPlayerForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Добавить игрока
            </Button>
          </div>

          {/* Add New Player Form */}
          {showAddPlayerForm && (
            <Card className="p-6 border border-border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Новый игрок</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddPlayerForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="playerName">Имя игрока *</Label>
                    <Input
                      id="playerName"
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Имя игрока"
                    />
                  </div>
                  <div>
                    <Label htmlFor="playerEmail">Email</Label>
                    <Input
                      id="playerEmail"
                      type="email"
                      value={newPlayer.email}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="playerPassword">Пароль *</Label>
                    <Input
                      id="playerPassword"
                      type="password"
                      value={newPlayer.password}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Пароль игрока"
                    />
                  </div>
                  <div>
                    <Label htmlFor="playerPoints">Очки</Label>
                    <Input
                      id="playerPoints"
                      type="number"
                      value={newPlayer.points}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="playerCorrect">Верные прогнозы</Label>
                    <Input
                      id="playerCorrect"
                      type="number"
                      value={newPlayer.correct_predictions}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, correct_predictions: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="playerTotal">Всего прогнозов</Label>
                    <Input
                      id="playerTotal"
                      type="number"
                      value={newPlayer.total_predictions}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, total_predictions: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddPlayer}>Создать игрока</Button>
                  <Button variant="outline" onClick={() => setShowAddPlayerForm(false)}>Отмена</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Players List */}
          <div className="space-y-4">
            {leaderboard
              .slice(playersPagination.startIndex, playersPagination.endIndex)
              .map((entry) => (
                <PlayerEditCard
                  key={entry.player.id}
                  entry={entry}
                  isEditing={editingPlayer === entry.player.id}
                  onEdit={() => handleEditPlayer(entry.player.id)}
                  onSave={(updatedStats) => handleSavePlayer(entry.player.id, updatedStats)}
                  onCancel={() => setEditingPlayer(null)}
                  onDelete={() => handleDeletePlayer(entry.player.id)}
                />
              ))}
          </div>

          {/* Players Pagination */}
          <PaginationControls
            currentPage={playersPagination.currentPage}
            totalPages={playersPagination.totalPages}
            totalItems={playersPagination.totalItems}
            itemsPerPage={playersPagination.itemsPerPage}
            pageNumbers={playersPagination.pageNumbers}
            canGoToNext={playersPagination.canGoToNext}
            canGoToPrevious={playersPagination.canGoToPrevious}
            onPageChange={playersPagination.goToPage}
            onNextPage={playersPagination.goToNextPage}
            onPreviousPage={playersPagination.goToPreviousPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface MatchEditCardProps {
  match: Match;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (match: Partial<Match>) => void;
  onCancel: () => void;
  onDelete: () => void;
  getStatusBadgeVariant: (status: string) => any;
  getStatusText: (status: string) => string;
}

const MatchEditCard = ({
  match,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  getStatusBadgeVariant,
  getStatusText
}: MatchEditCardProps) => {
  const [editData, setEditData] = useState<Partial<Match>>(match);

  const handleSave = () => {
    onSave(editData);
  };

  if (isEditing) {
    return (
      <Card className="p-6 border border-border">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Редактирование матча</h3>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Домашняя команда</Label>
              <Input
                value={editData.home_team || ""}
                onChange={(e) => setEditData(prev => ({ ...prev, home_team: e.target.value }))}
              />
            </div>
            <div>
              <Label>Гостевая команда</Label>
              <Input
                value={editData.away_team || ""}
                onChange={(e) => setEditData(prev => ({ ...prev, away_team: e.target.value }))}
              />
            </div>
            <div>
              <Label>Дата</Label>
              <Input
                value={editData.match_date || ""}
                onChange={(e) => setEditData(prev => ({ ...prev, match_date: e.target.value }))}
              />
            </div>
            <div>
              <Label>Время</Label>
              <Input
                value={editData.match_time || ""}
                onChange={(e) => setEditData(prev => ({ ...prev, match_time: e.target.value }))}
              />
            </div>
            <div>
              <Label>Лига</Label>
              <Input
                value={editData.league || ""}
                onChange={(e) => setEditData(prev => ({ ...prev, league: e.target.value }))}
              />
            </div>
            <div>
              <Label>Этап</Label>
              <Input
                value={editData.stage || ""}
                onChange={(e) => setEditData(prev => ({ ...prev, stage: e.target.value }))}
              />
            </div>
            <div>
              <Label>Статус</Label>
              <Select value={editData.status} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Предстоящий</SelectItem>
                  <SelectItem value="live">В прямом эфире</SelectItem>
                  <SelectItem value="finished">Завершен</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-border hover:shadow-hover transition-shadow">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-foreground">
              {match.home_team} vs {match.away_team}
            </h3>
            <Badge variant={getStatusBadgeVariant(match.status)}>
              {getStatusText(match.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{match.match_date} • {match.match_time}</span>
            <span>{match.league}</span>
            <span>{match.stage}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

interface PlayerEditCardProps {
  entry: any;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (stats: any) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const PlayerEditCard = ({
  entry,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete
}: PlayerEditCardProps) => {
  const [editData, setEditData] = useState({
    name: entry.player.name,
    email: entry.player.email || "",
    password: "",
    points: entry.player.points,
    correct_predictions: entry.player.correct_predictions,
    total_predictions: entry.player.total_predictions
  });

  const handleSave = () => {
    // Исключаем пустой пароль из обновления
    const dataToSave = { ...editData };
    if (!dataToSave.password) {
      delete dataToSave.password;
    }
    onSave(dataToSave);
  };

  if (isEditing) {
    return (
      <Card className="p-6 border border-border">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Редактирование: {entry.player.name}</h3>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Имя игрока</Label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label>Новый пароль (оставьте пустым, чтобы не менять)</Label>
              <Input
                type="password"
                value={editData.password}
                onChange={(e) => setEditData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Оставьте пустым для сохранения текущего"
              />
            </div>
            <div>
              <Label>Очки</Label>
              <Input
                type="number"
                value={editData.points}
                onChange={(e) => setEditData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label>Верные прогнозы</Label>
              <Input
                type="number"
                value={editData.correct_predictions}
                onChange={(e) => setEditData(prev => ({ ...prev, correct_predictions: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label>Всего прогнозов</Label>
              <Input
                type="number"
                value={editData.total_predictions}
                onChange={(e) => setEditData(prev => ({ ...prev, total_predictions: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-border hover:shadow-hover transition-shadow">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-foreground">
              #{entry.player.rank_position} {entry.player.name}
            </h3>
            <Badge variant="secondary">
              {entry.player.points} очков
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{entry.player.correct_predictions}/{entry.player.total_predictions} верных</span>
            <span>{entry.accuracy}% точность</span>
            <span>{entry.player.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

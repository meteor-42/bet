import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit2, Save, X } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { type Player } from "@/lib/supabase";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/PaginationControls";

interface LeaderboardEntry {
  player: Player & { id: string; rank_position: number };
  accuracy: number;
}

export default function PlayersAdmin() {
  const { leaderboard, loading, createPlayer, updatePlayer, deletePlayer } = useLeaderboard();

  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);

  const playersPagination = usePagination({
    totalItems: leaderboard.length,
    itemsPerPage: 10,
    initialPage: 1,
  });

  const [showAddPlayerForm, setShowAddPlayerForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    email: "",
    password: "",
    role: "player" as "admin" | "player",
    points: 0,
    correct_predictions: 0,
    total_predictions: 0,
  });

  const handleEditPlayer = (playerId: string) => {
    setEditingPlayer(playerId);
  };

  const handleSavePlayer = async (playerId: string, updatedData: Partial<Player>) => {
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
        role: "player",
        points: 0,
        correct_predictions: 0,
        total_predictions: 0,
      });
      setShowAddPlayerForm(false);
    }
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      )}

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
                <Input id="playerName" value={newPlayer.name} onChange={(e) => setNewPlayer((prev) => ({ ...prev, name: e.target.value }))} placeholder="Имя игрока" />
              </div>
              <div>
                <Label htmlFor="playerEmail">Email</Label>
                <Input id="playerEmail" type="email" value={newPlayer.email} onChange={(e) => setNewPlayer((prev) => ({ ...prev, email: e.target.value }))} placeholder="email@example.com" />
              </div>
              <div>
                <Label htmlFor="playerPassword">Пароль *</Label>
                <Input id="playerPassword" type="password" value={newPlayer.password} onChange={(e) => setNewPlayer((prev) => ({ ...prev, password: e.target.value }))} placeholder="Пароль игрока" />
              </div>
              <div>
                <Label htmlFor="playerPoints">Очки</Label>
                <Input id="playerPoints" type="number" value={newPlayer.points} onChange={(e) => setNewPlayer((prev) => ({ ...prev, points: parseInt(e.target.value) || 0 }))} placeholder="0" />
              </div>
              <div>
                <Label htmlFor="playerCorrect">Верные прогнозы</Label>
                <Input id="playerCorrect" type="number" value={newPlayer.correct_predictions} onChange={(e) => setNewPlayer((prev) => ({ ...prev, correct_predictions: parseInt(e.target.value) || 0 }))} placeholder="0" />
              </div>
              <div>
                <Label htmlFor="playerTotal">Всего прогнозов</Label>
                <Input id="playerTotal" type="number" value={newPlayer.total_predictions} onChange={(e) => setNewPlayer((prev) => ({ ...prev, total_predictions: parseInt(e.target.value) || 0 }))} placeholder="0" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddPlayer}>Создать игрока</Button>
              <Button variant="outline" onClick={() => setShowAddPlayerForm(false)}>Отмена</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {leaderboard.slice(playersPagination.startIndex, playersPagination.endIndex).map((entry: LeaderboardEntry) => (
          <PlayerEditCard key={entry.player.id} entry={entry} isEditing={editingPlayer === entry.player.id} onEdit={() => handleEditPlayer(entry.player.id)} onSave={(updatedStats) => handleSavePlayer(entry.player.id, updatedStats)} onCancel={() => setEditingPlayer(null)} onDelete={() => handleDeletePlayer(entry.player.id)} />
        ))}
      </div>

      <PaginationControls currentPage={playersPagination.currentPage} totalPages={playersPagination.totalPages} totalItems={playersPagination.totalItems} itemsPerPage={playersPagination.itemsPerPage} pageNumbers={playersPagination.pageNumbers} canGoToNext={playersPagination.canGoToNext} canGoToPrevious={playersPagination.canGoToPrevious} onPageChange={playersPagination.goToPage} onNextPage={playersPagination.goToNextPage} onPreviousPage={playersPagination.goToPreviousPage} />
    </div>
  );
}

interface PlayerEditCardProps {
  entry: LeaderboardEntry;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (stats: Partial<Player>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function PlayerEditCard({ entry, isEditing, onEdit, onSave, onCancel, onDelete }: PlayerEditCardProps) {
  const [editData, setEditData] = useState({
    name: entry.player.name,
    email: entry.player.email || "",
    password: "",
    points: entry.player.points,
    correct_predictions: entry.player.correct_predictions,
    total_predictions: entry.player.total_predictions,
  });

  const handleSave = () => {
    const dataToSave = { ...editData };
    if (!dataToSave.password) {
      delete (dataToSave as { password?: string }).password;
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
              <Input value={editData.name} onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={editData.email} onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div>
              <Label>Новый пароль (оставьте пустым, чтобы не менять)</Label>
              <Input type="password" value={editData.password} onChange={(e) => setEditData((prev) => ({ ...prev, password: e.target.value }))} placeholder="Оставьте пустым для сохранения текущего" />
            </div>
            <div>
              <Label>Очки</Label>
              <Input type="number" value={editData.points} onChange={(e) => setEditData((prev) => ({ ...prev, points: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label>Верные прогнозы</Label>
              <Input type="number" value={editData.correct_predictions} onChange={(e) => setEditData((prev) => ({ ...prev, correct_predictions: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label>Всего прогнозов</Label>
              <Input type="number" value={editData.total_predictions} onChange={(e) => setEditData((prev) => ({ ...prev, total_predictions: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border border-border hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 truncate">
            <Badge variant="outline" className="shrink-0">#{entry.player.rank_position}</Badge>
            <h3 className="text-base font-medium text-foreground truncate">{entry.player.name}</h3>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary" className="shrink-0">{entry.player.points} очков</Badge>
            <Badge variant="outline" className="shrink-0">{entry.player.correct_predictions}/{entry.player.total_predictions} верных</Badge>
            <Badge variant="default" className="shrink-0">{entry.accuracy}% точность</Badge>
            {entry.player.email && (
              <span className="text-muted-foreground truncate">{entry.player.email}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onEdit} title="Редактировать">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onDelete} title="Удалить">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  league: string;
  stage: string;
  status: "upcoming" | "live" | "finished";
}

export const AdminPanel = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([
    {
      id: "1",
      homeTeam: "CSKA",
      awayTeam: "Spartak",
      date: "15 дек",
      time: "21:00 МСК",
      league: "RPL",
      stage: "Matchday 3",
      status: "upcoming"
    },
    {
      id: "2", 
      homeTeam: "Baltika",
      awayTeam: "Pari NN",
      date: "16 дек",
      time: "00:00 МСК",
      league: "RPL",
      stage: "1/4 Final",
      status: "finished"
    },
    {
      id: "3",
      homeTeam: "PSG",
      awayTeam: "Marseille",
      date: "14 дек",
      time: "23:00 МСК",
      league: "Ligue 1",
      stage: "Round 15",
      status: "live"
    },
    {
      id: "4",
      homeTeam: "Bayern Munich",
      awayTeam: "Werder",
      date: "17 дек",
      time: "19:30 МСК",
      league: "Bundesliga",
      stage: "Der Klassiker",
      status: "upcoming"
    }
  ]);

  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [newMatch, setNewMatch] = useState<Partial<Match>>({
    homeTeam: "",
    awayTeam: "",
    date: "",
    time: "",
    league: "",
    stage: "",
    status: "upcoming"
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEditMatch = (matchId: string) => {
    setEditingMatch(matchId);
  };

  const handleSaveMatch = (matchId: string, updatedMatch: Partial<Match>) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId ? { ...match, ...updatedMatch } : match
    ));
    setEditingMatch(null);
    toast({
      title: "Матч обновлен",
      description: "Изменения успешно сохранены"
    });
  };

  const handleDeleteMatch = (matchId: string) => {
    setMatches(prev => prev.filter(match => match.id !== matchId));
    toast({
      title: "Матч удален",
      description: "Событие было удалено из системы"
    });
  };

  const handleAddMatch = () => {
    if (!newMatch.homeTeam || !newMatch.awayTeam || !newMatch.date || !newMatch.time) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    const match: Match = {
      id: Date.now().toString(),
      homeTeam: newMatch.homeTeam!,
      awayTeam: newMatch.awayTeam!,
      date: newMatch.date!,
      time: newMatch.time!,
      league: newMatch.league || "",
      stage: newMatch.stage || "",
      status: newMatch.status as "upcoming" | "live" | "finished" || "upcoming"
    };

    setMatches(prev => [...prev, match]);
    setNewMatch({
      homeTeam: "",
      awayTeam: "",
      date: "",
      time: "",
      league: "",
      stage: "",
      status: "upcoming"
    });
    setShowAddForm(false);
    toast({
      title: "Матч добавлен",
      description: "Новое событие создано успешно"
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-foreground">Админ-панель</h2>
          <p className="text-sm text-muted-foreground">Управление событиями для ставок</p>
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
                  value={newMatch.homeTeam || ""}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, homeTeam: e.target.value }))}
                  placeholder="Название команды"
                />
              </div>
              <div>
                <Label htmlFor="awayTeam">Гостевая команда *</Label>
                <Input
                  id="awayTeam"
                  value={newMatch.awayTeam || ""}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, awayTeam: e.target.value }))}
                  placeholder="Название команды"
                />
              </div>
              <div>
                <Label htmlFor="date">Дата *</Label>
                <Input
                  id="date"
                  value={newMatch.date || ""}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, date: e.target.value }))}
                  placeholder="15 дек"
                />
              </div>
              <div>
                <Label htmlFor="time">Время *</Label>
                <Input
                  id="time"
                  value={newMatch.time || ""}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, time: e.target.value }))}
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
        {matches.map((match) => (
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
                value={editData.homeTeam || ""}
                onChange={(e) => setEditData(prev => ({ ...prev, homeTeam: e.target.value }))}
              />
            </div>
            <div>
              <Label>Гостевая команда</Label>
              <Input
                value={editData.awayTeam || ""}
                onChange={(e) => setEditData(prev => ({ ...prev, awayTeam: e.target.value }))}
              />
            </div>
            <div>
              <Label>Дата</Label>
              <Input
                value={editData.date || ""}
                onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label>Время</Label>
              <Input
                value={editData.time || ""}
                onChange={(e) => setEditData(prev => ({ ...prev, time: e.target.value }))}
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
              {match.homeTeam} vs {match.awayTeam}
            </h3>
            <Badge variant={getStatusBadgeVariant(match.status)}>
              {getStatusText(match.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{match.date} • {match.time}</span>
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
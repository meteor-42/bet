import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit2, Save, X, Calendar, Clock3, Shield, Flag, EyeOff, CheckCheck } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";
import { type Match, type CreateMatchData } from "@/lib/supabase";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/PaginationControls";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function MatchesAdmin() {
  const { matches, loading, createMatch, updateMatch, deleteMatch } = useMatches();
  const { toast } = useToast();

  const [editingMatch, setEditingMatch] = useState<string | null>(null);

  const matchesPagination = usePagination({
    totalItems: matches.length,
    itemsPerPage: 10,
    initialPage: 1,
  });

  const toISOTimex = (hhmm: string) => {
    const t = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(hhmm.trim());
    if (!t) return hhmm;
    const hh = t[1];
    const mm = t[2];
    const ss = t[3] ?? "00";
    return `${hh}:${mm}:${ss}`;
  };

  const [newMatch, setNewMatch] = useState<CreateMatchData>({
    home_team: "",
    away_team: "",
    match_date: "",
    match_time: "",
    league: "РПЛ",
    tour: undefined,
    status: "upcoming",
    is_visible: true,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [formErrors, setFormErrors] = useState<{ date?: string; time?: string }>({});

  const handleEditMatch = (matchId: string) => {
    setEditingMatch(matchId);
  };

  const handleSaveMatch = async (matchId: string, updatedMatch: Partial<Match>) => {
    try {
      const errors: { date?: string; time?: string } = {};
      if (updatedMatch.match_date) {
        const dateInput = updatedMatch.match_date.trim();
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateInput)) {
          errors.date = "Введите дату в формате ГГГГ-ММ-ДД";
        } else {
          const [yyyy, mm, dd] = dateInput.split("-").map(Number);
          const d = new Date(yyyy, mm - 1, dd);
          const valid = d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
          if (!valid) errors.date = "Такой даты не существует";
        }
      }
      if (updatedMatch.match_time) {
        const timeInput = updatedMatch.match_time.trim();
        const t = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(timeInput);
        if (!t) {
          errors.time = "Введите время в формате ЧЧ:ММ, например 21:00";
        } else {
          const hh = Number(t[1]);
          const mm = Number(t[2]);
          if (hh < 0 || hh > 23 || mm < 0 || mm > 59) errors.time = "Часы 00–23, минуты 00–59";
        }
      }
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) {
        toast({ title: "Проверьте форму", description: Object.values(errors).join(". "), variant: "destructive" });
        return;
      }

      // Build clean payload
      const clean: Partial<Match> = {};
      (Object.entries(updatedMatch) as [keyof Match, unknown][]).forEach(([k, v]) => {
        if (v === undefined) return;
        if (typeof v === "string" && v.trim() === "") return;
        if (k === "match_time" && typeof v === "string") {
          const t = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(v);
          if (t) v = `${t[1]}:${t[2]}:${t[3] ?? "00"}`;
        }
        if (k === "home_score" || k === "away_score") {
          if (v === "") return;
          if (v === null) {
            // @ts-expect-error index
            clean[k] = null;
            return;
          }
          const num = Number(v);
          // @ts-expect-error index
          clean[k] = Number.isNaN(num) ? undefined : num;
          return;
        }
        // @ts-expect-error index
        clean[k] = v;
      });

      const success = await updateMatch({ id: matchId, ...clean });
      if (success) {
        toast({ title: "Матч обновлен", description: "Изменения успешно сохранены" });
        setEditingMatch(null);
      } else {
        toast({ title: "Не удалось обновить матч", variant: "destructive" });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("update match error", e);
      toast({ title: "Ошибка при сохранении", description: msg, variant: "destructive" });
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    const ok = await deleteMatch(matchId);
    if (ok) toast({ title: "Матч удален" });
    else toast({ title: "Не удалось удалить матч", variant: "destructive" });
  };

  const handleAddMatch = async () => {
    const dateInput = (newMatch.match_date || "").trim();
    const timeInput = (newMatch.match_time || "").trim();

    const errors: { date?: string; time?: string } = {};
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateInput)) {
      errors.date = "Введите дату в формате ГГГГ-ММ-ДД";
    } else {
      const [yyyy, mm, dd] = dateInput.split("-").map(Number);
      const d = new Date(yyyy, mm - 1, dd);
      const valid = d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
      if (!valid) {
        errors.date = "Такой даты не существует";
      }
    }

    const timeRegex = /^(\d{2}):(\d{2})$/;
    const t = timeRegex.exec(timeInput);
    if (!t) {
      errors.time = "Введите время в формате ЧЧ:ММ, например 21:00";
    } else {
      const hh = Number(t[1]);
      const mm = Number(t[2]);
      if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
        errors.time = "Часы 00–23, минуты 00–59";
      }
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!newMatch.home_team || !newMatch.away_team) {
      return;
    }

    const payload = {
      ...newMatch,
      match_date: newMatch.match_date,
      match_time: toISOTimex(timeInput),
    } as CreateMatchData;

    const success = await createMatch(payload);
    if (success) {
      toast({ title: "Матч создан" });
      setNewMatch({
        home_team: "",
        away_team: "",
        match_date: "",
        match_time: "",
        league: "РПЛ",
        tour: undefined,
        status: "upcoming",
        is_visible: true,
      });
      setFormErrors({});
      setShowAddForm(false);
    } else {
      toast({ title: "Не удалось создать матч", variant: "destructive" });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "live":
        return "default" as const;
      case "finished":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  if (loading && matches.length === 0) {
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
          <h3 className="text-lg font-medium text-foreground">Управление матчами</h3>
          <p className="text-sm text-muted-foreground">Создание и редактирование матчей</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Добавить матч
        </Button>
      </div>

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
                <Input id="homeTeam" value={newMatch.home_team || ""} onChange={(e) => setNewMatch((prev) => ({ ...prev, home_team: e.target.value }))} placeholder="Название команды" />
              </div>
              <div>
                <Label htmlFor="awayTeam">Гостевая команда *</Label>
                <Input id="awayTeam" value={newMatch.away_team || ""} onChange={(e) => setNewMatch((prev) => ({ ...prev, away_team: e.target.value }))} placeholder="Название команды" />
              </div>
              <div>
                <Label htmlFor="date">Дата *</Label>
                <Input id="date" type="date" value={newMatch.match_date || ""} onChange={(e) => { setNewMatch((prev) => ({ ...prev, match_date: e.target.value })); if (formErrors.date) setFormErrors((prev) => ({ ...prev, date: undefined })); }} />
                {formErrors.date && <p className="mt-1 text-xs text-destructive">{formErrors.date}</p>}
              </div>
              <div>
                <Label htmlFor="time">Время *</Label>
                <Input id="time" type="time" step={60 as unknown as undefined} value={(newMatch.match_time || "").slice(0, 5)} onChange={(e) => { setNewMatch((prev) => ({ ...prev, match_time: e.target.value })); if (formErrors.time) setFormErrors((prev) => ({ ...prev, time: undefined })); }} />
                {formErrors.time && <p className="mt-1 text-xs text-destructive">{formErrors.time}</p>}
              </div>
              <div>
                <Label htmlFor="league">Лига</Label>
                <Input id="league" value={newMatch.league || ""} onChange={(e) => setNewMatch((prev) => ({ ...prev, league: e.target.value }))} placeholder="РПЛ" />
              </div>
              <div>
                <Label htmlFor="tour">Тур</Label>
                <Input id="tour" type="number" value={newMatch.tour ?? ""} onChange={(e) => setNewMatch((prev) => ({ ...prev, tour: e.target.value === "" ? undefined : parseInt(e.target.value) || 0 }))} placeholder="1, 2, 3 ..." />
              </div>
              <div>
                <Label htmlFor="status">Статус</Label>
                <Select value={newMatch.status} onValueChange={(value) => setNewMatch((prev) => ({ ...prev, status: value as Match["status"] }))}>
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
              <div className="flex items-center space-x-2">
                <Switch id="is_visible" checked={newMatch.is_visible} onCheckedChange={(checked) => setNewMatch((prev) => ({ ...prev, is_visible: checked }))} />
                <Label htmlFor="is_visible" className="text-sm font-medium">Показывать игрокам</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddMatch} disabled={Boolean(formErrors.date || formErrors.time) || !newMatch.home_team || !newMatch.away_team || !newMatch.match_date || !newMatch.match_time}>Создать матч</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Отмена</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {matches.slice(matchesPagination.startIndex, matchesPagination.endIndex).map((match) => (
          <MatchEditCard key={match.id} match={match} isEditing={editingMatch === match.id} onEdit={() => handleEditMatch(match.id)} onSave={(updatedMatch) => handleSaveMatch(match.id, updatedMatch)} onCancel={() => setEditingMatch(null)} onDelete={() => handleDeleteMatch(match.id)} />
        ))}
      </div>

      <PaginationControls currentPage={matchesPagination.currentPage} totalPages={matchesPagination.totalPages} totalItems={matchesPagination.totalItems} itemsPerPage={matchesPagination.itemsPerPage} pageNumbers={matchesPagination.pageNumbers} canGoToNext={matchesPagination.canGoToNext} canGoToPrevious={matchesPagination.canGoToPrevious} onPageChange={matchesPagination.goToPage} onNextPage={matchesPagination.goToNextPage} onPreviousPage={matchesPagination.goToPreviousPage} />
    </div>
  );
}

interface MatchEditCardProps {
  match: Match;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (match: Partial<Match>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function MatchEditCard({ match, isEditing, onEdit, onSave, onCancel, onDelete }: MatchEditCardProps) {
  const [editData, setEditData] = useState<Partial<Match>>(match);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload: Partial<Match> = {};
      for (const [key, value] of Object.entries(editData)) {
        if (value === undefined) continue;
        if (typeof value === "string" && value.trim() === "") continue;
        // @ts-expect-error index
        payload[key] = value;
      }
      if (payload.home_score !== undefined) {
        payload.home_score = payload.home_score === null ? null : Number(payload.home_score);
      }
      if (payload.away_score !== undefined) {
        payload.away_score = payload.away_score === null ? null : Number(payload.away_score);
      }
      if (payload.match_time) {
        const t = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(payload.match_time));
        if (t) payload.match_time = `${t[1]}:${t[2]}:${t[3] ?? "00"}` as Match["match_time"];
      }
      if (payload.match_date) {
        const v = String(payload.match_date);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
          setIsSaving(false);
          return;
        }
      }
      await onSave(payload);
    } catch (e: unknown) {
      // no-op: parent shows toasts
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <Card className="p-6 border border-border">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Редактирование матча</h3>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Сохранение…" : "Сохранить"}
              </Button>
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Домашняя команда</Label>
                <Input value={editData.home_team || ""} onChange={(e) => setEditData((prev) => ({ ...prev, home_team: e.target.value }))} />
              </div>
              <div>
                <Label>Гостевая команда</Label>
                <Input value={editData.away_team || ""} onChange={(e) => setEditData((prev) => ({ ...prev, away_team: e.target.value }))} />
              </div>
              <div>
                <Label>Дата</Label>
                <Input type="date" value={editData.match_date || ""} onChange={(e) => setEditData((prev) => ({ ...prev, match_date: e.target.value }))} />
              </div>
              <div>
                <Label>Время</Label>
                <Input type="time" step={60 as unknown as undefined} value={(editData.match_time || "").slice(0, 5)} onChange={(e) => setEditData((prev) => ({ ...prev, match_time: e.target.value }))} />
              </div>
              <div>
                <Label>Лига</Label>
                <Input value={editData.league || ""} onChange={(e) => setEditData((prev) => ({ ...prev, league: e.target.value }))} />
              </div>
              <div>
                <Label>Тур</Label>
                <Input type="number" value={editData.tour !== undefined && editData.tour !== null ? String(editData.tour) : ""} onChange={(e) => setEditData((prev) => ({ ...prev, tour: e.target.value === "" ? undefined : parseInt(e.target.value) || 0 }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Статус</Label>
                <Select value={editData.status} onValueChange={(value) => setEditData((prev) => ({ ...prev, status: value as Match["status"] }))}>
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
              <div className="flex items-center space-x-2 pt-6">
                <Switch id="edit_is_visible" checked={editData.is_visible || false} onCheckedChange={(checked) => setEditData((prev) => ({ ...prev, is_visible: checked }))} />
                <Label htmlFor="edit_is_visible" className="text-sm font-medium">Показывать игрокам для ставок</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Голы домашней команды</Label>
                <Input type="number" min="0" value={editData.home_score !== null && editData.home_score !== undefined ? editData.home_score.toString() : ""} onChange={(e) => setEditData((prev) => ({ ...prev, home_score: e.target.value === "" ? null : parseInt(e.target.value) || 0 }))} placeholder="Не установлено" />
              </div>
              <div>
                <Label>Голы гостевой команды</Label>
                <Input type="number" min="0" value={editData.away_score !== null && editData.away_score !== undefined ? editData.away_score.toString() : ""} onChange={(e) => setEditData((prev) => ({ ...prev, away_score: e.target.value === "" ? null : parseInt(e.target.value) || 0 }))} placeholder="Не установлено" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-4 border border-border hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 min-w-0 flex-1">
          {match.league && (
            <Badge className="h-6 rounded-md px-2 text-[11px] leading-5 bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              {match.league}
            </Badge>
          )}
          {match.match_date && (
            <Badge variant="outline" className="h-6 rounded-md px-2 text-[11px] leading-5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {(() => {
                try {
                  const parts = match.match_date.includes("-") ? match.match_date.split("-").map(Number) : match.match_date.includes(".") ? match.match_date.split(".").reverse().map(Number) : [];
                  const d = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(match.match_date);
                  return format(d, "dd.MM.yyyy", { locale: ru });
                } catch {
                  return match.match_date;
                }
              })()}
            </Badge>
          )}
          {match.match_time && (
            <Badge variant="outline" className="h-6 rounded-md px-2 text-[11px] leading-5 flex items-center gap-1">
              <Clock3 className="w-3.5 h-3.5" />
              {(() => {
                try {
                  const [hh, mm] = match.match_time.split(":");
                  const pad = (s: string) => String(s).padStart(2, "0");
                  return `${pad(hh)}:${pad(mm ?? "00")}`;
                } catch {
                  return match.match_time;
                }
              })()}
            </Badge>
          )}
          {typeof match.tour === "number" && (
            <Badge variant="secondary" className="h-6 rounded-md px-2 text-[11px] leading-5 flex items-center gap-1">
              <Flag className="w-3.5 h-3.5" />
              Тур {match.tour}
            </Badge>
          )}
          {match.status === "finished" && (
            <Badge className="h-6 rounded-md px-2 text-[11px] leading-5 flex items-center gap-1 bg-black text-white border border-black">
              <CheckCheck className="w-3.5 h-3.5" />
              Завершен
            </Badge>
          )}
          {!match.is_visible && (
            <Badge variant="outline" className="h-6 rounded-md px-2 text-[11px] leading-5 flex items-center gap-1">
              <EyeOff className="w-3.5 h-3.5" />
              Скрыт
            </Badge>
          )}
          <span className="text-muted-foreground/60 text-xs">•</span>
          <h3 className="text-[14px] md:text-sm font-semibold text-foreground truncate">{match.home_team} — {match.away_team}</h3>
          <span className="mx-2 inline-block align-middle h-5 w-px bg-border" />
          {match.home_score !== null && match.away_score !== null ? (
            <span className="ml-2 text-lg font-bold text-primary">{match.home_score} : {match.away_score}</span>
          ) : (
            <Badge variant="outline" className="ml-2 h-6 rounded-md px-2 text-[11px] leading-5 tracking-wide uppercase">Счет не установлен</Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 self-center">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

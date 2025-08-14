import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, History, Users } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MyBets } from "@/components/MyBets";
import AdminPanel from "@/components/AdminPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useState, Suspense, lazy } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const PlayersAdmin = lazy(() => import("@/components/PlayersAdmin"));

export const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { toast } = useToast();
  const [openProfile, setOpenProfile] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleSavePassword = async () => {
    if (!password || password.length < 6) {
      toast({ title: "Пароль слишком короткий", description: "Мин. 6 символов", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Пароли не совпадают", description: "Повторите ввод", variant: "destructive" });
      return;
    }
    try {
      setSavingPass(true);
      // use statically imported supabase to avoid mixed import warning
      const { error } = await supabase.from("players").update({ password }).eq("id", user?.id);
      if (error) throw error;
      toast({ title: "Пароль обновлен" });
      setOpenProfile(false);
      setPassword("");
      setConfirm("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка обновления пароля";
      toast({ title: "Ошибка", description: msg, variant: "destructive" });
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-center">
        {/* Centered controls */}
        <div className="flex items-center gap-2 sm:gap-1">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12 p-0 sm:h-8 sm:w-8" title="Мои ставки">
                  <History className="w-6 h-6 sm:w-4 sm:h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader className="bg-muted border-b border-border -mx-6 -mt-6 px-6 py-4">
                  <SheetTitle>Мои ставки</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <MyBets />
                </div>
              </SheetContent>
            </Sheet>

            <Dialog open={openProfile} onOpenChange={setOpenProfile}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12 p-0 sm:h-8 sm:w-8" title="Профиль">
                  <User className="w-6 h-6 sm:w-4 sm:h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="bg-muted border-b border-border -mx-6 -mt-6 px-6 py-4">
                  <DialogTitle>Профиль</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Имя</Label>
                    <Input id="name" value={user?.name || ""} className="col-span-3" readOnly disabled />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" value={user?.email || ""} className="col-span-3" readOnly disabled />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">Пароль</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" placeholder="Минимум 6 символов" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="confirm" className="text-right">Повтор</Label>
                    <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenProfile(false)}>Отмена</Button>
                  <Button onClick={handleSavePassword} disabled={savingPass}>{savingPass ? "Сохранение..." : "Сохранить"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Admin controls */}
            {isAdmin && (
              <>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-12 w-12 p-0 sm:h-8 sm:w-8" title="Управление игроками">
                      <Users className="w-6 h-6 sm:w-4 sm:h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-full w-full max-w-none max-h-none">
                    <SheetHeader className="bg-muted border-b border-border -mx-6 -mt-6 px-6 py-4">
                      <SheetTitle>Управление игроками</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <Suspense fallback={<div className="p-4">Загрузка...</div>}>
                        <PlayersAdmin />
                      </Suspense>
                    </div>
                  </SheetContent>
                </Sheet>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-12 w-12 p-0 sm:h-8 sm:w-8" title="Настройки">
                      <Settings className="w-6 h-6 sm:w-4 sm:h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-full w-full max-w-none max-h-none">
                    <SheetHeader className="bg-muted border-b border-border -mx-6 -mt-6 px-6 py-4">
                      <SheetTitle>Настройки</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <AdminPanel />
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 p-0 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
              title="Выйти"
            >
              <LogOut className="w-6 h-6 sm:w-4 sm:h-4" />
            </Button>
        </div>
      </div>
    </header>
  );
};

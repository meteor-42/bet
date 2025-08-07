import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, User, Settings, LogOut, History } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MyBets } from "@/components/MyBets";
import { AdminPanel } from "@/components/AdminPanel";

export const Header = () => {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
            <div className="w-4 h-4 bg-primary-foreground rounded-sm"></div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-medium text-foreground">Прогнозы</h1>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-6">
          {/* Points */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Очки:</span>
            <span className="font-medium text-foreground">1,234</span>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-1">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <History className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Мои ставки</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <MyBets />
                </div>
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <User className="w-4 h-4" />
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-full w-full max-w-none max-h-none">
                <SheetHeader>
                  <SheetTitle>Настройки</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <AdminPanel />
                </div>
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
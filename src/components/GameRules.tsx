import { Card } from "@/components/ui/card";

export const GameRules = () => {
  return (
    <Card className="p-4 border border-border bg-muted/20">
      <div className="text-center space-y-2">
        <p className="text-sm text-foreground">
          <span className="font-medium">3 очка</span> за точный счет • <span className="font-medium">1 очко</span> за точный результат
        </p>
        <p className="text-xs text-muted-foreground">Обратная связь @fabiocapello</p>
      </div>
    </Card>
  );
};
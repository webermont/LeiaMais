import { useThemeStore } from '@/store';
import { themes } from '@/config/themes';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Palette } from 'lucide-react';

export function ThemeSelector() {
  const { theme, setTheme } = useThemeStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Selecionar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(themes).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setTheme(key as keyof typeof themes)}
            className="flex items-center gap-2"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: value.primary }}
            />
            <span>{value.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
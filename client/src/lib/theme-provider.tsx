import { createContext, useContext, useEffect, useState } from 'react';
import { UserSettings } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const { user } = useAuth();
  const { toast } = useToast();

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Load user theme preferences
  useEffect(() => {
    if (!user) {
      setThemeState(defaultTheme);
      return;
    }

    // Only fetch theme settings if user is authenticated
    fetch('/api/settings', {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch theme settings');
        }
        return res.json();
      })
      .then((settings: UserSettings) => {
        if (settings.theme) {
          setThemeState(settings.theme as Theme);
        }
      })
      .catch(error => {
        console.error('Error fetching theme settings:', error);
      });
  }, [user, defaultTheme]);

  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);

      if (user) {
        const response = await apiRequest('PATCH', '/api/settings', { theme: newTheme });
        if (!response.ok) {
          throw new Error('Failed to update theme');
        }

        queryClient.invalidateQueries({ queryKey: ['/api/settings'] });

        toast({
          title: 'Theme Updated',
          description: 'Your theme preference has been saved.',
        });
      }
    } catch (error) {
      console.error('Error updating theme:', error);
      if (user) {
        toast({
          title: 'Error',
          description: 'Failed to update theme. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
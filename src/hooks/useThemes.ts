import { useState, useEffect } from 'react';
import { QuizTheme } from '@/types/quiz';

export interface SavedTheme {
  id: string;
  name: string;
  theme: QuizTheme;
  createdAt: string;
  isPreset?: boolean;
}

// Temas predefinidos do sistema
const presetThemes: SavedTheme[] = [
  {
    id: 'classic-blue',
    name: 'Clássico Azul',
    isPreset: true,
    createdAt: new Date().toISOString(),
    theme: {
      primary: '#2563EB',
      background: '#FFFFFF',
      text: '#0B0B0B',
      accent: '#3B82F6',
      cardBackground: '#FFFFFF',
      borderRadius: '12px',
      fontFamily: 'Inter, sans-serif',
      buttonStyle: 'rounded',
      gradient: false,
      fakeProgress: false
    }
  },
  {
    id: 'elegant-purple',
    name: 'Elegante Roxo',
    isPreset: true,
    createdAt: new Date().toISOString(),
    theme: {
      primary: '#7C3AED',
      background: '#FAFAFA',
      text: '#1F2937',
      accent: '#8B5CF6',
      cardBackground: '#FFFFFF',
      borderRadius: '16px',
      fontFamily: 'Poppins, sans-serif',
      buttonStyle: 'rounded',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'linear' as const,
      fakeProgressSpeed: 'normal' as const
    }
  },
  {
    id: 'energy-orange',
    name: 'Energia Laranja',
    isPreset: true,
    createdAt: new Date().toISOString(),
    theme: {
      primary: '#EA580C',
      background: '#FFF7ED',
      text: '#9A3412',
      accent: '#FB923C',
      cardBackground: '#FFFFFF',
      borderRadius: '20px',
      fontFamily: 'Poppins, sans-serif',
      buttonStyle: 'pill',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'stepped' as const,
      fakeProgressSpeed: 'fast' as const
    }
  },
  {
    id: 'forest-green',
    name: 'Floresta Verde',
    isPreset: true,
    createdAt: new Date().toISOString(),
    theme: {
      primary: '#059669',
      background: '#F0FDF4',
      text: '#064E3B',
      accent: '#10B981',
      cardBackground: '#FFFFFF',
      borderRadius: '12px',
      fontFamily: 'Lato, sans-serif',
      buttonStyle: 'rounded',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'linear' as const,
      fakeProgressSpeed: 'slow' as const
    }
  },
  {
    id: 'night-mode',
    name: 'Modo Noite',
    isPreset: true,
    createdAt: new Date().toISOString(),
    theme: {
      primary: '#3B82F6',
      background: '#0F172A',
      text: '#F1F5F9',
      accent: '#60A5FA',
      cardBackground: '#1E293B',
      borderRadius: '12px',
      fontFamily: 'Inter, sans-serif',
      buttonStyle: 'rounded',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'linear' as const,
      fakeProgressSpeed: 'normal' as const
    }
  },
  {
    id: 'luxury-gold',
    name: 'Ouro Real',
    isPreset: true,
    createdAt: new Date().toISOString(),
    theme: {
      primary: '#CA8A04',
      background: '#FEFCE8',
      text: '#713F12',
      accent: '#EAB308',
      cardBackground: '#FFFFFF',
      borderRadius: '20px',
      fontFamily: 'Playfair Display, serif',
      buttonStyle: 'pill',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'stepped' as const,
      fakeProgressSpeed: 'slow' as const
    }
  }
];

export function useThemes() {
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);

  // Carregar temas salvos do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('quiz-themes');
    if (stored) {
      try {
        const parsedThemes = JSON.parse(stored);
        setSavedThemes([...presetThemes, ...parsedThemes]);
      } catch (error) {
        console.error('Erro ao carregar temas:', error);
        setSavedThemes(presetThemes);
      }
    } else {
      setSavedThemes(presetThemes);
    }
  }, []);

  // Salvar tema personalizado
  const saveTheme = (name: string, theme: QuizTheme): SavedTheme => {
    const newTheme: SavedTheme = {
      id: `custom-${Date.now()}`,
      name,
      theme,
      createdAt: new Date().toISOString(),
      isPreset: false
    };

    const customThemes = savedThemes.filter(t => !t.isPreset);
    const updatedCustomThemes = [...customThemes, newTheme];
    
    // Salvar apenas temas customizados no localStorage
    localStorage.setItem('quiz-themes', JSON.stringify(updatedCustomThemes));
    
    // Salvar como tema global (último usado) para auto-carregamento
    localStorage.setItem('quiz-global-theme', JSON.stringify(theme));
    
    // Atualizar estado com todos os temas
    setSavedThemes([...presetThemes, ...updatedCustomThemes]);
    
    return newTheme;
  };

  // Deletar tema personalizado
  const deleteTheme = (themeId: string) => {
    if (presetThemes.find(t => t.id === themeId)) {
      throw new Error('Não é possível deletar temas predefinidos');
    }

    const customThemes = savedThemes.filter(t => !t.isPreset && t.id !== themeId);
    localStorage.setItem('quiz-themes', JSON.stringify(customThemes));
    setSavedThemes([...presetThemes, ...customThemes]);
  };

  // Buscar tema por ID
  const getThemeById = (themeId: string): SavedTheme | undefined => {
    return savedThemes.find(t => t.id === themeId);
  };

  // Aplicar tema ao quiz
  const applyThemeToQuiz = (themeId: string, currentTheme: QuizTheme): QuizTheme => {
    const theme = getThemeById(themeId);
    if (!theme) {
      return currentTheme;
    }

    return {
      ...currentTheme,
      ...theme.theme
    };
  };

  return {
    savedThemes,
    presetThemes,
    customThemes: savedThemes.filter(t => !t.isPreset),
    saveTheme,
    deleteTheme,
    getThemeById,
    applyThemeToQuiz
  };
}
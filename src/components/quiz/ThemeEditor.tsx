import { useState } from 'react';
import { useThemes } from '@/hooks/useThemes';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { QuizTheme } from '@/types/quiz';
import { Palette, Type, Layout, Image, Sparkles, Zap, Film, BarChart3, Save, Gift } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FakeProgressBar } from './FakeProgressBar';
import { LivePreview } from './LivePreview';
import { IntelligentProgressConfigComponent } from './IntelligentProgressConfig';
import { useFakeProgress } from '@/hooks/useFakeProgress';
import { MicroRewards } from './engagement/MicroRewards';

interface ThemeEditorProps {
  theme: QuizTheme;
  onUpdate: (theme: QuizTheme) => void;
  quizId?: string;
}

const presetThemes: Array<{
  name: string;
  theme: Partial<QuizTheme>;
}> = [
  // === TEMAS CLÁSSICOS ===
  {
    name: 'Clássico Azul',
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
    name: 'Elegante Roxo',
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
    name: 'Minimalista Preto',
    theme: {
      primary: '#000000',
      background: '#FFFFFF',
      text: '#000000',
      accent: '#6B7280',
      cardBackground: '#F9FAFB',
      borderRadius: '4px',
      fontFamily: 'Inter, sans-serif',
      buttonStyle: 'square',
      gradient: false,
      fakeProgress: false
    }
  },

  // === TEMAS VIBRANTES ===
  {
    name: 'Energia Laranja',
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
    name: 'Rosa Vibrante',
    theme: {
      primary: '#EC4899',
      background: '#FDF2F8',
      text: '#831843',
      accent: '#F472B6',
      cardBackground: '#FFFFFF',
      borderRadius: '24px',
      fontFamily: 'Montserrat, sans-serif',
      buttonStyle: 'pill',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'circular' as const,
      fakeProgressSpeed: 'normal' as const
    }
  },
  {
    name: 'Ciano Elétrico',
    theme: {
      primary: '#0891B2',
      background: '#F0F9FF',
      text: '#0C4A6E',
      accent: '#06B6D4',
      cardBackground: '#FFFFFF',
      borderRadius: '18px',
      fontFamily: 'Inter, sans-serif',
      buttonStyle: 'rounded',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'linear' as const,
      fakeProgressSpeed: 'fast' as const
    }
  },

  // === TEMAS NATUREZA ===
  {
    name: 'Floresta Verde',
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
    name: 'Oceano Profundo',
    theme: {
      primary: '#1E40AF',
      background: '#EFF6FF',
      text: '#1E3A8A',
      accent: '#3B82F6',
      cardBackground: '#FFFFFF',
      borderRadius: '16px',
      fontFamily: 'Open Sans, sans-serif',
      buttonStyle: 'rounded',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'stepped' as const,
      fakeProgressSpeed: 'normal' as const
    }
  },
  {
    name: 'Terra Dourada',
    theme: {
      primary: '#D97706',
      background: '#FFFBEB',
      text: '#92400E',
      accent: '#F59E0B',
      cardBackground: '#FFFFFF',
      borderRadius: '14px',
      fontFamily: 'Roboto, sans-serif',
      buttonStyle: 'rounded',
      gradient: false,
      fakeProgress: false
    }
  },

  // === TEMAS ESCUROS ===
  {
    name: 'Modo Noite',
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
    name: 'Neon Cyberpunk',
    theme: {
      primary: '#A855F7',
      background: '#111827',
      text: '#F9FAFB',
      accent: '#C084FC',
      cardBackground: '#1F2937',
      borderRadius: '8px',
      fontFamily: 'Montserrat, sans-serif',
      buttonStyle: 'square',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'circular' as const,
      fakeProgressSpeed: 'fast' as const
    }
  },
  {
    name: 'Grafite Moderno',
    theme: {
      primary: '#6B7280',
      background: '#18181B',
      text: '#FAFAFA',
      accent: '#9CA3AF',
      cardBackground: '#27272A',
      borderRadius: '10px',
      fontFamily: 'Inter, sans-serif',
      buttonStyle: 'rounded',
      gradient: false,
      fakeProgress: false
    }
  },

  // === TEMAS LUXO ===
  {
    name: 'Ouro Real',
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
  },
  {
    name: 'Platina Elite',
    theme: {
      primary: '#475569',
      background: '#F8FAFC',
      text: '#334155',
      accent: '#64748B',
      cardBackground: '#FFFFFF',
      borderRadius: '16px',
      fontFamily: 'Merriweather, serif',
      buttonStyle: 'rounded',
      gradient: false,
      fakeProgress: true,
      fakeProgressStyle: 'linear' as const,
      fakeProgressSpeed: 'slow' as const
    }
  },

  // === TEMAS NEGÓCIO ===
  {
    name: 'Corporativo Azul',
    theme: {
      primary: '#1D4ED8',
      background: '#F8FAFC',
      text: '#1E293B',
      accent: '#3B82F6',
      cardBackground: '#FFFFFF',
      borderRadius: '8px',
      fontFamily: 'Inter, sans-serif',
      buttonStyle: 'square',
      gradient: false,
      fakeProgress: true,
      fakeProgressStyle: 'linear' as const,
      fakeProgressSpeed: 'normal' as const
    }
  },
  {
    name: 'Fintech Verde',
    theme: {
      primary: '#16A34A',
      background: '#F7FEF7',
      text: '#14532D',
      accent: '#22C55E',
      cardBackground: '#FFFFFF',
      borderRadius: '12px',
      fontFamily: 'Roboto, sans-serif',
      buttonStyle: 'rounded',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'stepped' as const,
      fakeProgressSpeed: 'normal' as const
    }
  },
  {
    name: 'Saúde Confiável',
    theme: {
      primary: '#0284C7',
      background: '#F0F9FF',
      text: '#0C4A6E',
      accent: '#0EA5E9',
      cardBackground: '#FFFFFF',
      borderRadius: '14px',
      fontFamily: 'Lato, sans-serif',
      buttonStyle: 'rounded',
      gradient: false,
      fakeProgress: true,
      fakeProgressStyle: 'circular' as const,
      fakeProgressSpeed: 'slow' as const
    }
  },

  // === TEMAS CRIATIVOS ===
  {
    name: 'Arte Digital',
    theme: {
      primary: '#DC2626',
      background: '#FEF2F2',
      text: '#991B1B',
      accent: '#EF4444',
      cardBackground: '#FFFFFF',
      borderRadius: '24px',
      fontFamily: 'Poppins, sans-serif',
      buttonStyle: 'pill',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'stepped' as const,
      fakeProgressSpeed: 'fast' as const
    }
  },
  {
    name: 'Design Studio',
    theme: {
      primary: '#7C2D12',
      background: '#FFF7ED',
      text: '#9A3412',
      accent: '#EA580C',
      cardBackground: '#FFFFFF',
      borderRadius: '18px',
      fontFamily: 'Montserrat, sans-serif',
      buttonStyle: 'rounded',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'circular' as const,
      fakeProgressSpeed: 'normal' as const
    }
  },

  // === TEMAS GRADIENTES ===
  {
    name: 'Pôr do Sol',
    theme: {
      primary: '#F59E0B',
      background: '#FFF7ED',
      text: '#92400E',
      accent: '#F97316',
      cardBackground: '#FFFFFF',
      borderRadius: '20px',
      fontFamily: 'Poppins, sans-serif',
      buttonStyle: 'pill',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'linear' as const,
      fakeProgressSpeed: 'normal' as const
    }
  },
  {
    name: 'Aurora Boreal',
    theme: {
      primary: '#059669',
      background: '#ECFDF5',
      text: '#064E3B',
      accent: '#06B6D4',
      cardBackground: '#FFFFFF',
      borderRadius: '16px',
      fontFamily: 'Inter, sans-serif',
      buttonStyle: 'rounded',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'stepped' as const,
      fakeProgressSpeed: 'fast' as const
    }
  },

  // === TEMAS ESPECIAIS ===
  {
    name: 'Vintage Retrô',
    theme: {
      primary: '#B45309',
      background: '#FEF3C7',
      text: '#78350F',
      accent: '#D97706',
      cardBackground: '#FFFFFF',
      borderRadius: '12px',
      fontFamily: 'Playfair Display, serif',
      buttonStyle: 'rounded',
      gradient: false,
      fakeProgress: true,
      fakeProgressStyle: 'stepped' as const,
      fakeProgressSpeed: 'slow' as const
    }
  },
  {
    name: 'Futurista',
    theme: {
      primary: '#8B5CF6',
      background: '#F5F3FF',
      text: '#581C87',
      accent: '#A78BFA',
      cardBackground: '#FFFFFF',
      borderRadius: '8px',
      fontFamily: 'Inter, sans-serif',
      buttonStyle: 'square',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'circular' as const,
      fakeProgressSpeed: 'fast' as const
    }
  },
  {
    name: 'Neutro Soft',
    theme: {
      primary: '#737373',
      background: '#FAFAFA',
      text: '#404040',
      accent: '#A3A3A3',
      cardBackground: '#FFFFFF',
      borderRadius: '14px',
      fontFamily: 'Open Sans, sans-serif',
      buttonStyle: 'rounded',
      gradient: false,
      fakeProgress: false
    }
  }
];

export function ThemeEditor({ theme, onUpdate, quizId }: ThemeEditorProps) {
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [themeName, setThemeName] = useState('');
  const { saveTheme } = useThemes();

  const handleSaveTheme = () => {
    if (!themeName.trim()) return;
    
    saveTheme(themeName, theme);
    setThemeName('');
    setShowSaveDialog(false);
    
    // Opcional: notificar sucesso
    console.log(`Tema "${themeName}" salvo com sucesso!`);
  };

  // Use the same logic as the actual progress bar for preview
  const { getProgressForStep } = useFakeProgress({
    theme,
    currentStep: 0,
    totalSteps: 3,
    isActive: false,
    answeredSteps: 0
  });

  const updateTheme = (updates: Partial<QuizTheme>) => {
    onUpdate({ ...theme, ...updates });
  };

  const ColorPicker = ({ color, onChange, label }: { color: string; onChange: (color: string) => void; label: string }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10"
            style={{ backgroundColor: color }}
          >
            <div 
              className="w-4 h-4 rounded border" 
              style={{ backgroundColor: color }}
            />
            {color}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <HexColorPicker color={color} onChange={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Personalização Visual</h3>
        </div>
        
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Save className="w-4 h-4" />
              Salvar Tema
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Salvar Tema Personalizado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="theme-name">Nome do tema</Label>
                <Input
                  id="theme-name"
                  placeholder="Ex: Meu Tema Azul"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveTheme}
                  disabled={!themeName.trim()}
                >
                  Salvar Tema
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações */}
        <div>
          <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
          <TabsTrigger value="presets" className="flex items-center gap-1 text-xs sm:text-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Presets</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-1 text-xs sm:text-sm">
            <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Cores</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-1 text-xs sm:text-sm">
            <Type className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Texto</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-1 text-xs sm:text-sm">
            <Layout className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Layout</span>
          </TabsTrigger>
          <TabsTrigger value="progress-bar" className="flex items-center gap-1 text-xs sm:text-sm col-span-1 md:col-span-1">
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline">Progresso</span>
          </TabsTrigger>
          <TabsTrigger value="effects" className="flex items-center gap-1 text-xs sm:text-sm">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Efeitos</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-1 text-xs sm:text-sm">
            <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Recompensas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {presetThemes.map((preset) => (
              <Card
                key={preset.name}
                className="p-4 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => updateTheme(preset.theme)}
              >
                <div className="space-y-3">
                  <h4 className="font-medium">{preset.name}</h4>
                  <div className="flex gap-2">
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: preset.theme.primary }}
                    />
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: preset.theme.background }}
                    />
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: preset.theme.accent }}
                    />
                  </div>
                  <div 
                    className="h-8 rounded text-xs flex items-center justify-center text-white"
                    style={{ 
                      backgroundColor: preset.theme.primary,
                      borderRadius: preset.theme.borderRadius 
                    }}
                  >
                    Botão de exemplo
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ColorPicker
              color={theme.primary || '#2563EB'}
              onChange={(color) => updateTheme({ primary: color })}
              label="Cor primária"
            />
            <ColorPicker
              color={theme.accent || '#3B82F6'}
              onChange={(color) => updateTheme({ accent: color })}
              label="Cor de destaque"
            />
            <ColorPicker
              color={theme.background || '#FFFFFF'}
              onChange={(color) => updateTheme({ background: color })}
              label="Fundo da página"
            />
            <ColorPicker
              color={theme.text || '#0B0B0B'}
              onChange={(color) => updateTheme({ text: color })}
              label="Cor do texto"
            />
            <ColorPicker
              color={theme.cardBackground || '#FFFFFF'}
              onChange={(color) => updateTheme({ cardBackground: color })}
              label="Fundo dos cards"
            />
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <Switch
              id="gradient"
              checked={theme.gradient || false}
              onCheckedChange={(checked) => updateTheme({ gradient: checked })}
            />
            <Label htmlFor="gradient">Usar gradientes nos botões</Label>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Família da fonte</Label>
              <Select
                value={theme.fontFamily || 'Inter, sans-serif'}
                onValueChange={(value) => updateTheme({ fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter, sans-serif">Inter (Moderno)</SelectItem>
                  <SelectItem value="Poppins, sans-serif">Poppins (Friendly)</SelectItem>
                  <SelectItem value="Roboto, sans-serif">Roboto (Clássico)</SelectItem>
                  <SelectItem value="Montserrat, sans-serif">Montserrat (Elegante)</SelectItem>
                  <SelectItem value="Open Sans, sans-serif">Open Sans (Legível)</SelectItem>
                  <SelectItem value="Lato, sans-serif">Lato (Profissional)</SelectItem>
                  <SelectItem value="Playfair Display, serif">Playfair (Luxo)</SelectItem>
                  <SelectItem value="Merriweather, serif">Merriweather (Editorial)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Tamanho da fonte base</Label>
              <Select
                value={theme.fontSize || 'medium'}
                onValueChange={(value) => updateTheme({ fontSize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeno (14px)</SelectItem>
                  <SelectItem value="medium">Médio (16px)</SelectItem>
                  <SelectItem value="large">Grande (18px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Estilo dos botões</Label>
              <Select
                value={theme.buttonStyle || 'rounded'}
                onValueChange={(value) => updateTheme({ buttonStyle: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Quadrados</SelectItem>
                  <SelectItem value="rounded">Arredondados</SelectItem>
                  <SelectItem value="pill">Pills (bem arredondados)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Raio da borda</Label>
              <Input
                type="range"
                min="0"
                max="24"
                value={parseInt(theme.borderRadius?.replace('px', '') || '12')}
                onChange={(e) => updateTheme({ borderRadius: `${e.target.value}px` })}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {theme.borderRadius || '12px'}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Largura máxima do quiz</Label>
              <Select
                value={theme.maxWidth || 'medium'}
                onValueChange={(value) => updateTheme({ maxWidth: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeno (600px)</SelectItem>
                  <SelectItem value="medium">Médio (800px)</SelectItem>
                  <SelectItem value="large">Grande (1000px)</SelectItem>
                  <SelectItem value="full">Largura total</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showProgress"
                  checked={theme.showProgress !== false}
                  onCheckedChange={(checked) => updateTheme({ showProgress: checked })}
                />
                <Label htmlFor="showProgress">Mostrar barra de progresso</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showQuestionNumbers"
                  checked={theme.showQuestionNumbers !== false}
                  onCheckedChange={(checked) => updateTheme({ showQuestionNumbers: checked })}
                />
                <Label htmlFor="showQuestionNumbers">Mostrar números das perguntas</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="centerAlign"
                  checked={theme.centerAlign || false}
                  onCheckedChange={(checked) => updateTheme({ centerAlign: checked })}
                />
                <Label htmlFor="centerAlign">Centralizar conteúdo</Label>
              </div>
            </div>

          </div>
        </TabsContent>

        <TabsContent value="progress-bar" className="space-y-4">
          <div className="space-y-6">
            {/* Configurações Básicas da Barra de Progresso */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Configurações da Barra de Progresso
              </h4>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="showProgressBar"
                  checked={theme.showProgress !== false}
                  onCheckedChange={(checked) => updateTheme({ showProgress: checked })}
                />
                <Label htmlFor="showProgressBar">Mostrar barra de progresso</Label>
              </div>

              {theme.showProgress !== false && (
                <div className="space-y-6 pl-6 border-l-2 border-primary/20">
                  {/* Barra de Progresso Fake */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold">Barra de Progresso Fake</h4>
                    <p className="text-sm text-muted-foreground">
                      Cria uma sensação de progresso que motiva o usuário a continuar respondendo
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="fakeProgress"
                        checked={theme.fakeProgress || false}
                        onCheckedChange={(checked) => updateTheme({ fakeProgress: checked })}
                      />
                      <Label htmlFor="fakeProgress">Ativar barra de progresso fake</Label>
                    </div>

                    {theme.fakeProgress && (
                      <div className="space-y-6 pl-6 border-l-2 border-secondary/20">
                        
                        {/* Configurações Básicas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Estilo da Barra</Label>
                            <Select
                              value={theme.fakeProgressStyle || 'linear'}
                              onValueChange={(value) => updateTheme({ fakeProgressStyle: value as 'linear' | 'stepped' | 'circular' })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="linear">Linear (Barra horizontal)</SelectItem>
                                <SelectItem value="stepped">Passos (Círculos numerados)</SelectItem>
                                <SelectItem value="circular">Circular (Progresso em círculo)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Velocidade da Animação</Label>
                            <Select
                              value={theme.fakeProgressSpeed || 'normal'}
                              onValueChange={(value) => updateTheme({ fakeProgressSpeed: value as 'slow' | 'normal' | 'fast' })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fast">Rápida (0.5s)</SelectItem>
                                <SelectItem value="normal">Normal (1s)</SelectItem>
                                <SelectItem value="slow">Lenta (2s)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Configurações de Range */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Configuração Manual do Range</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Progresso Inicial (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={theme.fakeProgressStartPercent || 15}
                                onChange={(e) => updateTheme({ fakeProgressStartPercent: parseInt(e.target.value) })}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Progresso Final (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={theme.fakeProgressEndPercent || 85}
                                onChange={(e) => updateTheme({ fakeProgressEndPercent: parseInt(e.target.value) })}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Preview por Etapa */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Preview por Etapa</Label>
                          <p className="text-xs text-muted-foreground">
                            Veja como a barra ficará após cada resposta
                          </p>
                           <div className="grid gap-3">
                            {[0, 1, 2, 3].map((stepAnswered) => {
                              const progressForStep = stepAnswered === 0 
                                ? (theme.fakeProgressStartPercent || 15)
                                : getProgressForStep(stepAnswered);
                              
                              return (
                                <div key={stepAnswered} className="flex items-center gap-3">
                                  <span className="text-xs text-muted-foreground min-w-[80px]">
                                    {stepAnswered === 0 ? 'Inicial' : `Resposta ${stepAnswered}`}:
                                  </span>
                                  <div className="flex-1 bg-muted rounded-full h-2">
                                    <div 
                                      className="h-full rounded-full bg-primary transition-all duration-300"
                                      style={{ width: `${Math.round(progressForStep)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground min-w-[35px]">
                                    {Math.round(progressForStep)}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progresso Inteligente */}
                  <div className="space-y-4 pt-6 border-t">
                    <IntelligentProgressConfigComponent
                      theme={theme}
                      onThemeChange={updateTheme}
                      totalSteps={3}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Preview da Barra de Progresso */}
            {theme.showProgress !== false && (theme.fakeProgress || theme.intelligentProgress) && (
              <div className="space-y-4 pt-6 border-t">
                <h4 className="text-md font-semibold">Preview Ao Vivo</h4>
                <p className="text-sm text-muted-foreground">
                  Como o usuário verá a barra durante o quiz
                </p>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <FakeProgressBar
                    theme={theme}
                    currentStep={2}
                    totalSteps={3}
                    answeredSteps={1}
                    isActive={true}
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="effects" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="useAnimations"
                checked={theme.useParticleEffects || false}
                onCheckedChange={(checked) => updateTheme({ useParticleEffects: checked })}
              />
              <Label htmlFor="useAnimations">Ativar efeitos especiais</Label>
            </div>

            <div>
              <Label className="text-sm font-medium">Efeito de Conclusão</Label>
              <Select
                value={theme.completionEffect || 'confetti'}
                onValueChange={(value) => updateTheme({ completionEffect: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confetti">Confetti</SelectItem>
                  <SelectItem value="fireworks">Fogos de Artifício</SelectItem>
                  <SelectItem value="stars">Estrelas</SelectItem>
                  <SelectItem value="none">Nenhum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="useVideoBackground"
                checked={theme.useVideoBackground || false}
                onCheckedChange={(checked) => updateTheme({ useVideoBackground: checked })}
              />
              <Label htmlFor="useVideoBackground">Fundo de vídeo</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="useSoundEffects"
                checked={theme.useSoundEffects || false}
                onCheckedChange={(checked) => updateTheme({ useSoundEffects: checked })}
              />
              <Label htmlFor="useSoundEffects">Efeitos sonoros</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <MicroRewards 
            theme={theme}
            onUpdate={onUpdate}
            quizId={quizId || 'default'}
          />
        </TabsContent>
          </Tabs>
        </div>

        {/* Preview em Tempo Real Interativo */}
        <div>
          <Card className="sticky top-4">
            <div className="p-4 border-b">
              <h4 className="font-medium flex items-center gap-2">
                <Film className="w-4 h-4" />
                Preview Interativo em Tempo Real
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Clique nos botões para testar as funcionalidades
              </p>
            </div>
            <LivePreview theme={theme} />
          </Card>
        </div>
      </div>
    </div>
  );
}
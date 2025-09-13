import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Palette, Type, Layout, Sparkles, Upload, Download, RotateCcw,
  Eye, Settings, Zap, Image as ImageIcon, Video, Wand2
} from 'lucide-react';

interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    muted: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    size: {
      xs: number;
      sm: number;
      base: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
    };
  };
  layout: {
    style: 'card' | 'fullscreen' | 'sidebar' | 'multipage';
    maxWidth: string;
    padding: number;
    spacing: number;
  };
  visual: {
    borderRadius: number;
    shadows: boolean;
    animations: boolean;
    gradient: string;
    backgroundType: 'solid' | 'gradient' | 'image' | 'video';
    backgroundMedia?: string;
  };
  branding: {
    logo?: string;
    logoPosition: 'top-left' | 'top-center' | 'top-right';
    showWatermark: boolean;
    favicon?: string;
  };
}

interface AdvancedThemeEditorProps {
  theme: ThemeConfig;
  onChange: (theme: ThemeConfig) => void;
  onPreview: () => void;
}

const PRESET_COLORS = [
  { name: 'Elevado Blue', value: '#2563eb' },
  { name: 'Ocean', value: '#0ea5e9' },
  { name: 'Forest', value: '#059669' },
  { name: 'Sunset', value: '#ea580c' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Rose', value: '#e11d48' },
];

const FONT_OPTIONS = [
  { name: 'Inter', value: 'font-inter' },
  { name: 'Poppins', value: 'font-poppins' },
  { name: 'Montserrat', value: 'font-montserrat' },
  { name: 'Roboto', value: 'font-roboto' },
  { name: 'Open Sans', value: 'font-opensans' },
  { name: 'Playfair Display', value: 'font-playfair' },
  { name: 'Lato', value: 'font-lato' },
  { name: 'Merriweather', value: 'font-merriweather' },
];

const GRADIENT_PRESETS = [
  { name: 'Primary', value: 'bg-gradient-primary' },
  { name: 'Secondary', value: 'bg-gradient-secondary' },
  { name: 'Accent', value: 'bg-gradient-accent' },
  { name: 'Dark', value: 'bg-gradient-dark' },
  { name: 'Light', value: 'bg-gradient-light' },
  { name: 'Sunset', value: 'bg-gradient-sunset' },
  { name: 'Ocean', value: 'bg-gradient-ocean' },
  { name: 'Forest', value: 'bg-gradient-forest' },
  { name: 'Purple', value: 'bg-gradient-purple' },
];

export function AdvancedThemeEditor({ theme, onChange, onPreview }: AdvancedThemeEditorProps) {
  const [selectedColorType, setSelectedColorType] = useState<keyof ThemeConfig['colors']>('primary');

  const updateTheme = (path: string, value: any) => {
    const newTheme = { ...theme };
    const keys = path.split('.');
    let current: any = newTheme;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onChange(newTheme);
  };

  const ColorPicker = ({ colorKey }: { colorKey: keyof ThemeConfig['colors'] }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium capitalize">{colorKey}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start h-10"
            style={{ backgroundColor: theme.colors[colorKey] }}
          >
            <div 
              className="w-6 h-6 rounded border mr-2"
              style={{ backgroundColor: theme.colors[colorKey] }}
            />
            {theme.colors[colorKey]}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div className="p-4 space-y-4">
            <HexColorPicker
              color={theme.colors[colorKey]}
              onChange={(color) => updateTheme(`colors.${colorKey}`, color)}
            />
            <div className="grid grid-cols-3 gap-2">
              {PRESET_COLORS.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  className="h-8 p-1"
                  onClick={() => updateTheme(`colors.${colorKey}`, preset.value)}
                >
                  <div
                    className="w-full h-full rounded"
                    style={{ backgroundColor: preset.value }}
                  />
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Editor de Tema Avançado
          </h2>
          <p className="text-sm text-muted-foreground">
            Personalize completamente o visual do seu quiz
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Cores
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Tipografia
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Visual
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Branding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Paleta de Cores</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorPicker colorKey="primary" />
                <ColorPicker colorKey="secondary" />
                <ColorPicker colorKey="accent" />
                <ColorPicker colorKey="background" />
                <ColorPicker colorKey="foreground" />
                <ColorPicker colorKey="card" />
              </div>

              <div className="space-y-3">
                <Label>Paletas Pré-definidas</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PRESET_COLORS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => updateTheme('colors.primary', preset.value)}
                    >
                      <div
                        className="w-4 h-4 rounded mr-2"
                        style={{ backgroundColor: preset.value }}
                      />
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Tipografia</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Fonte Principal</Label>
                    <Select 
                      value={theme.fonts.primary} 
                      onValueChange={(value) => updateTheme('fonts.primary', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span className={font.value}>{font.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Fonte Secundária</Label>
                    <Select 
                      value={theme.fonts.secondary} 
                      onValueChange={(value) => updateTheme('fonts.secondary', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span className={font.value}>{font.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Tamanhos de Fonte</Label>
                  {Object.entries(theme.fonts.size).map(([size, value]) => (
                    <div key={size} className="flex items-center gap-3">
                      <Label className="w-16 text-sm">{size}:</Label>
                      <Slider
                        value={[value]}
                        onValueChange={([newValue]) => updateTheme(`fonts.size.${size}`, newValue)}
                        min={10}
                        max={72}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-muted-foreground">{value}px</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Layout e Estrutura</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Estilo de Layout</Label>
                    <Select 
                      value={theme.layout.style} 
                      onValueChange={(value) => updateTheme('layout.style', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Cartão Central</SelectItem>
                        <SelectItem value="fullscreen">Tela Cheia</SelectItem>
                        <SelectItem value="sidebar">Barra Lateral</SelectItem>
                        <SelectItem value="multipage">Multi-página</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Largura Máxima</Label>
                    <Select 
                      value={theme.layout.maxWidth} 
                      onValueChange={(value) => updateTheme('layout.maxWidth', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sm">Pequena (640px)</SelectItem>
                        <SelectItem value="md">Média (768px)</SelectItem>
                        <SelectItem value="lg">Grande (1024px)</SelectItem>
                        <SelectItem value="xl">Extra Grande (1280px)</SelectItem>
                        <SelectItem value="full">Tela Cheia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Espaçamento Interno</Label>
                    <Slider
                      value={[theme.layout.padding]}
                      onValueChange={([value]) => updateTheme('layout.padding', value)}
                      min={0}
                      max={64}
                      step={4}
                    />
                    <span className="text-sm text-muted-foreground">{theme.layout.padding}px</span>
                  </div>
                  
                  <div>
                    <Label>Espaçamento entre Elementos</Label>
                    <Slider
                      value={[theme.layout.spacing]}
                      onValueChange={([value]) => updateTheme('layout.spacing', value)}
                      min={4}
                      max={32}
                      step={2}
                    />
                    <span className="text-sm text-muted-foreground">{theme.layout.spacing}px</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="visual" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Efeitos Visuais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Raio da Borda</Label>
                    <Slider
                      value={[theme.visual.borderRadius]}
                      onValueChange={([value]) => updateTheme('visual.borderRadius', value)}
                      min={0}
                      max={24}
                      step={1}
                    />
                    <span className="text-sm text-muted-foreground">{theme.visual.borderRadius}px</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Sombras</Label>
                    <Switch
                      checked={theme.visual.shadows}
                      onCheckedChange={(checked) => updateTheme('visual.shadows', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Animações</Label>
                    <Switch
                      checked={theme.visual.animations}
                      onCheckedChange={(checked) => updateTheme('visual.animations', checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Fundo</Label>
                    <Select 
                      value={theme.visual.backgroundType} 
                      onValueChange={(value) => updateTheme('visual.backgroundType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Cor Sólida</SelectItem>
                        <SelectItem value="gradient">Gradiente</SelectItem>
                        <SelectItem value="image">Imagem</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {theme.visual.backgroundType === 'gradient' && (
                    <div>
                      <Label>Gradiente Pré-definido</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {GRADIENT_PRESETS.map((gradient) => (
                          <Button
                            key={gradient.name}
                            variant="outline"
                            size="sm"
                            className={`justify-start ${gradient.value}`}
                            onClick={() => updateTheme('visual.gradient', gradient.value)}
                          >
                            {gradient.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(theme.visual.backgroundType === 'image' || theme.visual.backgroundType === 'video') && (
                    <div>
                      <Label>Upload de Mídia</Label>
                      <Button variant="outline" className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        {theme.visual.backgroundType === 'image' ? 'Escolher Imagem' : 'Escolher Vídeo'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Identidade Visual</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Logo</Label>
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                  
                  <div>
                    <Label>Posição do Logo</Label>
                    <Select 
                      value={theme.branding.logoPosition} 
                      onValueChange={(value) => updateTheme('branding.logoPosition', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Superior Esquerda</SelectItem>
                        <SelectItem value="top-center">Superior Centro</SelectItem>
                        <SelectItem value="top-right">Superior Direita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Marca d'água</Label>
                    <Switch
                      checked={theme.branding.showWatermark}
                      onCheckedChange={(checked) => updateTheme('branding.showWatermark', checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Favicon</Label>
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Favicon
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Preview do Tema</Label>
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-background to-muted/30">
                      <div className="space-y-3">
                        <div className="h-4 bg-primary/20 rounded"></div>
                        <div className="h-2 bg-secondary/20 rounded w-3/4"></div>
                        <div className="h-8 bg-accent/20 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
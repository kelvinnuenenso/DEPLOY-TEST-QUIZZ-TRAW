import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { QuizTheme } from '@/types/quiz';
import { 
  Monitor, 
  Smartphone, 
  Tablet,
  Layout as LayoutIcon,
  Maximize,
  Square,
  Sidebar,
  Grid,
  Eye
} from 'lucide-react';

interface LayoutManagerProps {
  theme: QuizTheme;
  onUpdate: (theme: QuizTheme) => void;
  previewMode: 'desktop' | 'tablet' | 'mobile';
}

const layoutTemplates = [
  {
    id: 'card',
    name: 'Cartão Central',
    description: 'Layout clássico com cartão centralizado',
    icon: Square,
    preview: '/layouts/card-preview.png',
    settings: {
      layout: 'card',
      maxWidth: 'medium',
      centerAlign: true,
      padding: 'normal'
    }
  },
  {
    id: 'fullscreen',
    name: 'Tela Cheia',
    description: 'Aproveita toda a tela disponível',
    icon: Maximize,
    preview: '/layouts/fullscreen-preview.png',
    settings: {
      layout: 'fullscreen',
      maxWidth: 'full',
      centerAlign: false,
      padding: 'large'
    }
  },
  {
    id: 'sidebar',
    name: 'Barra Lateral',
    description: 'Layout com navegação lateral',
    icon: Sidebar,
    preview: '/layouts/sidebar-preview.png',
    settings: {
      layout: 'sidebar',
      maxWidth: 'large',
      centerAlign: false,
      padding: 'normal'
    }
  },
  {
    id: 'multipage',
    name: 'Multipáginas',
    description: 'Cada pergunta em uma página separada',
    icon: Grid,
    preview: '/layouts/multipage-preview.png',
    settings: {
      layout: 'multipage',
      maxWidth: 'medium',
      centerAlign: true,
      padding: 'normal'
    }
  }
];

export function LayoutManager({ theme, onUpdate, previewMode }: LayoutManagerProps) {
  const [selectedLayout, setSelectedLayout] = useState(theme.layout || 'card');

  const updateTheme = (updates: Partial<QuizTheme>) => {
    onUpdate({ ...theme, ...updates });
  };

  const selectLayoutTemplate = (template: typeof layoutTemplates[0]) => {
    setSelectedLayout(template.id);
    updateTheme({ 
      ...template.settings,
      layout: template.id
    });
  };

  return (
    <div className="space-y-6">
      {/* Layout Templates */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <LayoutIcon className="w-5 h-5" />
          Templates de Layout
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {layoutTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.id}
                className={`p-4 cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                  selectedLayout === template.id ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => selectLayoutTemplate(template)}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                  
                  {/* Layout Preview */}
                  <div className="aspect-video bg-muted rounded-lg p-3">
                    <div className="h-full bg-gradient-to-br from-primary/20 to-accent/20 rounded flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Layout Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Configurações de Layout</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Largura Máxima</Label>
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
                  <SelectItem value="xl">Extra Grande (1200px)</SelectItem>
                  <SelectItem value="full">Largura Total</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Espaçamento Interno</Label>
              <Select
                value={theme.padding || 'normal'}
                onValueChange={(value) => updateTheme({ padding: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compacto</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                  <SelectItem value="xl">Extra Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="centerAlign"
                checked={theme.centerAlign || false}
                onCheckedChange={(checked) => updateTheme({ centerAlign: checked })}
              />
              <Label htmlFor="centerAlign">Centralizar Conteúdo</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showProgress"
                checked={theme.showProgress !== false}
                onCheckedChange={(checked) => updateTheme({ showProgress: checked })}
              />
              <Label htmlFor="showProgress">Mostrar Barra de Progresso</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="mobileOptimized"
                checked={theme.mobileOptimized !== false}
                onCheckedChange={(checked) => updateTheme({ mobileOptimized: checked })}
              />
              <Label htmlFor="mobileOptimized">Otimização Mobile</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4" />
          <h4 className="font-medium">Preview do Layout - {previewMode === 'mobile' ? 'Mobile' : 'Desktop'}</h4>
        </div>
        
        <div className={`border rounded-lg overflow-hidden ${
          previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-4xl mx-auto'
        }`}>
          <div className="h-64 bg-gradient-to-br from-muted to-muted/50 p-4 flex items-center justify-center">
            <div className="text-center">
              <h3 className="font-medium">Preview do {selectedLayout}</h3>
              <p className="text-sm text-muted-foreground">Layout selecionado</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
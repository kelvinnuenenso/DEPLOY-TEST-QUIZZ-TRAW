import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ComponentType } from '@/types/quiz';
import {
  Type,
  Image,
  Video,
  MousePointer,
  BarChart3,
  Star,
  Quote,
  Calendar,
  MapPin,
  DollarSign,
  Zap,
  Gift,
  Users,
  TrendingUp,
  Play,
  Camera,
  FileText,
  Clock,
  Heart,
  Target,
  Award,
  Sparkles,
  Palette,
  Layout,
  Grid,
  Layers
} from 'lucide-react';

interface ComponentLibraryProps {
  onAddComponent: (type: ComponentType) => void;
  userPlan: 'free' | 'pro' | 'premium';
}

interface ComponentCategory {
  id: string;
  name: string;
  icon: typeof Type;
  components: ComponentDefinition[];
}

interface ComponentDefinition {
  type: ComponentType;
  name: string;
  description: string;
  icon: typeof Type;
  isPro?: boolean;
  isPremium?: boolean;
  preview: string;
}

const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    id: 'basic',
    name: 'Básicos',
    icon: Type,
    components: [
      {
        type: 'title',
        name: 'Título',
        description: 'Títulos e subtítulos',
        icon: Type,
        preview: 'H1, H2, H3'
      },
      {
        type: 'text',
        name: 'Texto',
        description: 'Parágrafos e texto corrido',
        icon: FileText,
        preview: 'Lorem ipsum...'
      },
      {
        type: 'button',
        name: 'Botão',
        description: 'Botões de ação',
        icon: MousePointer,
        preview: 'Clique aqui'
      },
      {
        type: 'spacer',
        name: 'Espaçador',
        description: 'Espaço em branco',
        icon: Layout,
        preview: '20px height'
      }
    ]
  },
  {
    id: 'form',
    name: 'Formulários',
    icon: MousePointer,
    components: [
      {
        type: 'input',
        name: 'Campo de Texto',
        description: 'Input de texto simples',
        icon: Type,
        preview: 'Nome...'
      },
      {
        type: 'multiple_choice',
        name: 'Múltipla Escolha',
        description: 'Opções de seleção',
        icon: MousePointer,
        preview: '○ Opção A\n○ Opção B'
      },
      {
        type: 'level_slider',
        name: 'Slider',
        description: 'Escala numérica',
        icon: BarChart3,
        preview: '1 ——●—— 10'
      },
      {
        type: 'rating',
        name: 'Avaliação',
        description: 'Sistema de estrelas',
        icon: Star,
        preview: '★★★☆☆'
      }
    ]
  },
  {
    id: 'media',
    name: 'Mídia',
    icon: Image,
    components: [
      {
        type: 'image',
        name: 'Imagem',
        description: 'Imagens e fotos',
        icon: Image,
        preview: '🖼️'
      },
      {
        type: 'video',
        name: 'Vídeo',
        description: 'Vídeos incorporados',
        icon: Video,
        isPro: true,
        preview: '▶️ Video'
      },
      {
        type: 'carousel',
        name: 'Galeria',
        description: 'Galeria de imagens',
        icon: Camera,
        isPro: true,
        preview: '🖼️ ← → 🖼️'
      }
    ]
  }
];

export function ComponentLibrary({ onAddComponent, userPlan }: ComponentLibraryProps) {
  const canUseComponent = (component: ComponentDefinition) => {
    if (component.isPremium && userPlan !== 'premium') return false;
    if (component.isPro && userPlan === 'free') return false;
    return true;
  };

  const getPlanBadge = (component: ComponentDefinition) => {
    if (component.isPremium) {
      return <Badge variant="secondary" className="text-xs">Premium</Badge>;
    }
    if (component.isPro) {
      return <Badge variant="outline" className="text-xs">Pro</Badge>;
    }
    return null;
  };

  return (
    <div className="h-full bg-background border-r">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Biblioteca de Componentes
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Arraste os componentes para o canvas
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-3 m-2">
            <TabsTrigger value="basic" className="text-xs">Básicos</TabsTrigger>
            <TabsTrigger value="form" className="text-xs">Formulário</TabsTrigger>
            <TabsTrigger value="media" className="text-xs">Mídia</TabsTrigger>
          </TabsList>

          {COMPONENT_CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id} className="m-2">
              <div className="space-y-2">
                {category.components.map((component) => (
                  <ComponentCard
                    key={component.type}
                    component={component}
                    canUse={canUseComponent(component)}
                    planBadge={getPlanBadge(component)}
                    onAdd={() => onAddComponent(component.type)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="p-4 border-t bg-muted/30">
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center justify-between mb-1">
            <span>Plano Atual:</span>
            <Badge variant="outline" className="capitalize">{userPlan}</Badge>
          </div>
          {userPlan === 'free' && (
            <p className="text-xs">
              Faça upgrade para acessar componentes Pro e Premium
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ComponentCardProps {
  component: ComponentDefinition;
  canUse: boolean;
  planBadge: React.ReactNode;
  onAdd: () => void;
}

function ComponentCard({ component, canUse, planBadge, onAdd }: ComponentCardProps) {
  return (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${
      !canUse ? 'opacity-50' : ''
    }`}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
            <component.icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-1">
              <h5 className="font-medium text-sm truncate">{component.name}</h5>
              {planBadge}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {component.description}
            </p>
            <div className="text-xs font-mono bg-muted/50 rounded px-2 py-1 mb-2">
              {component.preview}
            </div>
            <Button
              size="sm"
              variant={canUse ? "default" : "secondary"}
              className="w-full h-7 text-xs"
              onClick={onAdd}
              disabled={!canUse}
              draggable={canUse}
              onDragStart={(e) => {
                if (canUse) {
                  e.dataTransfer.setData('application/component-type', component.type);
                }
              }}
            >
              {canUse ? 'Adicionar' : 'Requer Upgrade'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComponentType } from '@/types/quiz';
import { useDraggable } from '@dnd-kit/core';
import { 
  Type, Image, Video, MousePointer, FileText, HelpCircle, 
  MessageSquare, RotateCcw, BarChart3, Sparkles, CreditCard,
  Activity, Space, Check, Search, Layers, Zap, Heart, Target
} from 'lucide-react';

interface ComponentItem {
  type: ComponentType;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'content' | 'interaction' | 'social' | 'visualization' | 'effects' | 'structure';
  premium?: boolean;
}

const COMPONENT_LIBRARY: ComponentItem[] = [
  // Content
  { 
    type: 'text', 
    name: 'Texto', 
    description: 'Parágrafo ou texto explicativo',
    icon: <Type className="w-4 h-4" />, 
    category: 'content' 
  },
  { 
    type: 'title', 
    name: 'Título', 
    description: 'Cabeçalho ou título da seção',
    icon: <Type className="w-4 h-4" />, 
    category: 'content' 
  },
  { 
    type: 'image', 
    name: 'Imagem', 
    description: 'Foto, ilustração ou gráfico',
    icon: <Image className="w-4 h-4" />, 
    category: 'content' 
  },
  { 
    type: 'video', 
    name: 'Vídeo', 
    description: 'Vídeo incorporado ou player',
    icon: <Video className="w-4 h-4" />, 
    category: 'content' 
  },

  // Interaction
  { 
    type: 'button', 
    name: 'Botão', 
    description: 'Botão de ação ou navegação',
    icon: <MousePointer className="w-4 h-4" />, 
    category: 'interaction' 
  },
  { 
    type: 'input', 
    name: 'Campo de Entrada', 
    description: 'Input de texto, email, telefone',
    icon: <FileText className="w-4 h-4" />, 
    category: 'interaction' 
  },
  { 
    type: 'multiple_choice', 
    name: 'Múltipla Escolha', 
    description: 'Opções para selecionar',
    icon: <Target className="w-4 h-4" />, 
    category: 'interaction' 
  },
  { 
    type: 'level_slider', 
    name: 'Slider de Nível', 
    description: 'Escala deslizante ou rating',
    icon: <Activity className="w-4 h-4" />, 
    category: 'interaction' 
  },

  // Social
  { 
    type: 'faq', 
    name: 'FAQ', 
    description: 'Perguntas frequentes expandíveis',
    icon: <HelpCircle className="w-4 h-4" />, 
    category: 'social' 
  },
  { 
    type: 'testimonial', 
    name: 'Depoimento', 
    description: 'Avaliação ou feedback de cliente',
    icon: <MessageSquare className="w-4 h-4" />, 
    category: 'social' 
  },
  { 
    type: 'carousel', 
    name: 'Galeria', 
    description: 'Carrossel de imagens ou conteúdo',
    icon: <RotateCcw className="w-4 h-4" />, 
    category: 'social' 
  },

  // Visualization  
  { 
    type: 'comparison', 
    name: 'Comparação', 
    description: 'Tabela ou cards comparativos',
    icon: <Layers className="w-4 h-4" />, 
    category: 'visualization' 
  },
  { 
    type: 'chart', 
    name: 'Gráfico', 
    description: 'Visualização de dados',
    icon: <BarChart3 className="w-4 h-4" />, 
    category: 'visualization' 
  },
  { 
    type: 'pricing', 
    name: 'Tabela de Preços', 
    description: 'Planos e preços organizados',
    icon: <CreditCard className="w-4 h-4" />, 
    category: 'visualization',
    premium: true 
  },

  // Effects
  { 
    type: 'confetti', 
    name: 'Confetti', 
    description: 'Efeito de celebração animado',
    icon: <Sparkles className="w-4 h-4" />, 
    category: 'effects',
    premium: true 
  },
  { 
    type: 'marquee', 
    name: 'Texto Rolante', 
    description: 'Texto animado em movimento',
    icon: <Zap className="w-4 h-4" />, 
    category: 'effects' 
  },

  // Structure
  { 
    type: 'spacer', 
    name: 'Espaçador', 
    description: 'Espaço em branco ajustável',
    icon: <Space className="w-4 h-4" />, 
    category: 'structure' 
  },
  { 
    type: 'terms', 
    name: 'Termos', 
    description: 'Checkbox de aceitação de termos',
    icon: <Check className="w-4 h-4" />, 
    category: 'structure' 
  }
];

interface DraggableComponentProps {
  component: ComponentItem;
  onAdd: (type: ComponentType) => void;
}

function DraggableComponent({ component, onAdd }: DraggableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `component-${component.type}`,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'ring-2 ring-primary' : ''
      } ${component.premium ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50' : ''}`}
      onClick={() => onAdd(component.type)}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          component.premium ? 'bg-yellow-100' : 'bg-muted'
        }`}>
          {component.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{component.name}</h4>
            {component.premium && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                <Heart className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {component.description}
          </p>
        </div>
      </div>
    </Card>
  );
}

interface EnhancedComponentLibraryProps {
  onComponentAdd: (type: ComponentType) => void;
}

export function EnhancedComponentLibrary({ onComponentAdd }: EnhancedComponentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredComponents = COMPONENT_LIBRARY.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || component.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'Todos', icon: <Layers className="w-4 h-4" /> },
    { id: 'content', name: 'Conteúdo', icon: <Type className="w-4 h-4" /> },
    { id: 'interaction', name: 'Interação', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'social', name: 'Social', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'visualization', name: 'Visualização', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'effects', name: 'Efeitos', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'structure', name: 'Estrutura', icon: <Space className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Biblioteca de Componentes
        </h3>
        
        {/* Busca */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar componentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8 text-xs"
          />
        </div>

        {/* Abas de categoria */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 mb-3">
            <TabsTrigger value="all" className="text-xs p-1">Todos</TabsTrigger>
            <TabsTrigger value="content" className="text-xs p-1">Conteúdo</TabsTrigger>
            <TabsTrigger value="interaction" className="text-xs p-1">Interação</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {categories.slice(3).map(category => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="text-xs h-7 px-2"
              >
                {category.icon}
                <span className="ml-1 hidden sm:inline">{category.name}</span>
              </Button>
            ))}
          </div>
        </Tabs>
      </div>

      {/* Lista de componentes */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredComponents.length > 0 ? (
          filteredComponents.map((component) => (
            <DraggableComponent
              key={component.type}
              component={component}
              onAdd={onComponentAdd}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum componente encontrado</p>
            <p className="text-xs">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </div>

      <div className="pt-3 border-t text-center">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Dica:</strong> Arraste os componentes para o canvas ou clique para adicionar
        </p>
      </div>
    </div>
  );
}
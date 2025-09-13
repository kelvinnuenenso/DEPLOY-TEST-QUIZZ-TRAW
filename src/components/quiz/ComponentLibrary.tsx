import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComponentType } from '@/types/quiz';
import { useState } from 'react';
import { 
  Type, 
  Heading,
  Image, 
  Video, 
  MousePointer,
  FormInput,
  HelpCircle,
  Star,
  RotateCcw,
  BarChart3,
  Sparkles,
  DollarSign,
  Scroll,
  Code,
  FileText,
  CheckSquare,
  Sliders,
  Search,
  GripVertical,
  Plus
} from 'lucide-react';

interface ComponentItemProps {
  type: ComponentType;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  onAddComponent?: (type: ComponentType) => void;
}

interface ComponentLibraryProps {
  onAddComponent?: (type: ComponentType) => void;
}

function ComponentItem({ type, label, description, icon, category, onAddComponent }: ComponentItemProps) {
  const [isClicked, setIsClicked] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `component-${type}`,
    data: {
      type,
      label,
      description,
      category
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
  } : undefined;

  const handleClick = (e: React.MouseEvent) => {
    // Só adiciona componente se não estiver sendo arrastado
    if (!isDragging && onAddComponent) {
      e.stopPropagation();
      onAddComponent(type);
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 200);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Previne seleção de texto durante drag
    e.preventDefault();
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      className={`
        p-3 select-none transition-all duration-200 border-2 group relative
        ${isDragging 
          ? 'opacity-80 shadow-2xl border-primary bg-primary/20 scale-105 cursor-grabbing z-50' 
          : 'cursor-grab hover:cursor-grab border-transparent hover:border-primary/30 hover:bg-muted/50 active:scale-98'
        }
        ${isClicked ? 'border-primary bg-primary/10 scale-95' : ''}
      `}
    >
      <div className="flex items-start gap-3 pointer-events-none">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
          ${isDragging || isClicked ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-primary/10'}
        `}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">{label}</h4>
            <GripVertical className={`
              w-3 h-3 transition-all
              ${isDragging ? 'text-primary opacity-100' : 'text-muted-foreground opacity-0 group-hover:opacity-100'}
            `} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
          <Badge variant="outline" className="text-xs mt-2 opacity-70">
            {category}
          </Badge>
        </div>
      </div>
      
      {/* Indicador visual durante drag */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 rounded-lg border-2 border-primary border-dashed animate-pulse" />
      )}
    </Card>
  );
}

const COMPONENT_LIBRARY: ComponentItemProps[] = [
  // Interação
  {
    type: 'multiple_choice',
    label: 'Múltipla Escolha',
    description: 'Pergunta com opções de resposta',
    icon: <CheckSquare className="w-4 h-4 text-primary" />,
    category: 'Interação'
  },
  {
    type: 'input',
    label: 'Campo de Texto',
    description: 'Input para respostas abertas',
    icon: <FormInput className="w-4 h-4 text-primary" />,
    category: 'Interação'
  },
  {
    type: 'level_slider',
    label: 'Slider de Nível',
    description: 'Escala deslizante para avaliação',
    icon: <Sliders className="w-4 h-4 text-primary" />,
    category: 'Interação'
  },
  {
    type: 'button',
    label: 'Botão',
    description: 'Call-to-action ou navegação',
    icon: <MousePointer className="w-4 h-4 text-primary" />,
    category: 'Interação'
  },
  
  // Conteúdo
  {
    type: 'title',
    label: 'Título',
    description: 'Cabeçalho ou seção',
    icon: <Heading className="w-4 h-4 text-primary" />,
    category: 'Conteúdo'
  },
  {
    type: 'text',
    label: 'Texto',
    description: 'Parágrafo ou conteúdo textual',
    icon: <Type className="w-4 h-4 text-primary" />,
    category: 'Conteúdo'
  },
  {
    type: 'image',
    label: 'Imagem',
    description: 'Foto ou ilustração',
    icon: <Image className="w-4 h-4 text-primary" />,
    category: 'Conteúdo'
  },
  {
    type: 'video',
    label: 'Vídeo',
    description: 'Conteúdo audiovisual',
    icon: <Video className="w-4 h-4 text-primary" />,
    category: 'Conteúdo'
  },
  
  // Social
  {
    type: 'testimonial',
    label: 'Depoimento',
    description: 'Avaliação de cliente',
    icon: <Star className="w-4 h-4 text-primary" />,
    category: 'Social'
  },
  {
    type: 'faq',
    label: 'FAQ',
    description: 'Perguntas frequentes',
    icon: <HelpCircle className="w-4 h-4 text-primary" />,
    category: 'Social'
  },
  {
    type: 'carousel',
    label: 'Galeria de Fotos',
    description: 'Múltiplas imagens organizadas',
    icon: <RotateCcw className="w-4 h-4 text-primary" />,
    category: 'Social'
  },
  
  // Visualização
  {
    type: 'comparison',
    label: 'Comparação Visual',
    description: 'Tabela ou comparação de imagens',
    icon: <BarChart3 className="w-4 h-4 text-primary" />,
    category: 'Visualização'
  },
  {
    type: 'chart',
    label: 'Gráfico',
    description: 'Visualização de dados',
    icon: <BarChart3 className="w-4 h-4 text-primary" />,
    category: 'Visualização'
  },
  {
    type: 'pricing',
    label: 'Preços',
    description: 'Tabela de planos',
    icon: <DollarSign className="w-4 h-4 text-primary" />,
    category: 'Visualização'
  },
  
  // Efeitos
  {
    type: 'confetti',
    label: 'Confetti',
    description: 'Efeito de celebração',
    icon: <Sparkles className="w-4 h-4 text-primary" />,
    category: 'Efeitos'
  },
  {
    type: 'marquee',
    label: 'Marquee',
    description: 'Texto rolante',
    icon: <Scroll className="w-4 h-4 text-primary" />,
    category: 'Efeitos'
  },
  
  // Estrutura
  {
    type: 'terms',
    label: 'Termos',
    description: 'Checkbox de concordância',
    icon: <FileText className="w-4 h-4 text-primary" />,
    category: 'Estrutura'
  },
  {
    type: 'spacer',
    label: 'Espaçador',
    description: 'Espaço em branco',
    icon: <div className="w-4 h-4 border border-dashed border-primary rounded" />,
    category: 'Estrutura'
  }
];

const categories = [
  { id: 'all', name: 'Todos', color: 'bg-primary' },
  { id: 'Interação', name: 'Interação', color: 'bg-green-500' },
  { id: 'Conteúdo', name: 'Conteúdo', color: 'bg-blue-500' },
  { id: 'Social', name: 'Social', color: 'bg-purple-500' },
  { id: 'Visualização', name: 'Visualização', color: 'bg-orange-500' },
  { id: 'Efeitos', name: 'Efeitos', color: 'bg-pink-500' },
  { id: 'Estrutura', name: 'Estrutura', color: 'bg-gray-500' },
];

export function ComponentLibrary({ onAddComponent }: ComponentLibraryProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredComponents = COMPONENT_LIBRARY.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full bg-background">
      {/* Header sempre visível */}
      <div className="flex-shrink-0 space-y-3 p-4 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Biblioteca de Componentes</h3>
          <Badge variant="secondary" className="text-xs">
            {filteredComponents.length} itens
          </Badge>
        </div>
        
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar componentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 bg-background"
          />
        </div>

        {/* Filtros de Categoria - scroll horizontal funcional */}
        <div className="w-full relative">
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            <div className="flex gap-2 pb-3 min-w-max px-1" style={{ width: 'max-content' }}>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs flex-shrink-0 h-7 transition-all hover:scale-105 whitespace-nowrap"
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div className={`w-2 h-2 rounded-full ${category.color} mr-1.5 flex-shrink-0`} />
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Indicadores de scroll */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Lista de Componentes - área principal com scroll dinâmico */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[60vh] min-h-[400px]">
          <div className="p-4 space-y-3">
            {filteredComponents.length > 0 ? (
              <>
                {/* Componentes Populares primeiro se categoria for 'all' */}
                {activeCategory === 'all' && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-3 text-primary flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      Mais Populares
                    </h4>
                    <div className="grid gap-2">
                      {COMPONENT_LIBRARY.filter(item => ['multiple_choice', 'title', 'text', 'button', 'input', 'image'].includes(item.type)).map((component) => (
                        <ComponentItem 
                          key={`popular-${component.type}`} 
                          {...component} 
                          onAddComponent={onAddComponent}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Todos os componentes organizados por categoria */}
                <div className="space-y-2">
                  {filteredComponents.map((component) => (
                    <ComponentItem 
                      key={component.type} 
                      {...component} 
                      onAddComponent={onAddComponent}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm font-medium">Nenhum componente encontrado</p>
                <p className="text-xs mt-1">Tente outro termo de busca ou categoria</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Templates Rápidos - footer sempre visível */}
      <div className="flex-shrink-0 border-t p-4 bg-background">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Templates Rápidos
          </h4>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Menos' : 'Mais'}
          </Button>
        </div>
        
        <div className={`grid gap-2 transition-all duration-200 ${isExpanded ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 justify-start bg-background hover:bg-muted/50 transition-all hover:scale-105"
            onClick={() => {
              if (onAddComponent) {
                onAddComponent('title');
                setTimeout(() => onAddComponent('multiple_choice'), 100);
                setTimeout(() => onAddComponent('button'), 200);
              }
            }}
          >
            <Plus className="w-3 h-3 mr-2" />
            📋 Quiz Básico
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 justify-start bg-background hover:bg-muted/50 transition-all hover:scale-105"
            onClick={() => {
              if (onAddComponent) {
                onAddComponent('title');
                setTimeout(() => onAddComponent('text'), 100);
                setTimeout(() => onAddComponent('input'), 200);
                setTimeout(() => onAddComponent('button'), 300);
              }
            }}
          >
            <Plus className="w-3 h-3 mr-2" />
            📝 Formulário
          </Button>
          
          {isExpanded && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 justify-start bg-background hover:bg-muted/50 transition-all hover:scale-105"
                onClick={() => {
                  if (onAddComponent) {
                    onAddComponent('title');
                    setTimeout(() => onAddComponent('image'), 100);
                    setTimeout(() => onAddComponent('text'), 200);
                    setTimeout(() => onAddComponent('testimonial'), 300);
                  }
                }}
              >
                <Plus className="w-3 h-3 mr-2" />
                🎨 Landing Page
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 justify-start bg-background hover:bg-muted/50 transition-all hover:scale-105"
                onClick={() => {
                  if (onAddComponent) {
                    onAddComponent('title');
                    setTimeout(() => onAddComponent('chart'), 100);
                    setTimeout(() => onAddComponent('comparison'), 200);
                    setTimeout(() => onAddComponent('button'), 300);
                  }
                }}
              >
                <Plus className="w-3 h-3 mr-2" />
                📊 Dashboard
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Component } from '@/types/quiz';
import { 
  GripVertical, 
  Trash2, 
  Eye, 
  EyeOff,
  Type,
  Heading,
  Image,
  Video,
  MousePointer,
  FormInput,
  Star,
  CheckSquare,
  Sliders as SliderIcon
} from 'lucide-react';

interface ComponentRendererProps {
  component: Component;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: Partial<Component>) => void;
  onDelete?: () => void;
  isPreview?: boolean;
  isEditing?: boolean;
  responsive?: boolean;
}

function ComponentIcon({ type }: { type: Component['type'] }) {
  const iconProps = { className: "w-4 h-4" };
  
  switch (type) {
    case 'text': return <Type {...iconProps} />;
    case 'title': return <Heading {...iconProps} />;
    case 'image': return <Image {...iconProps} />;
    case 'video': return <Video {...iconProps} />;
    case 'button': return <MousePointer {...iconProps} />;
    case 'input': return <FormInput {...iconProps} />;
    case 'testimonial': return <Star {...iconProps} />;
    case 'multiple_choice': return <CheckSquare {...iconProps} />;
    case 'level_slider': return <SliderIcon {...iconProps} />;
    default: return <div className="w-4 h-4 rounded bg-muted" />;
  }
}

function ComponentPreview({ component }: { component: Component }) {
  const { type, content } = component;

  switch (type) {
    case 'title':
      return (
        <div className="py-2">
          <h2 className="text-2xl font-bold text-foreground">
            {content?.text || 'Título'}
          </h2>
        </div>
      );

    case 'text':
      return (
        <div className="py-2">
          <p className="text-foreground">
            {content?.text || 'Texto do parágrafo...'}
          </p>
        </div>
      );

    case 'image':
      return (
        <div className="py-2">
          {content?.src ? (
            <img 
              src={content.src} 
              alt={content.alt || 'Imagem'}
              className="max-w-full h-auto rounded"
            />
          ) : (
            <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
              <div className="text-center">
                <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique para adicionar imagem</p>
              </div>
            </div>
          )}
        </div>
      );

    case 'video':
      return (
        <div className="py-2">
          {content?.src ? (
            <video 
              src={content.src}
              controls={content.controls}
              autoPlay={content.autoplay}
              className="w-full rounded"
            />
          ) : (
            <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
              <div className="text-center">
                <Video className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique para adicionar vídeo</p>
              </div>
            </div>
          )}
        </div>
      );

    case 'button':
      return (
        <div className="py-2">
          <Button 
            variant={content?.style === 'secondary' ? 'secondary' : 'default'}
            className="w-full"
          >
            {content?.text || 'Clique aqui'}
          </Button>
        </div>
      );

    case 'input':
      return (
        <div className="py-2 space-y-2">
          <label className="text-sm font-medium">
            {content?.label || 'Sua resposta'}
          </label>
          <Input 
            placeholder="Digite sua resposta..."
            disabled
          />
        </div>
      );

    case 'multiple_choice':
      return (
        <div className="py-2 space-y-3">
          <h3 className="font-medium">
            {content?.question || 'Qual sua preferência?'}
          </h3>
          {content?.description && (
            <p className="text-sm text-muted-foreground">
              {content.description}
            </p>
          )}
          <div className="space-y-2">
            {(content?.options || []).map((option: any, index: number) => (
              <label key={option.id || index} 
                className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <input 
                  type={content?.allowMultiple ? 'checkbox' : 'radio'} 
                  name={`question-${component.id}`}
                  disabled
                  className="shrink-0"
                />
                <span className="flex-1">{option.label || option.value || option}</span>
                {option.score && (
                  <Badge variant="outline" className="text-xs">
                    {option.score} pts
                  </Badge>
                )}
              </label>
            ))}
          </div>
          
          {/* Indicadores de configuração */}
          <div className="flex gap-2 text-xs">
            {content?.allowMultiple && (
              <Badge variant="secondary">Múltipla escolha</Badge>
            )}
            {content?.required && (
              <Badge variant="destructive">Obrigatória</Badge>
            )}
          </div>
          
          {/* Preview da Resposta Escrita */}
          {component.writtenResponse?.enabled && (
            <div className="mt-4 p-3 border-2 border-dashed border-orange-200 rounded-lg bg-orange-50/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-orange-900">💭 Resposta por escrito</span>
                {component.writtenResponse.required && (
                  <span className="text-xs text-red-500">*</span>
                )}
              </div>
              {component.writtenResponse.allowMultiline ? (
                <Textarea
                  placeholder={component.writtenResponse.placeholder || 'Digite sua resposta aqui...'}
                  disabled
                  rows={3}
                  className="border-orange-200"
                />
              ) : (
                <Input
                  placeholder={component.writtenResponse.placeholder || 'Digite sua resposta aqui...'}
                  disabled
                  className="border-orange-200"
                />
              )}
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>
                  {component.writtenResponse.validation && component.writtenResponse.validation !== 'none' && 
                    `Validação: ${component.writtenResponse.validation}`
                  }
                </span>
                {component.writtenResponse.maxLength && (
                  <span>Máx: {component.writtenResponse.maxLength} caracteres</span>
                )}
              </div>
            </div>
          )}
        </div>
      );

    case 'level_slider':
      return (
        <div className="py-2 space-y-3">
          <h3 className="font-medium">
            {content?.question || content?.label || 'Avalie de 1 a 10'}
          </h3>
          {content?.description && (
            <p className="text-sm text-muted-foreground">
              {content.description}
            </p>
          )}
          <div className="px-2">
            <input 
              type="range"
              min={content?.min || 1}
              max={content?.max || 10}
              step={content?.step || 1}
              defaultValue={content?.defaultValue || 5}
              disabled
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{content?.min || 1}</span>
              <span>Valor: {content?.defaultValue || 5}</span>
              <span>{content?.max || 10}</span>
            </div>
          </div>
          
          {/* Indicadores de configuração */}
          <div className="flex gap-2 text-xs">
            <Badge variant="secondary">
              Escala {content?.min || 1} - {content?.max || 10}
            </Badge>
            {content?.required && (
              <Badge variant="destructive">Obrigatória</Badge>
            )}
          </div>
        </div>
      );

    case 'testimonial':
      return (
        <div className="py-2">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              {content?.avatar ? (
                <img 
                  src={content.avatar} 
                  alt={content.author}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Star className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <blockquote className="text-sm italic">
                  "{content?.quote || 'Excelente produto!'}"
                </blockquote>
                <cite className="text-xs text-muted-foreground mt-1 block">
                  — {content?.author || 'Cliente satisfeito'}
                </cite>
              </div>
            </div>
          </Card>
        </div>
      );

    case 'spacer':
      return (
        <div 
          className="border-2 border-dashed border-muted rounded"
          style={{ height: content?.height || '20px' }}
        >
          <div className="h-full flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Espaçador</span>
          </div>
        </div>
      );

    default:
      return (
        <div className="py-2">
          <Card className="p-4 border-dashed">
            <div className="text-center">
              <ComponentIcon type={type} />
              <p className="text-sm text-muted-foreground mt-1">
                Componente {type}
              </p>
            </div>
          </Card>
        </div>
      );
  }
}

export function ComponentRenderer({
  component,
  isSelected,
  onSelect,
  onUpdate,
  onDelete
}: ComponentRendererProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      {/* Component Wrapper */}
      <div
        className={`relative border-2 rounded-lg transition-all cursor-pointer ${
          isSelected 
            ? 'border-primary bg-primary/5 shadow-sm' 
            : 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/20'
        }`}
        onClick={onSelect}
      >
        {/* Selection Header */}
        {(isSelected || isDragging) && (
          <div className={`absolute -top-8 left-0 right-0 flex items-center justify-between px-3 py-1 rounded-t-lg text-xs transition-all ${
            isDragging ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-primary text-primary-foreground'
          }`}>
            <div className="flex items-center gap-2">
              <ComponentIcon type={component.type} />
              <span className="font-medium capitalize">{component.type.replace('_', ' ')}</span>
              {isDragging && <span className="text-xs opacity-75">(arrastando)</span>}
            </div>
            
            <div className="flex items-center gap-1">
              <button
                {...attributes}
                {...listeners}
                className={`p-1 rounded transition-all ${
                  isDragging ? 'cursor-grabbing bg-primary-foreground/20' : 'cursor-grab hover:bg-primary-foreground/20'
                }`}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-3 h-3" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="hover:bg-destructive/20 p-1 rounded text-destructive-foreground transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Drag Handle para componentes não selecionados */}
        {!isSelected && !isDragging && (
          <div className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              {...attributes}
              {...listeners}
              className="bg-primary text-primary-foreground p-1 rounded shadow-lg cursor-grab hover:cursor-grab hover:scale-110 transition-all"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Component Content */}
        <div className={`p-4 transition-all ${isDragging ? 'scale-95' : ''}`}>
          <ComponentPreview component={component} />
        </div>
        
        {/* Indicador visual durante drag */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 rounded-lg border-2 border-primary border-dashed" />
        )}
      </div>
    </div>
  );
}
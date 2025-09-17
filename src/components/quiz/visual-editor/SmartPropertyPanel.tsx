import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Component, ComponentType } from '@/types/quiz';
import { 
  Settings, Palette, Eye, Code, Trash2, Copy, 
  Type, Image, MousePointer, BarChart3, Plus, Minus
} from 'lucide-react';

interface SmartPropertyPanelProps {
  component: Component | null;
  onUpdate: (componentId: string, updates: Partial<Component>) => void;
  onDelete: (componentId: string) => void;
  onDuplicate?: (componentId: string) => void;
}

export function SmartPropertyPanel({
  component,
  onUpdate,
  onDelete,
  onDuplicate
}: SmartPropertyPanelProps) {
  const [activeTab, setActiveTab] = useState('content');

  const handleContentUpdate = useCallback((field: string, value: unknown) => {
    if (!component) return;
    
    onUpdate(component.id, {
      content: {
        ...component.content,
        [field]: value
      }
    });
  }, [component, onUpdate]);

  const handleStyleUpdate = useCallback((field: string, value: unknown) => {
    if (!component) return;
    
    onUpdate(component.id, {
      style: {
        ...component.style,
        [field]: value
      }
    });
  }, [component, onUpdate]);

  const handleArrayUpdate = useCallback((field: string, index: number, value: unknown) => {
    if (!component) return;
    
    const currentArray = component.content[field] || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    
    handleContentUpdate(field, newArray);
  }, [component, handleContentUpdate]);

  const handleArrayAdd = useCallback((field: string, defaultItem: unknown) => {
    if (!component) return;
    
    const currentArray = component.content[field] || [];
    handleContentUpdate(field, [...currentArray, defaultItem]);
  }, [component, handleContentUpdate]);

  const handleArrayRemove = useCallback((field: string, index: number) => {
    if (!component) return;
    
    const currentArray = component.content[field] || [];
    const newArray = currentArray.filter((_: unknown, i: number) => i !== index);
    handleContentUpdate(field, newArray);
  }, [component, handleContentUpdate]);

  if (!component) {
    return (
      <div className="h-full flex items-center justify-center text-center p-6">
        <div>
          <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="font-semibold mb-2">Nenhum Componente Selecionado</h3>
          <p className="text-sm text-muted-foreground">
            Clique em um componente no canvas para editar suas propriedades
          </p>
        </div>
      </div>
    );
  }

  const renderContentEditor = () => {
    switch (component.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label>Texto</Label>
              <Textarea
                value={component.content?.text || ''}
                onChange={(e) => handleContentUpdate('text', e.target.value)}
                placeholder="Digite o texto aqui..."
                rows={3}
              />
            </div>
            <div>
              <Label>Estilo</Label>
              <Select
                value={component.content?.style || 'normal'}
                onValueChange={(value) => handleContentUpdate('style', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="lead">Destaque</SelectItem>
                  <SelectItem value="small">Pequeno</SelectItem>
                  <SelectItem value="muted">Discreto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'title':
        return (
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={component.content?.text || ''}
                onChange={(e) => handleContentUpdate('text', e.target.value)}
                placeholder="Digite o título..."
              />
            </div>
            <div>
              <Label>Nível</Label>
              <Select
                value={component.content?.level || 'h2'}
                onValueChange={(value) => handleContentUpdate('level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1 - Principal</SelectItem>
                  <SelectItem value="h2">H2 - Seção</SelectItem>
                  <SelectItem value="h3">H3 - Subseção</SelectItem>
                  <SelectItem value="h4">H4 - Menor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <Label>Texto do Botão</Label>
              <Input
                value={component.content?.text || ''}
                onChange={(e) => handleContentUpdate('text', e.target.value)}
                placeholder="Clique aqui"
              />
            </div>
            <div>
              <Label>Ação</Label>
              <Select
                value={component.content?.action || 'next'}
                onValueChange={(value) => handleContentUpdate('action', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next">Próxima Etapa</SelectItem>
                  <SelectItem value="submit">Enviar Formulário</SelectItem>
                  <SelectItem value="finish">Finalizar Quiz</SelectItem>
                  <SelectItem value="external">Link Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Variante</Label>
              <Select
                value={component.content?.variant || 'default'}
                onValueChange={(value) => handleContentUpdate('variant', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="destructive">Destrutivo</SelectItem>
                  <SelectItem value="outline">Contorno</SelectItem>
                  <SelectItem value="secondary">Secundário</SelectItem>
                  <SelectItem value="ghost">Fantasma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'input':
        return (
          <div className="space-y-4">
            <div>
              <Label>Rótulo</Label>
              <Input
                value={component.content?.label || ''}
                onChange={(e) => handleContentUpdate('label', e.target.value)}
                placeholder="Nome do campo"
              />
            </div>
            <div>
              <Label>Placeholder</Label>
              <Input
                value={component.content?.placeholder || ''}
                onChange={(e) => handleContentUpdate('placeholder', e.target.value)}
                placeholder="Digite sua resposta..."
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={component.content?.type || 'text'}
                onValueChange={(value) => handleContentUpdate('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="tel">Telefone</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="textarea">Texto Longo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={component.content?.required || false}
                onCheckedChange={(checked) => handleContentUpdate('required', checked)}
              />
              <Label>Campo obrigatório</Label>
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <div>
              <Label>Pergunta</Label>
              <Input
                value={component.content?.question || ''}
                onChange={(e) => handleContentUpdate('question', e.target.value)}
                placeholder="Qual sua pergunta?"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Opções</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleArrayAdd('options', { 
                    id: Date.now().toString(), 
                    label: 'Nova opção', 
                    score: 0 
                  })}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              <div className="space-y-2">
                {(component.content?.options || []).map((option: { id?: string; label?: string }, index: number) => (
                  <div key={option.id || index} className="flex items-center gap-2">
                    <Input
                      value={option.label || ''}
                      onChange={(e) => handleArrayUpdate('options', index, {
                        ...option,
                        label: e.target.value
                      })}
                      placeholder={`Opção ${index + 1}`}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={option.score || 0}
                      onChange={(e) => handleArrayUpdate('options', index, {
                        ...option,
                        score: parseInt(e.target.value) || 0
                      })}
                      placeholder="Pontos"
                      className="w-20"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleArrayRemove('options', index)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={component.content?.allowMultiple || false}
                onCheckedChange={(checked) => handleContentUpdate('allowMultiple', checked)}
              />
              <Label>Permitir múltiplas seleções</Label>
            </div>
          </div>
        );

      case 'level_slider':
        return (
          <div className="space-y-4">
            <div>
              <Label>Rótulo</Label>
              <Input
                value={component.content?.label || ''}
                onChange={(e) => handleContentUpdate('label', e.target.value)}
                placeholder="Avalie de 1 a 10"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Valor Mínimo</Label>
                <Input
                  type="number"
                  value={component.content?.min || 1}
                  onChange={(e) => handleContentUpdate('min', parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label>Valor Máximo</Label>
                <Input
                  type="number"
                  value={component.content?.max || 10}
                  onChange={(e) => handleContentUpdate('max', parseInt(e.target.value) || 10)}
                />
              </div>
            </div>
            <div>
              <Label>Valor Padrão</Label>
              <Input
                type="number"
                value={component.content?.defaultValue || 5}
                onChange={(e) => handleContentUpdate('defaultValue', parseInt(e.target.value) || 5)}
              />
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label>URL da Imagem</Label>
              <Input
                value={component.content?.src || ''}
                onChange={(e) => handleContentUpdate('src', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            <div>
              <Label>Texto Alternativo</Label>
              <Input
                value={component.content?.alt || ''}
                onChange={(e) => handleContentUpdate('alt', e.target.value)}
                placeholder="Descrição da imagem"
              />
            </div>
            <div>
              <Label>Largura</Label>
              <Select
                value={component.content?.width || '100%'}
                onValueChange={(value) => handleContentUpdate('width', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25%">25%</SelectItem>
                  <SelectItem value="50%">50%</SelectItem>
                  <SelectItem value="75%">75%</SelectItem>
                  <SelectItem value="100%">100%</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <Code className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Editor específico para {component.type} em desenvolvimento
            </p>
          </div>
        );
    }
  };

  const renderStyleEditor = () => (
    <div className="space-y-4">
      <div>
        <Label>Cor do Texto</Label>
        <Input
          type="color"
          value={component.style?.textColor || '#000000'}
          onChange={(e) => handleStyleUpdate('textColor', e.target.value)}
        />
      </div>
      <div>
        <Label>Cor de Fundo</Label>
        <Input
          type="color"
          value={component.style?.backgroundColor || '#ffffff'}
          onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
        />
      </div>
      <div>
        <Label>Tamanho da Fonte</Label>
        <Select
          value={component.style?.fontSize || '16px'}
          onValueChange={(value) => handleStyleUpdate('fontSize', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12px">Pequeno (12px)</SelectItem>
            <SelectItem value="14px">Normal (14px)</SelectItem>
            <SelectItem value="16px">Médio (16px)</SelectItem>
            <SelectItem value="18px">Grande (18px)</SelectItem>
            <SelectItem value="24px">Muito Grande (24px)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Alinhamento</Label>
        <Select
          value={component.style?.textAlign || 'left'}
          onValueChange={(value) => handleStyleUpdate('textAlign', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Esquerda</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
            <SelectItem value="right">Direita</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Espaçamento (Padding)</Label>
        <Input
          value={component.style?.padding || ''}
          onChange={(e) => handleStyleUpdate('padding', e.target.value)}
          placeholder="16px ou 16px 24px"
        />
      </div>
      <div>
        <Label>Margem</Label>
        <Input
          value={component.style?.margin || ''}
          onChange={(e) => handleStyleUpdate('margin', e.target.value)}
          placeholder="16px ou 16px 24px"
        />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            {getComponentIcon(component.type)}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{getComponentName(component.type)}</h3>
            <p className="text-xs text-muted-foreground">ID: {component.id.slice(-8)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {onDuplicate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDuplicate(component.id)}
              title="Duplicar componente"
            >
              <Copy className="w-3 h-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(component.id)}
            title="Excluir componente"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="text-xs">
                <Settings className="w-3 h-3 mr-1" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="style" className="text-xs">
                <Palette className="w-3 h-3 mr-1" />
                Estilo
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Preview
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            <TabsContent value="content" className="mt-0">
              {renderContentEditor()}
            </TabsContent>

            <TabsContent value="style" className="mt-0">
              {renderStyleEditor()}
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-medium mb-2 text-sm">Preview do Componente</h4>
                <div className="bg-white rounded border p-3">
                  {/* Aqui seria renderizado o preview real do componente */}
                  <div className="text-center text-sm text-muted-foreground">
                    Preview em desenvolvimento
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function getComponentIcon(type: ComponentType): React.ReactNode {
  const iconMap: Record<ComponentType, React.ReactNode> = {
    text: <Type className="w-4 h-4" />,
    title: <Type className="w-4 h-4" />,
    image: <Image className="w-4 h-4" />,
    video: <Image className="w-4 h-4" />,
    button: <MousePointer className="w-4 h-4" />,
    input: <Type className="w-4 h-4" />,
    multiple_choice: <MousePointer className="w-4 h-4" />,
    level_slider: <BarChart3 className="w-4 h-4" />,
    faq: <Type className="w-4 h-4" />,
    testimonial: <Type className="w-4 h-4" />,
    carousel: <Image className="w-4 h-4" />,
    comparison: <BarChart3 className="w-4 h-4" />,
    chart: <BarChart3 className="w-4 h-4" />,
    confetti: <Settings className="w-4 h-4" />,
    pricing: <BarChart3 className="w-4 h-4" />,
    marquee: <Type className="w-4 h-4" />,
    spacer: <Settings className="w-4 h-4" />,
    terms: <Type className="w-4 h-4" />,
    rating: <BarChart3 className="w-4 h-4" />
  };
  
  return iconMap[type] || <Settings className="w-4 h-4" />;
}

function getComponentName(type: ComponentType): string {
  const nameMap: Record<ComponentType, string> = {
    text: 'Texto',
    title: 'Título',
    image: 'Imagem',
    video: 'Vídeo',
    button: 'Botão',
    input: 'Campo de Entrada',
    multiple_choice: 'Múltipla Escolha',
    level_slider: 'Slider de Nível',
    faq: 'FAQ',
    testimonial: 'Depoimento',
    carousel: 'Galeria',
    comparison: 'Comparação',
    chart: 'Gráfico',
    confetti: 'Confetti',
    pricing: 'Tabela de Preços',
    marquee: 'Texto Rolante',
    spacer: 'Espaçador',
    terms: 'Termos',
    rating: 'Avaliação'
  };
  
  return nameMap[type] || type;
}
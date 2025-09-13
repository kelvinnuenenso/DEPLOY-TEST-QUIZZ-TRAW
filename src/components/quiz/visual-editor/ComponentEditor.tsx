import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Component, ComponentStyle, ComponentCondition, QuizStep, ResponseBranch, WrittenResponseConfig } from '@/types/quiz';
import { ResponseBranching } from './ResponseBranching';
import { FunnelPreview } from './FunnelPreview';
import { FunnelExamples } from './FunnelExamples';
import {
  Settings, Palette, Zap, Copy, Trash2, Eye, EyeOff,
  Image, Link, Type, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, GitBranch, Plus, PenTool
} from 'lucide-react';

interface ComponentEditorProps {
  component: Component;
  onUpdate: (updates: Partial<Component>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  availableSteps?: QuizStep[];
}

export function ComponentEditor({
  component,
  onUpdate,
  onDelete,
  onDuplicate,
  availableSteps = []
}: ComponentEditorProps) {
  const [activeTab, setActiveTab] = useState('content');

  const updateContent = (updates: any) => {
    onUpdate({
      content: { ...component.content, ...updates },
      // Preserve writtenResponse if being updated
      ...(updates.writtenResponse && { writtenResponse: updates.writtenResponse })
    });
  };

  const updateStyle = (updates: Partial<ComponentStyle>) => {
    onUpdate({
      style: { ...component.style, ...updates }
    });
  };

  const addCondition = () => {
    const newCondition: ComponentCondition = {
      type: 'show_if',
      field: '',
      operator: 'equals',
      value: ''
    };

    onUpdate({
      conditions: [...(component.conditions || []), newCondition]
    });
  };

  const updateCondition = (index: number, updates: Partial<ComponentCondition>) => {
    const updatedConditions = [...(component.conditions || [])];
    updatedConditions[index] = { ...updatedConditions[index], ...updates };
    onUpdate({ conditions: updatedConditions });
  };

  const removeCondition = (index: number) => {
    const updatedConditions = [...(component.conditions || [])];
    updatedConditions.splice(index, 1);
    onUpdate({ conditions: updatedConditions });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{getComponentDisplayName(component.type)}</h3>
          <p className="text-xs text-muted-foreground">ID: {component.id.slice(0, 8)}</p>
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Tabs de Edição */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="gap-2">
            <Settings className="w-4 h-4" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="style" className="gap-2">
            <Palette className="w-4 h-4" />
            Estilo
          </TabsTrigger>
          <TabsTrigger value="branching" className="gap-2">
            <GitBranch className="w-4 h-4" />
            Funil
          </TabsTrigger>
          <TabsTrigger value="logic" className="gap-2">
            <Zap className="w-4 h-4" />
            Lógica
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px] mt-4">
          {/* Aba de Conteúdo */}
          <TabsContent value="content" className="space-y-4">
            {renderContentEditor(component, updateContent, onUpdate)}
          </TabsContent>

          {/* Aba de Estilo */}
          <TabsContent value="style" className="space-y-4">
            {renderStyleEditor(component.style || {}, updateStyle)}
          </TabsContent>

          {/* Aba de Funil/Ramificação */}
          <TabsContent value="branching" className="space-y-4">
            {renderBranchingEditor(component, updateContent)}
          </TabsContent>

          {/* Aba de Lógica */}
          <TabsContent value="logic" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium">Condições de Exibição</h4>
                <Button size="sm" onClick={addCondition}>
                  <Zap className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {component.conditions?.length ? (
                <div className="space-y-3">
                  {component.conditions.map((condition, index) => (
                    <Card key={index} className="p-3 border-dashed">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Select
                            value={condition.type}
                            onValueChange={(value: any) => updateCondition(index, { type: value })}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="show_if">Mostrar se</SelectItem>
                              <SelectItem value="hide_if">Ocultar se</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeCondition(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            placeholder="Campo"
                            value={condition.field}
                            onChange={(e) => updateCondition(index, { field: e.target.value })}
                          />
                          <Select
                            value={condition.operator}
                            onValueChange={(value: any) => updateCondition(index, { operator: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Igual a</SelectItem>
                              <SelectItem value="not_equals">Diferente de</SelectItem>
                              <SelectItem value="contains">Contém</SelectItem>
                              <SelectItem value="greater_than">Maior que</SelectItem>
                              <SelectItem value="less_than">Menor que</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Valor"
                            value={condition.value}
                            onChange={(e) => updateCondition(index, { value: e.target.value })}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma condição definida</p>
                  <p className="text-xs">Este componente será sempre exibido</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

// Função para renderizar editor de ramificação/funil
function renderBranchingEditor(component: Component, updateContent: (updates: any) => void) {
  // Só exibir para componentes que suportam múltiplas escolhas
  if (component.type !== 'multiple_choice' && !component.content.options) {
    return (
      <Card className="p-6 text-center">
        <GitBranch className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <h4 className="font-medium mb-2">Funil não disponível</h4>
        <p className="text-sm text-muted-foreground">
          Esta funcionalidade está disponível apenas para componentes com múltiplas opções de resposta.
        </p>
      </Card>
    );
  }

  const options = component.content.options || [];
  const branches = component.content.branches || [];

  return (
    <div className="space-y-6">
      <FunnelExamples
        onApplyExample={(example) => {
          updateContent({ 
            options: example.options,
            branches: example.branches
          });
        }}
      />
      
      <ResponseBranching
        options={options}
        branches={branches}
        availableSteps={[]} // Será passado do componente pai
        onBranchesUpdate={(newBranches: ResponseBranch[]) => updateContent({ branches: newBranches })}
      />
      
      <FunnelPreview
        options={options}
        branches={branches}
        onTestFunnel={() => {
          // Implementar teste do funil
          console.log('Testando funil:', { options, branches });
        }}
      />
    </div>
  );
}

// Função para renderizar editor de conteúdo específico por tipo
function renderContentEditor(component: Component, updateContent: (updates: any) => void, onUpdate: (updates: Partial<Component>) => void) {
  switch (component.type) {
    case 'text':
      return (
        <Card className="p-4 space-y-4">
          <div>
            <Label htmlFor="text">Texto</Label>
            <Textarea
              id="text"
              value={component.content.text || ''}
              onChange={(e) => updateContent({ text: e.target.value })}
              placeholder="Digite o texto aqui..."
              rows={4}
            />
          </div>
        </Card>
      );

    case 'title':
      return (
        <Card className="p-4 space-y-4">
          <div>
            <Label htmlFor="title-text">Texto do Título</Label>
            <Input
              id="title-text"
              value={component.content.text || ''}
              onChange={(e) => updateContent({ text: e.target.value })}
              placeholder="Título da seção"
            />
          </div>
          <div>
            <Label htmlFor="title-level">Nível do Título</Label>
            <Select
              value={component.content.level?.toString() || '1'}
              onValueChange={(value) => updateContent({ level: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">H1 - Principal</SelectItem>
                <SelectItem value="2">H2 - Seção</SelectItem>
                <SelectItem value="3">H3 - Subseção</SelectItem>
                <SelectItem value="4">H4 - Menor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      );

    case 'button':
      return (
        <Card className="p-4 space-y-4">
          <div>
            <Label htmlFor="button-text">Texto do Botão</Label>
            <Input
              id="button-text"
              value={component.content.text || ''}
              onChange={(e) => updateContent({ text: e.target.value })}
              placeholder="Clique aqui"
            />
          </div>
          <div>
            <Label htmlFor="button-action">Ação</Label>
            <Select
              value={component.content.action || 'next_step'}
              onValueChange={(value) => updateContent({ action: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="next_step">Próxima etapa</SelectItem>
                <SelectItem value="previous_step">Etapa anterior</SelectItem>
                <SelectItem value="external_link">Link externo</SelectItem>
                <SelectItem value="submit">Enviar formulário</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {component.content.action === 'external_link' && (
            <div>
              <Label htmlFor="button-url">URL</Label>
              <Input
                id="button-url"
                value={component.content.url || ''}
                onChange={(e) => updateContent({ url: e.target.value })}
                placeholder="https://exemplo.com"
              />
            </div>
          )}
        </Card>
      );

    case 'image':
      return (
        <Card className="p-4 space-y-4">
          <div>
            <Label htmlFor="image-src">URL da Imagem</Label>
            <Input
              id="image-src"
              value={component.content.src || ''}
              onChange={(e) => updateContent({ src: e.target.value })}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>
          <div>
            <Label htmlFor="image-alt">Texto Alternativo</Label>
            <Input
              id="image-alt"
              value={component.content.alt || ''}
              onChange={(e) => updateContent({ alt: e.target.value })}
              placeholder="Descrição da imagem"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="image-width">Largura</Label>
              <Input
                id="image-width"
                type="number"
                value={component.content.width || ''}
                onChange={(e) => updateContent({ width: parseInt(e.target.value) })}
                placeholder="300"
              />
            </div>
            <div>
              <Label htmlFor="image-height">Altura</Label>
              <Input
                id="image-height"
                type="number"
                value={component.content.height || ''}
                onChange={(e) => updateContent({ height: parseInt(e.target.value) })}
                placeholder="200"
              />
            </div>
          </div>
        </Card>
      );

    case 'input':
      return (
        <Card className="p-4 space-y-4">
          <div>
            <Label htmlFor="input-type">Tipo de Campo</Label>
            <Select
              value={component.content.type || 'text'}
              onValueChange={(value) => updateContent({ type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
                <SelectItem value="number">Número</SelectItem>
                <SelectItem value="date">Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="input-placeholder">Placeholder</Label>
            <Input
              id="input-placeholder"
              value={component.content.placeholder || ''}
              onChange={(e) => updateContent({ placeholder: e.target.value })}
              placeholder="Digite aqui..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="input-required"
              checked={component.content.required || false}
              onCheckedChange={(checked) => updateContent({ required: checked })}
            />
            <Label htmlFor="input-required">Campo obrigatório</Label>
          </div>
        </Card>
      );

    case 'multiple_choice':
      const writtenConfig = component.writtenResponse || { enabled: false };
      
      const updateWrittenResponse = (updates: Partial<WrittenResponseConfig>) => {
        onUpdate({
          writtenResponse: { ...writtenConfig, ...updates }
        });
      };

      return (
        <Card className="p-4 space-y-4">
          <div>
            <Label>Pergunta</Label>
            <Input
              value={component.content.question || ''}
              onChange={(e) => updateContent({ question: e.target.value })}
              placeholder="Digite sua pergunta..."
            />
          </div>
          
          {/* Configuração de Resposta Escrita */}
          <Card className="p-4 space-y-4 border-orange-200 bg-orange-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-orange-600" />
                <Label className="text-sm font-medium text-orange-900">Resposta por escrito</Label>
              </div>
              <Switch
                checked={writtenConfig.enabled}
                onCheckedChange={(enabled) => updateWrittenResponse({ enabled })}
              />
            </div>

            {writtenConfig.enabled && (
              <div className="space-y-4 pl-6 border-l-2 border-orange-200">
                <div>
                  <Label htmlFor="written-placeholder">Placeholder</Label>
                  <Input
                    id="written-placeholder"
                    value={writtenConfig.placeholder || ''}
                    onChange={(e) => updateWrittenResponse({ placeholder: e.target.value })}
                    placeholder="Digite sua resposta aqui..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="written-min">Caracteres mínimos</Label>
                    <Input
                      id="written-min"
                      type="number"
                      value={writtenConfig.minLength || ''}
                      onChange={(e) => updateWrittenResponse({ minLength: parseInt(e.target.value) || undefined })}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="written-max">Caracteres máximos</Label>
                    <Input
                      id="written-max"
                      type="number"
                      value={writtenConfig.maxLength || ''}
                      onChange={(e) => updateWrittenResponse({ maxLength: parseInt(e.target.value) || undefined })}
                      placeholder="500"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="written-validation">Tipo de validação</Label>
                  <Select
                    value={writtenConfig.validation || 'none'}
                    onValueChange={(value: any) => updateWrittenResponse({ validation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="text">Apenas texto</SelectItem>
                      <SelectItem value="number">Apenas números</SelectItem>
                      <SelectItem value="email">E-mail válido</SelectItem>
                      <SelectItem value="phone">Telefone válido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={writtenConfig.allowMultiline || false}
                    onCheckedChange={(checked) => updateWrittenResponse({ allowMultiline: checked })}
                  />
                  <Label>Permitir múltiplas linhas</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={writtenConfig.required || false}
                    onCheckedChange={(checked) => updateWrittenResponse({ required: checked })}
                  />
                  <Label>Resposta obrigatória</Label>
                </div>
              </div>
            )}
          </Card>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Opções de Resposta</Label>
              <Button
                size="sm"
                onClick={() => {
                  const currentOptions = component.content.options || [];
                  const newOption = {
                    id: `option-${Date.now()}`,
                    label: `Opção ${currentOptions.length + 1}`,
                    value: `option_${currentOptions.length + 1}`
                  };
                  updateContent({ options: [...currentOptions, newOption] });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Opção
              </Button>
            </div>
            
            <div className="space-y-3">
              {(component.content.options || []).map((option: any, index: number) => (
                <div key={option.id} className="flex gap-2">
                  <Input
                    value={option.label}
                    onChange={(e) => {
                      const updatedOptions = [...(component.content.options || [])];
                      updatedOptions[index] = { ...option, label: e.target.value };
                      updateContent({ options: updatedOptions });
                    }}
                    placeholder={`Opção ${index + 1}`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const filteredOptions = (component.content.options || []).filter((_: any, i: number) => i !== index);
                      updateContent({ options: filteredOptions });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={component.content.allowMultiple || false}
              onCheckedChange={(checked) => updateContent({ allowMultiple: checked })}
            />
            <Label>Permitir múltiplas respostas</Label>
          </div>
        </Card>
      );

    default:
      return (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            Editor específico para {component.type} não implementado ainda.
          </p>
        </Card>
      );
  }
}

// Função para renderizar editor de estilo
function renderStyleEditor(style: ComponentStyle, updateStyle: (updates: Partial<ComponentStyle>) => void) {
  return (
    <div className="space-y-4">
      {/* Tipografia */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-4">Tipografia</h4>
        <div className="space-y-4">
          <div>
            <Label>Tamanho da Fonte</Label>
            <Select
              value={style.fontSize || '1rem'}
              onValueChange={(value) => updateStyle({ fontSize: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.75rem">Pequeno</SelectItem>
                <SelectItem value="1rem">Normal</SelectItem>
                <SelectItem value="1.25rem">Médio</SelectItem>
                <SelectItem value="1.5rem">Grande</SelectItem>
                <SelectItem value="2rem">Muito Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Alinhamento</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={style.textAlign === 'left' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateStyle({ textAlign: 'left' })}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant={style.textAlign === 'center' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateStyle({ textAlign: 'center' })}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant={style.textAlign === 'right' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateStyle({ textAlign: 'right' })}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Cores */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-4">Cores</h4>
        <div className="space-y-4">
          <div>
            <Label>Cor do Texto</Label>
            <div className="flex gap-2 mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <div 
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: style.textColor || '#000000' }}
                    />
                    {style.textColor || '#000000'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4">
                  <HexColorPicker
                    color={style.textColor || '#000000'}
                    onChange={(color) => updateStyle({ textColor: color })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label>Cor de Fundo</Label>
            <div className="flex gap-2 mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <div 
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: style.backgroundColor || 'transparent' }}
                    />
                    {style.backgroundColor || 'Transparente'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4">
                  <HexColorPicker
                    color={style.backgroundColor || '#ffffff'}
                    onChange={(color) => updateStyle({ backgroundColor: color })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </Card>

      {/* Espaçamento */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-4">Espaçamento</h4>
        <div className="space-y-4">
          <div>
            <Label>Padding Interno</Label>
            <Input
              value={style.padding || ''}
              onChange={(e) => updateStyle({ padding: e.target.value })}
              placeholder="16px"
            />
          </div>
          <div>
            <Label>Margem Externa</Label>
            <Input
              value={style.margin || ''}
              onChange={(e) => updateStyle({ margin: e.target.value })}
              placeholder="8px"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function getComponentDisplayName(type: string): string {
  const names: Record<string, string> = {
    text: 'Texto',
    title: 'Título',
    image: 'Imagem',
    video: 'Vídeo',
    button: 'Botão',
    input: 'Campo de Entrada',
    faq: 'FAQ',
    testimonial: 'Depoimento',
    carousel: 'Carrossel',
    comparison: 'Comparação',
    chart: 'Gráfico',
    confetti: 'Confetti',
    pricing: 'Preços',
    marquee: 'Marquise',
    spacer: 'Espaçador',
    terms: 'Termos',
    multiple_choice: 'Múltipla Escolha',
    level_slider: 'Slider de Nível'
  };
  
  return names[type] || type;
}
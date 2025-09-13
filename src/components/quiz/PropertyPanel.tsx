import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Quiz, QuizStep, Component } from '@/types/quiz';
import { 
  Settings, 
  Palette, 
  Eye, 
  Layers,
  Plus,
  X,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface PropertyPanelProps {
  quiz: Quiz;
  stage: QuizStep | null;
  component: Component | null;
  onUpdateQuiz: (updates: Partial<Quiz>) => void;
  onUpdateStage: (updates: Partial<QuizStep>) => void;
  onUpdateComponent: (updates: Partial<Component>) => void;
}

export function PropertyPanel({
  quiz,
  stage,
  component,
  onUpdateQuiz,
  onUpdateStage,
  onUpdateComponent
}: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState('content');

  if (!stage && !component) {
    return (
      <div className="h-full border-l bg-muted/30 p-4">
        <div className="text-center space-y-4 mt-12">
          <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
            <Settings className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Painel de Propriedades</h3>
            <p className="text-muted-foreground text-sm">
              Selecione uma etapa ou componente para editar suas propriedades
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full border-l bg-background">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          {component ? (
            <>
              <Layers className="w-4 h-4 text-primary" />
              <span className="font-medium capitalize">
                {component.type.replace('_', ' ')}
              </span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-primary" />
              <span className="font-medium">
                {stage?.name || 'Etapa'}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {component ? (
          <ComponentProperties 
            component={component}
            onUpdate={onUpdateComponent}
          />
        ) : stage ? (
          <StageProperties 
            stage={stage}
            onUpdate={onUpdateStage}
          />
        ) : null}
      </div>
    </div>
  );
}

interface ComponentPropertiesProps {
  component: Component;
  onUpdate: (updates: Partial<Component>) => void;
}

function ComponentProperties({ component, onUpdate }: ComponentPropertiesProps) {
  const updateContent = (updates: any) => {
    onUpdate({
      content: { ...component.content, ...updates }
    });
  };

  const renderContentEditor = () => {
    switch (component.type) {
      case 'title':
        return (
          <div className="space-y-4">
            <div>
              <Label>Texto do Título</Label>
              <Input
                value={component.content?.text || ''}
                onChange={(e) => updateContent({ text: e.target.value })}
                placeholder="Digite o título"
              />
            </div>
            <div>
              <Label>Nível</Label>
              <Select
                value={component.content?.level || 'h2'}
                onValueChange={(value) => updateContent({ level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1 - Principal</SelectItem>
                  <SelectItem value="h2">H2 - Seção</SelectItem>
                  <SelectItem value="h3">H3 - Subseção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label>Conteúdo</Label>
              <Textarea
                value={component.content?.text || ''}
                onChange={(e) => updateContent({ text: e.target.value })}
                placeholder="Digite o texto"
                rows={4}
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
                onChange={(e) => updateContent({ src: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Texto Alternativo</Label>
              <Input
                value={component.content?.alt || ''}
                onChange={(e) => updateContent({ alt: e.target.value })}
                placeholder="Descrição da imagem"
              />
            </div>
            <div>
              <Label>Largura</Label>
              <Select
                value={component.content?.width || '100%'}
                onValueChange={(value) => updateContent({ width: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100%">100% - Largura total</SelectItem>
                  <SelectItem value="75%">75% - Três quartos</SelectItem>
                  <SelectItem value="50%">50% - Metade</SelectItem>
                  <SelectItem value="25%">25% - Um quarto</SelectItem>
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
                onChange={(e) => updateContent({ text: e.target.value })}
                placeholder="Clique aqui"
              />
            </div>
            <div>
              <Label>Estilo</Label>
              <Select
                value={component.content?.style || 'primary'}
                onValueChange={(value) => updateContent({ style: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primário</SelectItem>
                  <SelectItem value="secondary">Secundário</SelectItem>
                  <SelectItem value="outline">Contorno</SelectItem>
                  <SelectItem value="ghost">Fantasma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ação</Label>
              <Select
                value={component.content?.action || 'next'}
                onValueChange={(value) => updateContent({ action: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next">Próxima etapa</SelectItem>
                  <SelectItem value="submit">Enviar formulário</SelectItem>
                  <SelectItem value="link">Abrir link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {component.content?.action === 'link' && (
              <div>
                <Label>URL do Link</Label>
                <Input
                  value={component.content?.url || ''}
                  onChange={(e) => updateContent({ url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
        );

      case 'input':
        return (
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                value={component.content?.label || ''}
                onChange={(e) => updateContent({ label: e.target.value })}
                placeholder="Sua resposta"
              />
            </div>
            <div>
              <Label>Tipo de Input</Label>
              <Select
                value={component.content?.type || 'text'}
                onValueChange={(value) => updateContent({ type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="tel">Telefone</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="textarea">Área de texto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={component.content?.required || false}
                onCheckedChange={(checked) => updateContent({ required: checked })}
              />
              <Label>Campo obrigatório</Label>
            </div>
          </div>
        );

      case 'multiple_choice':
        return <MultipleChoiceEditor component={component} onUpdate={updateContent} />;

      case 'rating':
        return (
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                value={component.content?.label || ''}
                onChange={(e) => updateContent({ label: e.target.value })}
                placeholder="Avalie de 1 a 5"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Máximo</Label>
                <Input
                  type="number"
                  value={component.content?.maxRating || 5}
                  onChange={(e) => updateContent({ maxRating: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Valor Padrão</Label>
                <Input
                  type="number"
                  value={component.content?.defaultValue || 0}
                  onChange={(e) => updateContent({ defaultValue: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={component.content?.required || false}
                onCheckedChange={(checked) => updateContent({ required: checked })}
              />
              <Label>Campo obrigatório</Label>
            </div>
          </div>
        );

      case 'level_slider':
        return (
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                value={component.content?.label || ''}
                onChange={(e) => updateContent({ label: e.target.value })}
                placeholder="Avalie de 1 a 10"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Mínimo</Label>
                <Input
                  type="number"
                  value={component.content?.min || 1}
                  onChange={(e) => updateContent({ min: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Máximo</Label>
                <Input
                  type="number"
                  value={component.content?.max || 10}
                  onChange={(e) => updateContent({ max: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Passo</Label>
                <Input
                  type="number"
                  value={component.content?.step || 1}
                  onChange={(e) => updateContent({ step: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Valor padrão</Label>
              <Input
                type="number"
                value={component.content?.defaultValue || 5}
                onChange={(e) => updateContent({ defaultValue: Number(e.target.value) })}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Editor não disponível para este tipo de componente
            </p>
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-6">
      <Tabs value="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Propriedades do Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              {renderContentEditor()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="style" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Propriedades de Estilo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Alinhamento</Label>
                  <Select
                    value={component.style?.textAlign || 'left'}
                    onValueChange={(value) => onUpdate({
                      style: { ...component.style, textAlign: value as any }
                    })}
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
                  <Label>Margem</Label>
                  <Input
                    value={component.style?.margin || ''}
                    onChange={(e) => onUpdate({
                      style: { ...component.style, margin: e.target.value }
                    })}
                    placeholder="ex: 16px 0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MultipleChoiceEditorProps {
  component: Component;
  onUpdate: (updates: any) => void;
}

function MultipleChoiceEditor({ component, onUpdate }: MultipleChoiceEditorProps) {
  const options = component.content?.options || [];

  const addOption = () => {
    const newOption = {
      id: `opt-${Date.now()}`,
      label: `Opção ${options.length + 1}`,
      score: 10
    };
    
    onUpdate({
      options: [...options, newOption]
    });
  };

  const updateOption = (index: number, updates: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_: any, i: number) => i !== index);
    onUpdate({ options: newOptions });
  };

  const moveOption = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= options.length) return;

    const newOptions = [...options];
    [newOptions[index], newOptions[newIndex]] = [newOptions[newIndex], newOptions[index]];
    onUpdate({ options: newOptions });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Pergunta</Label>
        <Textarea
          value={component.content?.question || ''}
          onChange={(e) => onUpdate({ question: e.target.value })}
          placeholder="Digite sua pergunta"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={component.content?.allowMultiple || false}
          onCheckedChange={(checked) => onUpdate({ allowMultiple: checked })}
        />
        <Label>Permitir múltiplas seleções</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={component.content?.required || false}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
        <Label>Campo obrigatório</Label>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Opções de Resposta</Label>
          <Button onClick={addOption} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>

        <div className="space-y-2">
          {options.map((option: any, index: number) => (
            <Card key={option.id || index} className="p-3">
              <div className="space-y-3">
                <div>
                  <Input
                    value={option.label}
                    onChange={(e) => updateOption(index, { label: e.target.value })}
                    placeholder="Texto da opção"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Pontuação</Label>
                    <Input
                      type="number"
                      value={option.score || 0}
                      onChange={(e) => updateOption(index, { score: Number(e.target.value) })}
                      className="h-8"
                    />
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveOption(index, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveOption(index, 'down')}
                      disabled={index === options.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StagePropertiesProps {
  stage: QuizStep;
  onUpdate: (updates: Partial<QuizStep>) => void;
}

function StageProperties({ stage, onUpdate }: StagePropertiesProps) {
  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Propriedades da Etapa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome da Etapa</Label>
            <Input
              value={stage.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Nome da etapa"
            />
          </div>
          
          <div>
            <Label>Título (opcional)</Label>
            <Input
              value={stage.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Título exibido na etapa"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Componentes:</span>
              <Badge variant="outline">{stage.components.length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
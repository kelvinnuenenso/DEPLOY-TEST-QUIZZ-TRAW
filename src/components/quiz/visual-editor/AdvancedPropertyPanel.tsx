import React, { useState } from 'react';
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
import { Slider } from '@/components/ui/slider';
import { Component, ComponentType } from '@/types/quiz';
import {
  Settings,
  Palette,
  Layout,
  MousePointer,
  Eye,
  Code,
  Zap,
  Layers,
  Move,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline
} from 'lucide-react';

interface AdvancedPropertyPanelProps {
  component: Component | null;
  onUpdate: (updates: Partial<Component>) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function AdvancedPropertyPanel({
  component,
  onUpdate,
  onDelete,
  onDuplicate
}: AdvancedPropertyPanelProps) {
  const [activeTab, setActiveTab] = useState('content');

  if (!component) {
    return (
      <div className="h-full bg-background border-l">
        <div className="p-4 text-center space-y-4 mt-12">
          <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
            <Settings className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Propriedades Avançadas</h3>
            <p className="text-muted-foreground text-sm">
              Selecione um componente para editar suas propriedades
            </p>
          </div>
        </div>
      </div>
    );
  }

  const updateContent = (updates: any) => {
    onUpdate({
      content: { ...component.content, ...updates }
    });
  };

  const updateStyle = (updates: any) => {
    onUpdate({
      style: { ...component.style, ...updates }
    });
  };

  const updateAnimation = (updates: any) => {
    onUpdate({
      animation: { ...component.animation, ...updates }
    });
  };

  return (
    <div className="h-full bg-background border-l flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="font-medium capitalize">
              {component.type.replace('_', ' ')}
            </span>
          </div>
          <div className="flex gap-1">
            {onDuplicate && (
              <Button variant="ghost" size="sm" onClick={onDuplicate}>
                <RotateCw className="w-3 h-3" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Layers className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          ID: {component.id}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mx-4 mt-2">
            <TabsTrigger value="content" className="text-xs">Conteúdo</TabsTrigger>
            <TabsTrigger value="style" className="text-xs">Estilo</TabsTrigger>
            <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">Avançado</TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="content">
              <ContentEditor component={component} onUpdate={updateContent} />
            </TabsContent>

            <TabsContent value="style">
              <StyleEditor component={component} onUpdate={updateStyle} />
            </TabsContent>

            <TabsContent value="layout">
              <LayoutEditor component={component} onUpdate={updateStyle} />
            </TabsContent>

            <TabsContent value="advanced">
              <AdvancedEditor 
                component={component} 
                onUpdate={onUpdate}
                onUpdateAnimation={updateAnimation}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// Content Editor Component
function ContentEditor({ component, onUpdate }: { component: Component; onUpdate: (updates: any) => void }) {
  const renderContentFields = () => {
    switch (component.type) {
      case 'title':
        return (
          <div className="space-y-4">
            <div>
              <Label>Texto do Título</Label>
              <Textarea
                value={component.content?.text || ''}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Digite o título"
                rows={2}
              />
            </div>
            <div>
              <Label>Nível Semântico</Label>
              <Select
                value={component.content?.level || 'h2'}
                onValueChange={(value) => onUpdate({ level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1 - Título Principal</SelectItem>
                  <SelectItem value="h2">H2 - Título de Seção</SelectItem>
                  <SelectItem value="h3">H3 - Subtítulo</SelectItem>
                  <SelectItem value="h4">H4 - Título Menor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <Label>URL do Vídeo</Label>
              <Input
                value={component.content?.src || ''}
                onChange={(e) => onUpdate({ src: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={component.content?.autoplay || false}
                  onCheckedChange={(checked) => onUpdate({ autoplay: checked })}
                />
                <Label>Reprodução automática</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={component.content?.controls !== false}
                  onCheckedChange={(checked) => onUpdate({ controls: checked })}
                />
                <Label>Mostrar controles</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={component.content?.muted || false}
                  onCheckedChange={(checked) => onUpdate({ muted: checked })}
                />
                <Label>Iniciar sem som</Label>
              </div>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="space-y-4">
            <div>
              <Label>Título do Gráfico</Label>
              <Input
                value={component.content?.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Título do gráfico"
              />
            </div>
            <div>
              <Label>Tipo de Gráfico</Label>
              <Select
                value={component.content?.type || 'bar'}
                onValueChange={(value) => onUpdate({ type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Barras</SelectItem>
                  <SelectItem value="line">Linhas</SelectItem>
                  <SelectItem value="pie">Pizza</SelectItem>
                  <SelectItem value="doughnut">Rosca</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dados (JSON)</Label>
              <Textarea
                value={JSON.stringify(component.content?.data || [], null, 2)}
                onChange={(e) => {
                  try {
                    const data = JSON.parse(e.target.value);
                    onUpdate({ data });
                  } catch {}
                }}
                placeholder='[{"label": "A", "value": 10}]'
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Editor de conteúdo não disponível para este componente</p>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Propriedades de Conteúdo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContentFields()}
      </CardContent>
    </Card>
  );
}

// Style Editor Component
function StyleEditor({ component, onUpdate }: { component: Component; onUpdate: (updates: any) => void }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Aparência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Cor do Texto</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={component.style?.color || '#000000'}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-12 h-10 p-1"
              />
              <Input
                value={component.style?.color || ''}
                onChange={(e) => onUpdate({ color: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <Label>Cor de Fundo</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={component.style?.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-12 h-10 p-1"
              />
              <Input
                value={component.style?.backgroundColor || ''}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <Label>Tamanho da Fonte</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[parseInt(component.style?.fontSize?.replace('px', '') || '16')]}
                onValueChange={([value]) => onUpdate({ fontSize: `${value}px` })}
                max={72}
                min={8}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">
                {component.style?.fontSize || '16px'}
              </span>
            </div>
          </div>

          <div>
            <Label>Peso da Fonte</Label>
              <Select
                value={String(component.style?.fontWeight || 'normal')}
                onValueChange={(value) => onUpdate({ fontWeight: value })}
              >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">Light (300)</SelectItem>
                <SelectItem value="normal">Normal (400)</SelectItem>
                <SelectItem value="500">Medium (500)</SelectItem>
                <SelectItem value="600">Semibold (600)</SelectItem>
                <SelectItem value="bold">Bold (700)</SelectItem>
                <SelectItem value="800">Extra Bold (800)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Alinhamento</Label>
            <div className="flex gap-1">
              {[
                { value: 'left', icon: AlignLeft, label: 'Esquerda' },
                { value: 'center', icon: AlignCenter, label: 'Centro' },
                { value: 'right', icon: AlignRight, label: 'Direita' }
              ].map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  variant={component.style?.textAlign === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdate({ textAlign: value })}
                  className="flex-1"
                >
                  <Icon className="w-3 h-3" />
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Layout Editor Component
function LayoutEditor({ component, onUpdate }: { component: Component; onUpdate: (updates: any) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Layout className="w-4 h-4" />
          Layout e Espaçamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Margem Superior</Label>
            <Input
              value={component.style?.marginTop || ''}
              onChange={(e) => onUpdate({ marginTop: e.target.value })}
              placeholder="16px"
            />
          </div>
          <div>
            <Label>Margem Inferior</Label>
            <Input
              value={component.style?.marginBottom || ''}
              onChange={(e) => onUpdate({ marginBottom: e.target.value })}
              placeholder="16px"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Padding Horizontal</Label>
            <Input
              value={component.style?.paddingX || ''}
              onChange={(e) => onUpdate({ paddingX: e.target.value })}
              placeholder="16px"
            />
          </div>
          <div>
            <Label>Padding Vertical</Label>
            <Input
              value={component.style?.paddingY || ''}
              onChange={(e) => onUpdate({ paddingY: e.target.value })}
              placeholder="16px"
            />
          </div>
        </div>

        <div>
          <Label>Largura</Label>
          <Select
            value={component.style?.width || 'auto'}
            onValueChange={(value) => onUpdate({ width: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Automática</SelectItem>
              <SelectItem value="100%">100%</SelectItem>
              <SelectItem value="75%">75%</SelectItem>
              <SelectItem value="50%">50%</SelectItem>
              <SelectItem value="25%">25%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Borda</Label>
          <div className="flex gap-2">
            <Input
              value={component.style?.borderWidth || ''}
              onChange={(e) => onUpdate({ borderWidth: e.target.value })}
              placeholder="1px"
              className="flex-1"
            />
            <Input
              type="color"
              value={component.style?.borderColor || '#e5e7eb'}
              onChange={(e) => onUpdate({ borderColor: e.target.value })}
              className="w-12 h-10 p-1"
            />
          </div>
        </div>

        <div>
          <Label>Raio da Borda</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[parseInt(component.style?.borderRadius?.replace('px', '') || '0')]}
              onValueChange={([value]) => onUpdate({ borderRadius: `${value}px` })}
              max={50}
              min={0}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">
              {component.style?.borderRadius || '0px'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Advanced Editor Component
function AdvancedEditor({ 
  component, 
  onUpdate,
  onUpdateAnimation 
}: { 
  component: Component; 
  onUpdate: (updates: any) => void;
  onUpdateAnimation: (updates: any) => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Animação e Interação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Entrada</Label>
            <Select
              value={component.animation?.entrance || 'none'}
              onValueChange={(value) => onUpdateAnimation({ entrance: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                <SelectItem value="fadeIn">Fade In</SelectItem>
                <SelectItem value="slideUp">Slide Up</SelectItem>
                <SelectItem value="slideDown">Slide Down</SelectItem>
                <SelectItem value="slideLeft">Slide Left</SelectItem>
                <SelectItem value="slideRight">Slide Right</SelectItem>
                <SelectItem value="zoomIn">Zoom In</SelectItem>
                <SelectItem value="bounceIn">Bounce In</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Duração (ms)</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[component.animation?.duration || 300]}
                onValueChange={([value]) => onUpdateAnimation({ duration: value })}
                max={2000}
                min={100}
                step={100}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-16">
                {component.animation?.duration || 300}ms
              </span>
            </div>
          </div>

          <div>
            <Label>Atraso (ms)</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[component.animation?.delay || 0]}
                onValueChange={([value]) => onUpdateAnimation({ delay: value })}
                max={2000}
                min={0}
                step={100}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-16">
                {component.animation?.delay || 0}ms
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Code className="w-4 h-4" />
            CSS Personalizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Classes CSS</Label>
            <Input
              value={component.customClass || ''}
              onChange={(e) => onUpdate({ customClass: e.target.value })}
              placeholder="custom-class another-class"
            />
          </div>
          <div className="mt-3">
            <Label>Estilos Inline</Label>
            <Textarea
              value={component.customStyles || ''}
              onChange={(e) => onUpdate({ customStyles: e.target.value })}
              placeholder="color: red; font-size: 18px;"
              rows={3}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
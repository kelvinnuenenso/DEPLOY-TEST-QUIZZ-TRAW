import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Component } from '@/types/quiz';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface MultipleChoiceEditorProps {
  component: Component;
  onUpdate: (updates: Partial<Component>) => void;
}

export function MultipleChoiceEditor({ component, onUpdate }: MultipleChoiceEditorProps) {
  const content = component.content || {};
  const options = content.options || [];

  const updateContent = (updates: any) => {
    onUpdate({
      content: { ...content, ...updates }
    });
  };

  const addOption = () => {
    const newOption = {
      id: `opt-${Date.now()}`,
      label: `Nova opção ${options.length + 1}`,
      score: 0,
      value: `option_${options.length + 1}`
    };
    
    updateContent({
      options: [...options, newOption]
    });
  };

  const updateOption = (index: number, updates: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    updateContent({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_: any, i: number) => i !== index);
    updateContent({ options: newOptions });
  };

  return (
    <div className="space-y-4">
      {/* Configurações gerais */}
      <Card className="p-4">
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Pergunta</Label>
            <Textarea
              value={content.question || ''}
              onChange={(e) => updateContent({ question: e.target.value })}
              placeholder="Digite a pergunta"
              className="text-sm min-h-[60px] resize-none"
            />
          </div>
          
          <div>
            <Label className="text-xs">Descrição (opcional)</Label>
            <Textarea
              value={content.description || ''}
              onChange={(e) => updateContent({ description: e.target.value })}
              placeholder="Descrição adicional da pergunta"
              className="text-sm min-h-[40px] resize-none"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={content.allowMultiple || false}
                onCheckedChange={(checked) => updateContent({ allowMultiple: checked })}
              />
              <Label className="text-xs">Permitir múltiplas respostas</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={content.required || false}
                onCheckedChange={(checked) => updateContent({ required: checked })}
              />
              <Label className="text-xs">Obrigatória</Label>
            </div>
          </div>
        </div>
      </Card>

      {/* Editor de opções */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">Opções de Resposta</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={addOption}
            className="gap-2"
          >
            <Plus className="w-3 h-3" />
            Adicionar
          </Button>
        </div>
        
        <div className="space-y-3">
          {options.map((option: any, index: number) => (
            <Card key={option.id || index} className="p-3 border-dashed">
              <div className="flex items-start gap-2">
                <div className="flex items-center">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <Input
                    value={option.label || ''}
                    onChange={(e) => updateOption(index, { label: e.target.value })}
                    placeholder={`Opção ${index + 1}`}
                    className="h-8 text-sm"
                  />
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Pontuação</Label>
                      <Input
                        type="number"
                        value={option.score || 0}
                        onChange={(e) => updateOption(index, { score: parseInt(e.target.value) || 0 })}
                        className="h-7 text-xs"
                        min="0"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <Label className="text-xs">Valor</Label>
                      <Input
                        value={option.value || option.label || ''}
                        onChange={(e) => updateOption(index, { value: e.target.value })}
                        className="h-7 text-xs"
                        placeholder="valor-opcao"
                      />
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="text-destructive hover:text-destructive p-1"
                  disabled={options.length <= 1}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
          
          {options.length === 0 && (
            <div className="text-center p-4 text-muted-foreground">
              <p className="text-sm">Nenhuma opção configurada</p>
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-2"
              >
                Adicionar primeira opção
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Informações da configuração */}
      <Card className="p-3 bg-muted/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Configuração atual:</span>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs">
              {options.length} opções
            </Badge>
            {content.allowMultiple && (
              <Badge variant="secondary" className="text-xs">Múltipla</Badge>
            )}
            {content.required && (
              <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
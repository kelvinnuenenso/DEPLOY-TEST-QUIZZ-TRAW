import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Quiz, QuizStep, Component } from '@/types/quiz';
import { Settings, Palette, Type, Monitor } from 'lucide-react';

interface SimplePropertyPanelProps {
  quiz: Quiz;
  stage: QuizStep | null;
  component: Component | null;
  onUpdateQuiz: (updates: Partial<Quiz>) => void;
  onUpdateStage: (updates: Partial<QuizStep>) => void;
  onUpdateComponent: (updates: Partial<Component>) => void;
}

export function SimplePropertyPanel({
  quiz,
  stage,
  component,
  onUpdateQuiz,
  onUpdateStage,
  onUpdateComponent
}: SimplePropertyPanelProps) {
  if (!stage) {
    return (
      <div className="h-full border-l bg-muted/30 p-4 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Selecione um elemento para editar suas propriedades</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full border-l bg-background overflow-auto">
      <div className="p-4 space-y-4">
        {/* Page Properties */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Monitor className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Propriedades da Página</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nome do Projeto</Label>
              <Input
                value={quiz.name}
                onChange={(e) => onUpdateQuiz({ name: e.target.value })}
                placeholder="Nome do projeto"
                className="h-8 text-sm"
              />
            </div>
            
            {stage && (
              <div>
                <Label className="text-xs">Título da Página</Label>
                <Input
                  value={stage.title || ''}
                  onChange={(e) => onUpdateStage({ title: e.target.value })}
                  placeholder="Título da página"
                  className="h-8 text-sm"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <Label className="text-xs">Status</Label>
              <Badge variant={quiz.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                {quiz.status === 'published' ? 'Publicado' : 'Rascunho'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Component Properties */}
        {component ? (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Propriedades do Componente</h3>
              <Badge variant="outline" className="text-xs ml-auto">
                {component.type}
              </Badge>
            </div>

            <div className="space-y-3">
              {/* Text Components */}
              {(component.type === 'text' || component.type === 'title') && (
                <>
                  <div>
                    <Label className="text-xs">Texto</Label>
                    <Textarea
                      value={component.content.text || ''}
                      onChange={(e) => onUpdateComponent({
                        content: { ...component.content, text: e.target.value }
                      })}
                      placeholder="Digite o texto"
                      className="text-sm min-h-[60px] resize-none"
                    />
                  </div>
                  
                  {component.type === 'title' && (
                    <div>
                      <Label className="text-xs">Nível do Título</Label>
                      <Select
                        value={component.content.level || 'h2'}
                        onValueChange={(value) => onUpdateComponent({
                          content: { ...component.content, level: value }
                        })}
                      >
                        <SelectTrigger className="h-8 text-sm">
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
                  )}
                  
                  <div>
                    <Label className="text-xs">Estilo</Label>
                    <Select
                      value={component.content.style || 'normal'}
                      onValueChange={(value) => onUpdateComponent({
                        content: { ...component.content, style: value }
                      })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Negrito</SelectItem>
                        <SelectItem value="italic">Itálico</SelectItem>
                        <SelectItem value="center">Centralizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Button Component */}
              {component.type === 'button' && (
                <>
                  <div>
                    <Label className="text-xs">Texto do Botão</Label>
                    <Input
                      value={component.content.text || ''}
                      onChange={(e) => onUpdateComponent({
                        content: { ...component.content, text: e.target.value }
                      })}
                      placeholder="Texto do botão"
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Estilo</Label>
                    <Select
                      value={component.content.style || 'primary'}
                      onValueChange={(value) => onUpdateComponent({
                        content: { ...component.content, style: value }
                      })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Principal</SelectItem>
                        <SelectItem value="secondary">Secundário</SelectItem>
                        <SelectItem value="outline">Contorno</SelectItem>
                        <SelectItem value="ghost">Fantasma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Image Component */}
              {component.type === 'image' && (
                <>
                  <div>
                    <Label className="text-xs">URL da Imagem</Label>
                    <Input
                      value={component.content.src || ''}
                      onChange={(e) => onUpdateComponent({
                        content: { ...component.content, src: e.target.value }
                      })}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Texto Alternativo</Label>
                    <Input
                      value={component.content.alt || ''}
                      onChange={(e) => onUpdateComponent({
                        content: { ...component.content, alt: e.target.value }
                      })}
                      placeholder="Descrição da imagem"
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Largura</Label>
                    <Select
                      value={component.content.width || '100%'}
                      onValueChange={(value) => onUpdateComponent({
                        content: { ...component.content, width: value }
                      })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100%">Largura total</SelectItem>
                        <SelectItem value="50%">Metade</SelectItem>
                        <SelectItem value="300px">300px</SelectItem>
                        <SelectItem value="200px">200px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Input Component */}
              {component.type === 'input' && (
                <>
                  <div>
                    <Label className="text-xs">Rótulo</Label>
                    <Input
                      value={component.content.label || ''}
                      onChange={(e) => onUpdateComponent({
                        content: { ...component.content, label: e.target.value }
                      })}
                      placeholder="Rótulo do campo"
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Tipo</Label>
                    <Select
                      value={component.content.type || 'text'}
                      onValueChange={(value) => onUpdateComponent({
                        content: { ...component.content, type: value }
                      })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="password">Senha</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={component.content.required || false}
                      onCheckedChange={(checked) => onUpdateComponent({
                        content: { ...component.content, required: checked }
                      })}
                    />
                    <Label className="text-xs">Campo obrigatório</Label>
                  </div>
                </>
              )}

              {/* Multiple Choice Component */}
              {component.type === 'multiple_choice' && (
                <>
                  <div>
                    <Label className="text-xs">Pergunta</Label>
                    <Textarea
                      value={component.content.question || ''}
                      onChange={(e) => onUpdateComponent({
                        content: { ...component.content, question: e.target.value }
                      })}
                      placeholder="Digite a pergunta"
                      className="text-sm min-h-[60px] resize-none"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Descrição (opcional)</Label>
                    <Textarea
                      value={component.content.description || ''}
                      onChange={(e) => onUpdateComponent({
                        content: { ...component.content, description: e.target.value }
                      })}
                      placeholder="Descrição adicional"
                      className="text-sm min-h-[40px] resize-none"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={component.content.allowMultiple || false}
                      onCheckedChange={(checked) => onUpdateComponent({
                        content: { ...component.content, allowMultiple: checked }
                      })}
                    />
                    <Label className="text-xs">Múltiplas respostas</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={component.content.required || false}
                      onCheckedChange={(checked) => onUpdateComponent({
                        content: { ...component.content, required: checked }
                      })}
                    />
                    <Label className="text-xs">Obrigatória</Label>
                  </div>

                  {/* Editor de opções */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs">Opções de Resposta</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOption = {
                            id: `opt-${Date.now()}`,
                            label: `Nova opção ${(component.content.options || []).length + 1}`,
                            score: 0,
                            value: `option_${(component.content.options || []).length + 1}`
                          };
                          onUpdateComponent({
                            content: {
                              ...component.content,
                              options: [...(component.content.options || []), newOption]
                            }
                          });
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        + Opção
                      </Button>
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(component.content.options || []).map((option: { id?: string; label?: string; score?: number }, index: number) => (
                        <div key={option.id || index} className="p-2 border rounded-lg bg-muted/30">
                          <div className="space-y-1">
                            <Input
                              value={option.label || ''}
                              onChange={(e) => {
                                const newOptions = [...(component.content.options || [])];
                                newOptions[index] = { ...newOptions[index], label: e.target.value };
                                onUpdateComponent({
                                  content: { ...component.content, options: newOptions }
                                });
                              }}
                              placeholder={`Opção ${index + 1}`}
                              className="h-7 text-xs"
                            />
                            <div className="flex gap-1">
                              <Input
                                type="number"
                                value={option.score || 0}
                                onChange={(e) => {
                                  const newOptions = [...(component.content.options || [])];
                                  newOptions[index] = { ...newOptions[index], score: parseInt(e.target.value) || 0 };
                                  onUpdateComponent({
                                    content: { ...component.content, options: newOptions }
                                  });
                                }}
                                className="h-6 text-xs"
                                placeholder="Pontos"
                                min="0"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newOptions = (component.content.options || []).filter((_: unknown, i: number) => i !== index);
                                  onUpdateComponent({
                                    content: { ...component.content, options: newOptions }
                                  });
                                }}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                disabled={(component.content.options || []).length <= 1}
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Level Slider Component */}
              {component.type === 'level_slider' && (
                <>
                  <div>
                    <Label className="text-xs">Pergunta/Título</Label>
                    <Textarea
                      value={component.content.question || component.content.label || ''}
                      onChange={(e) => onUpdateComponent({
                        content: { 
                          ...component.content, 
                          question: e.target.value,
                          label: e.target.value 
                        }
                      })}
                      placeholder="Digite a pergunta"
                      className="text-sm min-h-[60px] resize-none"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Descrição (opcional)</Label>
                    <Textarea
                      value={component.content.description || ''}
                      onChange={(e) => onUpdateComponent({
                        content: { ...component.content, description: e.target.value }
                      })}
                      placeholder="Descrição adicional"
                      className="text-sm min-h-[40px] resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Mínimo</Label>
                      <Input
                        type="number"
                        value={component.content.min || 1}
                        onChange={(e) => onUpdateComponent({
                          content: { ...component.content, min: parseInt(e.target.value) || 1 }
                        })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Máximo</Label>
                      <Input
                        type="number"
                        value={component.content.max || 10}
                        onChange={(e) => onUpdateComponent({
                          content: { ...component.content, max: parseInt(e.target.value) || 10 }
                        })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Padrão</Label>
                      <Input
                        type="number"
                        value={component.content.defaultValue || 5}
                        onChange={(e) => onUpdateComponent({
                          content: { ...component.content, defaultValue: parseInt(e.target.value) || 5 }
                        })}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs">Incremento</Label>
                    <Input
                      type="number"
                      value={component.content.step || 1}
                      onChange={(e) => onUpdateComponent({
                        content: { ...component.content, step: parseInt(e.target.value) || 1 }
                      })}
                      className="h-8 text-sm"
                      min="1"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={component.content.required || false}
                      onCheckedChange={(checked) => onUpdateComponent({
                        content: { ...component.content, required: checked }
                      })}
                    />
                    <Label className="text-xs">Obrigatória</Label>
                  </div>
                </>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center border-dashed">
            <Type className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <h4 className="font-medium text-sm mb-1">Nenhum elemento selecionado</h4>
            <p className="text-xs text-muted-foreground">
              Clique em um elemento na página para editar suas propriedades
            </p>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Ações Rápidas</h3>
          </div>
          
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
              <Palette className="w-3 h-3 mr-2" />
              Personalizar Cores
            </Button>
            
            <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
              <Type className="w-3 h-3 mr-2" />
              Fontes e Tipografia
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
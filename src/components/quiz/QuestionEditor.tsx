import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Question, QuestionType, QuestionOption } from '@/types/quiz';
import {
  GripVertical,
  Trash2,
  Plus,
  Settings,
  ChevronDown,
  ChevronUp,
  Copy
} from 'lucide-react';

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (questionId: string, updates: Partial<Question>) => void;
  onDelete: (questionId: string) => void;
  onDuplicate: (questionId: string) => void;
}

export function QuestionEditor({ question, index, onUpdate, onDelete, onDuplicate }: QuestionEditorProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const addOption = () => {
    const currentOptions = question.options || [];
    const newOption: QuestionOption = {
      id: crypto.randomUUID(),
      label: `Opção ${String.fromCharCode(65 + currentOptions.length)}`,
      score: 0
    };

    onUpdate(question.id, {
      options: [...currentOptions, newOption]
    });
  };

  const updateOption = (optionId: string, updates: Partial<QuestionOption>) => {
    if (!question.options) return;

    onUpdate(question.id, {
      options: question.options.map(opt => 
        opt.id === optionId ? { ...opt, ...updates } : opt
      )
    });
  };

  const deleteOption = (optionId: string) => {
    if (!question.options || question.options.length <= 2) return;

    onUpdate(question.id, {
      options: question.options.filter(opt => opt.id !== optionId)
    });
  };

  const questionTypes = [
    { value: 'single', label: 'Escolha única' },
    { value: 'multiple', label: 'Múltipla escolha' },
    { value: 'rating', label: 'Avaliação (estrelas)' },
    { value: 'nps', label: 'Net Promoter Score' },
    { value: 'slider', label: 'Slider numérico' },
    { value: 'short_text', label: 'Texto curto' },
    { value: 'long_text', label: 'Texto longo' },
    { value: 'email', label: 'E-mail' },
    { value: 'phone', label: 'Telefone' },
    { value: 'date', label: 'Data' },
    { value: 'file', label: 'Upload de arquivo' },
    { value: 'consent', label: 'Consentimento' },
    { value: 'cta', label: 'Call to Action' }
  ];

  const hasOptions = ['single', 'multiple'].includes(question.type);
  const hasScoring = ['single', 'multiple', 'rating', 'nps', 'slider'].includes(question.type);

  return (
    <div ref={setNodeRef} style={style} className="group">
      <Card className="p-6 hover:shadow-md transition-all duration-200">
        <div className="flex items-start gap-4">
          {/* Drag handle */}
          <div 
            className="flex flex-col items-center gap-2 mt-2 cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
              {index + 1}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {/* Question type and actions */}
            <div className="flex items-center justify-between">
              <Select
                value={question.type}
                onValueChange={(value: QuestionType) => 
                  onUpdate(question.id, { type: value })
                }
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDuplicate(question.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      {isSettingsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(question.id)}
                  className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Question title */}
            <Input
              value={question.title}
              onChange={(e) => onUpdate(question.id, { title: e.target.value })}
              placeholder="Digite sua pergunta..."
              className="text-lg font-medium"
            />

            {/* Question description */}
            <Textarea
              value={question.description || ''}
              onChange={(e) => onUpdate(question.id, { description: e.target.value })}
              placeholder="Descrição opcional..."
              rows={2}
            />

            {/* Settings panel */}
            <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <CollapsibleContent className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`required-${question.id}`}
                      checked={question.required || false}
                      onCheckedChange={(checked) => onUpdate(question.id, { required: checked })}
                    />
                    <Label htmlFor={`required-${question.id}`}>Obrigatória</Label>
                  </div>
                  
                  {hasScoring && (
                    <div className="space-y-1">
                      <Label htmlFor={`weight-${question.id}`}>Peso da pergunta</Label>
                      <Input
                        id={`weight-${question.id}`}
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={question.score_weight || 1}
                        onChange={(e) => onUpdate(question.id, { score_weight: parseFloat(e.target.value) || 1 })}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {question.type === 'slider' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Valor mínimo</Label>
                      <Input
                        type="number"
                        value={question.settings?.min || 0}
                        onChange={(e) => onUpdate(question.id, {
                          settings: { ...question.settings, min: parseInt(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Valor máximo</Label>
                      <Input
                        type="number"
                        value={question.settings?.max || 10}
                        onChange={(e) => onUpdate(question.id, {
                          settings: { ...question.settings, max: parseInt(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Passo</Label>
                      <Input
                        type="number"
                        value={question.settings?.step || 1}
                        onChange={(e) => onUpdate(question.id, {
                          settings: { ...question.settings, step: parseInt(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                )}

                {['short_text', 'long_text', 'email', 'phone'].includes(question.type) && (
                  <div>
                    <Label>Placeholder</Label>
                    <Input
                      value={question.settings?.placeholder || ''}
                      onChange={(e) => onUpdate(question.id, {
                        settings: { ...question.settings, placeholder: e.target.value }
                      })}
                      placeholder="Texto de ajuda para o usuário..."
                    />
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Options for single/multiple choice */}
            {hasOptions && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Opções de resposta:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                </div>
                
                {question.options?.map((option, optionIndex) => (
                  <div key={option.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                      {String.fromCharCode(65 + optionIndex)}
                    </div>
                    <Input
                      value={option.label}
                      onChange={(e) => updateOption(option.id, { label: e.target.value })}
                      placeholder="Texto da opção"
                      className="flex-1"
                    />
                    {hasScoring && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Pontos:</Label>
                        <Input
                          type="number"
                          value={option.score || 0}
                          onChange={(e) => updateOption(option.id, { score: parseInt(e.target.value) || 0 })}
                          className="w-20"
                        />
                      </div>
                    )}
                    {question.options && question.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteOption(option.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
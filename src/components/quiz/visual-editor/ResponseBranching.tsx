import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QuestionOption, QuizStep } from '@/types/quiz';
import {
  Plus, ArrowRight, GitBranch, Settings, Trash2, Copy,
  ChevronRight, Target, MessageSquare, ExternalLink
} from 'lucide-react';

interface ResponseBranch {
  id: string;
  responseValue: string;
  actionType: 'next_step' | 'specific_step' | 'external_url' | 'outcome';
  targetStepId?: string;
  targetUrl?: string;
  outcomeKey?: string;
  conditions?: BranchCondition[];
}

interface BranchCondition {
  id: string;
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: string;
}

interface ResponseBranchingProps {
  options: QuestionOption[];
  branches: ResponseBranch[];
  availableSteps: QuizStep[];
  onBranchesUpdate: (branches: ResponseBranch[]) => void;
}

export function ResponseBranching({
  options,
  branches,
  availableSteps,
  onBranchesUpdate
}: ResponseBranchingProps) {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [isAddingBranch, setIsAddingBranch] = useState(false);

  const addBranch = (optionId: string) => {
    const newBranch: ResponseBranch = {
      id: `branch-${Date.now()}`,
      responseValue: optionId,
      actionType: 'next_step'
    };

    onBranchesUpdate([...branches, newBranch]);
    setIsAddingBranch(false);
  };

  const updateBranch = (branchId: string, updates: Partial<ResponseBranch>) => {
    const updatedBranches = branches.map(branch =>
      branch.id === branchId ? { ...branch, ...updates } : branch
    );
    onBranchesUpdate(updatedBranches);
  };

  const deleteBranch = (branchId: string) => {
    const filteredBranches = branches.filter(branch => branch.id !== branchId);
    onBranchesUpdate(filteredBranches);
  };

  const duplicateBranch = (branchId: string) => {
    const originalBranch = branches.find(branch => branch.id === branchId);
    if (originalBranch) {
      const duplicatedBranch: ResponseBranch = {
        ...originalBranch,
        id: `branch-${Date.now()}`,
      };
      onBranchesUpdate([...branches, duplicatedBranch]);
    }
  };

  const addCondition = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      const newCondition: BranchCondition = {
        id: `condition-${Date.now()}`,
        field: '',
        operator: 'equals',
        value: ''
      };

      updateBranch(branchId, {
        conditions: [...(branch.conditions || []), newCondition]
      });
    }
  };

  const updateCondition = (branchId: string, conditionId: string, updates: Partial<BranchCondition>) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      const updatedConditions = (branch.conditions || []).map(condition =>
        condition.id === conditionId ? { ...condition, ...updates } : condition
      );
      updateBranch(branchId, { conditions: updatedConditions });
    }
  };

  const removeCondition = (branchId: string, conditionId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      const filteredConditions = (branch.conditions || []).filter(
        condition => condition.id !== conditionId
      );
      updateBranch(branchId, { conditions: filteredConditions });
    }
  };

  const getOptionLabel = (optionId: string) => {
    const option = options.find(opt => opt.id === optionId);
    return option?.label || optionId;
  };

  const getStepLabel = (stepId: string) => {
    const step = availableSteps.find(s => s.id === stepId);
    return step?.name || stepId;
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'next_step':
        return <ChevronRight className="w-4 h-4" />;
      case 'specific_step':
        return <Target className="w-4 h-4" />;
      case 'external_url':
        return <ExternalLink className="w-4 h-4" />;
      case 'outcome':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <ArrowRight className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'next_step':
        return 'bg-blue-500';
      case 'specific_step':
        return 'bg-green-500';
      case 'external_url':
        return 'bg-purple-500';
      case 'outcome':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <h4 className="text-sm font-medium">Ramificações de Resposta</h4>
        </div>
        
        <Dialog open={isAddingBranch} onOpenChange={setIsAddingBranch}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nova Ramificação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Ramificação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecione uma opção de resposta para criar uma ramificação:
              </p>
              <div className="space-y-2">
                {options.map((option) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addBranch(option.id)}
                    disabled={branches.some(b => b.responseValue === option.id)}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    {option.label}
                    {branches.some(b => b.responseValue === option.id) && (
                      <Badge variant="secondary" className="ml-auto">
                        Já configurada
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {branches.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <GitBranch className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nenhuma ramificação configurada</p>
          <p className="text-xs">Cada resposta seguirá o fluxo padrão</p>
        </div>
      ) : (
        <div className="space-y-4">
          {branches.map((branch) => (
            <Card key={branch.id} className="p-4 border-l-4 border-l-primary">
              <div className="space-y-4">
                {/* Header da Ramificação */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${getActionColor(branch.actionType)} flex items-center justify-center text-white`}>
                      {getActionIcon(branch.actionType)}
                    </div>
                    <div>
                      <h5 className="font-medium">
                        Resposta: "{getOptionLabel(branch.responseValue)}"
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {branch.actionType === 'next_step' && 'Próxima etapa do fluxo'}
                        {branch.actionType === 'specific_step' && `Ir para: ${getStepLabel(branch.targetStepId || '')}`}
                        {branch.actionType === 'external_url' && `Link externo: ${branch.targetUrl || 'Não definido'}`}
                        {branch.actionType === 'outcome' && `Resultado: ${branch.outcomeKey || 'Não definido'}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => duplicateBranch(branch.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedBranch(selectedBranch === branch.id ? null : branch.id)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteBranch(branch.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Configurações da Ramificação */}
                {selectedBranch === branch.id && (
                  <>
                    <Separator />
                    <div className="space-y-4 pl-11">
                      <div>
                        <Label>Ação</Label>
                        <Select
                          value={branch.actionType}
                          onValueChange={(value: any) => updateBranch(branch.id, { actionType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="next_step">Próxima etapa</SelectItem>
                            <SelectItem value="specific_step">Etapa específica</SelectItem>
                            <SelectItem value="external_url">Link externo</SelectItem>
                            <SelectItem value="outcome">Resultado/Outcome</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {branch.actionType === 'specific_step' && (
                        <div>
                          <Label>Etapa de destino</Label>
                          <Select
                            value={branch.targetStepId || ''}
                            onValueChange={(value) => updateBranch(branch.id, { targetStepId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma etapa" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSteps.map((step) => (
                                <SelectItem key={step.id} value={step.id}>
                                  {step.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {branch.actionType === 'external_url' && (
                        <div>
                          <Label>URL de destino</Label>
                          <Input
                            value={branch.targetUrl || ''}
                            onChange={(e) => updateBranch(branch.id, { targetUrl: e.target.value })}
                            placeholder="https://exemplo.com"
                          />
                        </div>
                      )}

                      {branch.actionType === 'outcome' && (
                        <div>
                          <Label>Chave do resultado</Label>
                          <Input
                            value={branch.outcomeKey || ''}
                            onChange={(e) => updateBranch(branch.id, { outcomeKey: e.target.value })}
                            placeholder="outcome_key"
                          />
                        </div>
                      )}

                      {/* Condições Adicionais */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label>Condições adicionais</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addCondition(branch.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Condição
                          </Button>
                        </div>

                        {branch.conditions && branch.conditions.length > 0 ? (
                          <div className="space-y-3">
                            {branch.conditions.map((condition) => (
                              <Card key={condition.id} className="p-3 border-dashed">
                                <div className="grid grid-cols-4 gap-2">
                                  <Input
                                    placeholder="Campo"
                                    value={condition.field}
                                    onChange={(e) => updateCondition(branch.id, condition.id, { field: e.target.value })}
                                  />
                                  <Select
                                    value={condition.operator}
                                    onValueChange={(value: any) => updateCondition(branch.id, condition.id, { operator: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="equals">Igual a</SelectItem>
                                      <SelectItem value="greater_than">Maior que</SelectItem>
                                      <SelectItem value="less_than">Menor que</SelectItem>
                                      <SelectItem value="contains">Contém</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    placeholder="Valor"
                                    value={condition.value}
                                    onChange={(e) => updateCondition(branch.id, condition.id, { value: e.target.value })}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeCondition(branch.id, condition.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Nenhuma condição adicional. A ramificação será ativada apenas pela resposta selecionada.
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
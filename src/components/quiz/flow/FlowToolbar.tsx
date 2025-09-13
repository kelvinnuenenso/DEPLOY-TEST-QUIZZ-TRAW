import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, GitBranch, Target, Calculator, 
  Plus, Trash2, Settings, Palette 
} from 'lucide-react';

interface FlowToolbarProps {
  onAddNode: (type: 'step' | 'condition' | 'outcome' | 'calculation') => void;
  selectedNode?: any;
  onUpdateNode: (updates: any) => void;
  onDeleteNode: () => void;
}

export function FlowToolbar({ 
  onAddNode, 
  selectedNode, 
  onUpdateNode, 
  onDeleteNode 
}: FlowToolbarProps) {
  const nodeTypes = [
    {
      type: 'step' as const,
      label: 'Etapa',
      icon: MessageCircle,
      description: 'Pergunta ou conteúdo',
      color: 'hsl(var(--primary))'
    },
    {
      type: 'condition' as const,
      label: 'Condição',
      icon: GitBranch,
      description: 'Decisão baseada em resposta',
      color: 'hsl(var(--accent))'
    },
    {
      type: 'outcome' as const,
      label: 'Resultado',
      icon: Target,
      description: 'Final do fluxo',
      color: 'hsl(217 91% 66%)'
    },
    {
      type: 'calculation' as const,
      label: 'Cálculo',
      icon: Calculator,
      description: 'Operação matemática',
      color: 'hsl(var(--muted-foreground))'
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Adicionar Nós */}
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Nó
        </h3>
        <div className="space-y-2">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <Button
                key={nodeType.type}
                variant="outline"
                size="sm"
                className="w-full justify-start h-auto p-3"
                onClick={() => onAddNode(nodeType.type)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: nodeType.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium text-sm">{nodeType.label}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {nodeType.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Propriedades do Nó Selecionado */}
      {selectedNode ? (
        <div>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Propriedades
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                {selectedNode.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {selectedNode.id.slice(0, 8)}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="node-title" className="text-xs">Título</Label>
                <Input
                  id="node-title"
                  value={selectedNode.data?.title || ''}
                  onChange={(e) => onUpdateNode({ title: e.target.value })}
                  className="text-sm"
                  placeholder="Digite o título..."
                />
              </div>

              <div>
                <Label htmlFor="node-subtitle" className="text-xs">Descrição</Label>
                <Textarea
                  id="node-subtitle"
                  value={selectedNode.data?.subtitle || ''}
                  onChange={(e) => onUpdateNode({ subtitle: e.target.value })}
                  className="text-sm min-h-[60px]"
                  placeholder="Digite a descrição..."
                />
              </div>

              {selectedNode.type === 'condition' && (
                <div>
                  <Label className="text-xs">Condições</Label>
                  <Card className="p-3 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Configure as regras de decisão para este nó.
                    </p>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Configurar Condições
                    </Button>
                  </Card>
                </div>
              )}

              {selectedNode.type === 'calculation' && (
                <div>
                  <Label htmlFor="node-formula" className="text-xs">Fórmula</Label>
                  <Input
                    id="node-formula"
                    value={selectedNode.data?.formula || ''}
                    onChange={(e) => onUpdateNode({ formula: e.target.value })}
                    className="text-sm font-mono"
                    placeholder="Ex: score * 2 + bonus"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="node-color" className="text-xs">Cor</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    id="node-color"
                    value={selectedNode.data?.color || '#1976d2'}
                    onChange={(e) => onUpdateNode({ color: e.target.value })}
                    className="w-8 h-8 rounded border"
                  />
                  <Input
                    value={selectedNode.data?.color || '#1976d2'}
                    onChange={(e) => onUpdateNode({ color: e.target.value })}
                    className="text-sm font-mono"
                    placeholder="#1976d2"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={onDeleteNode}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Nó
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Palette className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Selecione um nó para editar suas propriedades
          </p>
        </div>
      )}
    </div>
  );
}
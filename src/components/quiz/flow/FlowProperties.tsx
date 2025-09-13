import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Quiz } from '@/types/quiz';
import { Settings, Workflow, BarChart3 } from 'lucide-react';

interface FlowPropertiesProps {
  quiz: Quiz;
  selectedNode?: any;
  onUpdate: (quiz: Quiz) => void;
}

export function FlowProperties({ quiz, selectedNode, onUpdate }: FlowPropertiesProps) {
  const flowStats = {
    totalNodes: quiz.flow?.nodes.length || 0,
    totalEdges: quiz.flow?.edges.length || 0,
    entryPoint: quiz.flow?.entryNodeId || 'none',
    calculations: quiz.flow?.calculations.length || 0
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Propriedades do Fluxo
        </h2>
        
        <Card className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Estatísticas
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{flowStats.totalNodes}</div>
              <div className="text-xs text-muted-foreground">Nós</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-accent">{flowStats.totalEdges}</div>
              <div className="text-xs text-muted-foreground">Conexões</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg col-span-2">
              <div className="text-lg font-bold text-orange-500">{flowStats.calculations}</div>
              <div className="text-xs text-muted-foreground">Cálculos Configurados</div>
            </div>
          </div>
        </Card>
      </div>

      {selectedNode && (
        <Card className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            Nó Selecionado
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedNode.type}</Badge>
              <Badge variant="outline" className="font-mono text-xs">
                {selectedNode.id}
              </Badge>
            </div>
            
            <div>
              <label className="text-sm font-medium">Título:</label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedNode.data?.title || 'Sem título'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Descrição:</label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedNode.data?.subtitle || 'Sem descrição'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Posição:</label>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                x: {Math.round(selectedNode.position?.x || 0)}, 
                y: {Math.round(selectedNode.position?.y || 0)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
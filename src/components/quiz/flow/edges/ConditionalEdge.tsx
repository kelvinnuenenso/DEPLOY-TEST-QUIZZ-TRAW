import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  EdgeProps,
} from '@xyflow/react';
import { Badge } from '@/components/ui/badge';

export const ConditionalEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const { setEdges } = useReactFlow();
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          stroke: (data as any)?.color || 'hsl(var(--muted-foreground))',
          strokeWidth: 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-all"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          {(data as any)?.condition && (
            <Badge 
              variant="secondary" 
              className="text-xs cursor-pointer hover:bg-secondary/80"
              onClick={onEdgeClick}
            >
              {(data as any).condition.label || 'Condição'}
            </Badge>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

ConditionalEdge.displayName = 'ConditionalEdge';
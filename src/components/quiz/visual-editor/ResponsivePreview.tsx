import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Quiz, QuizStep } from '@/types/quiz';
import { ComponentRenderer } from '../ComponentRenderer';
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  RotateCcw,
  Settings,
  Zap,
  Clock
} from 'lucide-react';

interface ResponsivePreviewProps {
  quiz: Quiz;
  currentStep: QuizStep;
  onStepChange: (stepId: string) => void;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_SIZES = {
  desktop: { width: '100%', maxWidth: '1200px', icon: Monitor, label: 'Desktop' },
  tablet: { width: '768px', maxWidth: '768px', icon: Tablet, label: 'Tablet' },
  mobile: { width: '375px', maxWidth: '375px', icon: Smartphone, label: 'Mobile' }
};

export function ResponsivePreview({ quiz, currentStep, onStepChange }: ResponsivePreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [showGrid, setShowGrid] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [previewMode, setPreviewMode] = useState<'design' | 'live'>('design');

  const viewportConfig = VIEWPORT_SIZES[viewport];

  return (
    <div className="h-full bg-background border-l flex flex-col">
      {/* Header Controls */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <h3 className="font-semibold">Preview Responsivo</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {currentStep.name}
            </Badge>
          </div>
        </div>

        {/* Viewport Controls */}
        <div className="flex items-center gap-2 mb-3">
          {Object.entries(VIEWPORT_SIZES).map(([key, config]) => {
            const IconComponent = config.icon;
            return (
              <Button
                key={key}
                variant={viewport === key ? "default" : "outline"}
                size="sm"
                onClick={() => setViewport(key as ViewportSize)}
                className="h-8"
              >
                <IconComponent className="w-3 h-3 mr-1" />
                <span className="text-xs">{config.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Display Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="grid"
                checked={showGrid}
                onCheckedChange={setShowGrid}
              />
              <Label htmlFor="grid" className="text-xs">Grade</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="boundaries"
                checked={showBoundaries}
                onCheckedChange={setShowBoundaries}
              />
              <Label htmlFor="boundaries" className="text-xs">Limites</Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={previewMode === 'design' ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode('design')}
              className="h-7 text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              Design
            </Button>
            <Button
              variant={previewMode === 'live' ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode('live')}
              className="h-7 text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              Live
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto bg-muted/20 p-4">
        <div className="flex justify-center">
          <div
            className="bg-background border rounded-lg shadow-lg transition-all duration-300 overflow-hidden relative"
            style={{
              width: viewportConfig.width,
              maxWidth: viewportConfig.maxWidth,
              minHeight: '600px'
            }}
          >
            {/* Grid Overlay */}
            {showGrid && (
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />
            )}

            {/* Content */}
            <div className={`p-6 ${showBoundaries ? 'space-y-2' : 'space-y-4'}`}>
              {currentStep.components.map((component, index) => (
                <div
                  key={component.id}
                  className={`
                    ${showBoundaries ? 'border border-dashed border-blue-300 rounded p-2' : ''}
                    ${previewMode === 'design' ? 'relative group' : ''}
                  `}
                >
                  {showBoundaries && (
                    <div className="absolute -top-6 left-0 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded text-xs font-mono">
                      {component.type}
                    </div>
                  )}
                  
                  <ComponentRenderer
                    component={component}
                    isPreview={previewMode === 'live'}
                    responsive={viewport !== 'desktop'}
                  />

                  {previewMode === 'design' && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge variant="secondary" className="text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}

              {currentStep.components.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum componente adicionado</p>
                  <p className="text-sm">Arraste componentes da biblioteca para começar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Componentes: {currentStep.components.length}</span>
            <span>Viewport: {viewportConfig.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Atualizado agora</span>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Component, QuizStep } from '@/types/quiz';
import { Star, Heart, Zap } from 'lucide-react';

interface PreviewPanelProps {
  step: QuizStep;
  mode: 'desktop' | 'tablet' | 'mobile';
  theme?: Record<string, unknown>;
}

export function PreviewPanel({ step, mode, theme }: PreviewPanelProps) {
  const getContainerClasses = () => {
    switch (mode) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'max-w-4xl mx-auto';
    }
  };

  return (
    <div className={`h-full p-6 ${getContainerClasses()}`}>
      <Card className="h-full bg-background shadow-lg">
        <div className="p-6 space-y-6">
          {/* Título da Etapa */}
          {step.title && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {step.title}
              </h1>
            </div>
          )}

          {/* Renderizar Componentes */}
          <div className="space-y-4">
            {step.components.map((component) => (
              <div key={component.id}>
                {renderComponent(component)}
              </div>
            ))}
          </div>

          {/* Placeholder se não há componentes */}
          {step.components.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium mb-2">Etapa vazia</h3>
              <p className="text-sm">
                Adicione componentes da biblioteca para visualizar o conteúdo aqui
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function renderComponent(component: Component): React.ReactNode {
  const style = component.style || {};
  
  const baseStyle = {
    color: style.textColor,
    backgroundColor: style.backgroundColor,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    padding: style.padding,
    margin: style.margin,
    borderRadius: style.borderRadius,
    textAlign: style.textAlign as any,
    width: style.width,
    height: style.height,
  };

  switch (component.type) {
    case 'text':
      return (
        <p style={baseStyle} className="text-gray-700 leading-relaxed">
          {component.content.text || 'Texto de exemplo...'}
        </p>
      );

    case 'title':
      const level = component.content.level || 1;
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag 
          style={baseStyle} 
          className={`font-bold text-gray-900 ${
            level === 1 ? 'text-3xl' :
            level === 2 ? 'text-2xl' :
            level === 3 ? 'text-xl' :
            'text-lg'
          }`}
        >
          {component.content.text || 'Título de exemplo'}
        </Tag>
      );

    case 'button':
      return (
        <div className="flex justify-center">
          <Button 
            style={baseStyle}
            className="px-8 py-3"
            size="lg"
          >
            {component.content.text || 'Clique aqui'}
          </Button>
        </div>
      );

    case 'image':
      return (
        <div className="flex justify-center">
          <div style={baseStyle}>
            {component.content.src ? (
              <img
                src={component.content.src}
                alt={component.content.alt || 'Imagem'}
                width={component.content.width}
                height={component.content.height}
                className="rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-64 h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-3xl mb-2">🖼️</div>
                  <div className="text-sm">Imagem de exemplo</div>
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case 'input':
      return (
        <div style={baseStyle} className="space-y-2">
          <Input
            type={component.content.type || 'text'}
            placeholder={component.content.placeholder || 'Digite aqui...'}
            className="w-full"
            disabled
          />
          {component.content.required && (
            <div className="text-xs text-red-500">* Campo obrigatório</div>
          )}
        </div>
      );

    case 'multiple_choice':
      return (
        <div style={baseStyle} className="space-y-3">
          <div className="space-y-2">
            {['Opção A', 'Opção B', 'Opção C'].map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                <span className="text-gray-700">{option}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'level_slider':
      return (
        <div style={baseStyle} className="space-y-4">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-700 mb-2">
              Nível de satisfação
            </div>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className="w-8 h-8 text-yellow-400 fill-current" 
                />
              ))}
            </div>
          </div>
        </div>
      );

    case 'testimonial':
      return (
        <Card style={baseStyle} className="p-6 bg-gray-50">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              👤
            </div>
            <div className="flex-1">
              <blockquote className="text-gray-700 italic mb-2">
                "Este produto mudou completamente minha forma de trabalhar. Recomendo para todos!"
              </blockquote>
              <div className="text-sm text-gray-500">
                — Cliente Satisfeito
              </div>
            </div>
          </div>
        </Card>
      );

    case 'faq':
      return (
        <div style={baseStyle} className="space-y-2">
          <div className="border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <h4 className="font-medium text-gray-900">Como funciona?</h4>
            </div>
            <div className="p-4">
              <p className="text-gray-700 text-sm">
                Resposta explicativa sobre como o produto ou serviço funciona de forma detalhada.
              </p>
            </div>
          </div>
        </div>
      );

    case 'pricing':
      return (
        <div style={baseStyle} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Básico', 'Pro', 'Premium'].map((plan, index) => (
            <Card key={plan} className="p-6 text-center">
              <h3 className="font-bold text-lg mb-2">{plan}</h3>
              <div className="text-3xl font-bold text-primary mb-4">
                R$ {(index + 1) * 29}
                <span className="text-sm text-gray-500">/mês</span>
              </div>
              <Button className="w-full">
                Escolher Plano
              </Button>
            </Card>
          ))}
        </div>
      );

    case 'confetti':
      return (
        <div style={baseStyle} className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Parabéns!
          </h3>
          <p className="text-gray-600">
            Você completou com sucesso!
          </p>
        </div>
      );

    case 'spacer':
      return (
        <div 
          style={{ ...baseStyle, minHeight: '2rem' }}
          className="w-full bg-transparent"
        />
      );

    case 'marquee':
      return (
        <div style={baseStyle} className="overflow-hidden bg-primary text-primary-foreground py-2">
          <div className="animate-pulse text-center">
            📢 Oferta especial! Aproveite 50% de desconto por tempo limitado!
          </div>
        </div>
      );

    default:
      return (
        <div style={baseStyle} className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          <div className="text-2xl mb-2">🔧</div>
          <div className="text-sm">
            Componente {component.type}
            <br />
            <span className="text-xs">(Preview não implementado)</span>
          </div>
        </div>
      );
  }
}
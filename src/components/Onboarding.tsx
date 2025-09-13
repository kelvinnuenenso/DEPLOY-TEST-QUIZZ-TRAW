import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Zap,
  Target,
  Users,
  BarChart3,
  Rocket,
  Sparkles
} from 'lucide-react';

interface OnboardingProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

interface OnboardingData {
  name: string;
  company: string;
  industry: string;
  goals: string[];
  experience: string;
  teamSize: string;
}

const industries = [
  'E-commerce', 'SaaS/Tech', 'Marketing/Agência', 'Consultoria',
  'Educação', 'Saúde', 'Imobiliário', 'Serviços', 'Outros'
];

const goals = [
  { id: 'leads', label: 'Capturar mais leads qualificados', icon: Users },
  { id: 'conversion', label: 'Aumentar taxa de conversão', icon: Target },
  { id: 'engagement', label: 'Engajar minha audiência', icon: Sparkles },
  { id: 'research', label: 'Fazer pesquisas de mercado', icon: BarChart3 },
  { id: 'diagnosis', label: 'Criar diagnósticos personalizados', icon: Zap },
  { id: 'retention', label: 'Melhorar retenção de clientes', icon: Rocket }
];

export function Onboarding({ isOpen, onComplete, onSkip }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    company: '',
    industry: '',
    goals: [],
    experience: '',
    teamSize: ''
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const toggleGoal = (goalId: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(id => id !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Vamos conhecer você! 👋</h2>
        <p className="text-muted-foreground">
          Algumas informações para personalizar sua experiência
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Qual seu nome?</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => updateData('name', e.target.value)}
            placeholder="João Silva"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Nome da empresa (opcional)</Label>
          <Input
            id="company"
            value={data.company}
            onChange={(e) => updateData('company', e.target.value)}
            placeholder="Minha Empresa Ltda"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Qual seu segmento?</Label>
          <Select value={data.industry} onValueChange={(value) => updateData('industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione seu segmento" />
            </SelectTrigger>
            <SelectContent>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Bem-vindo ao Elevado Quizz
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Pular
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Passo {step} de {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          {step === 1 && renderStep1()}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Quais são seus objetivos? 🎯</h2>
                <p className="text-muted-foreground">
                  Selecione todos que se aplicam (máximo 3)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goals.map(goal => {
                  const IconComponent = goal.icon;
                  const isSelected = data.goals.includes(goal.id);
                  const isDisabled = data.goals.length >= 3 && !isSelected;

                  return (
                    <Card 
                      key={goal.id}
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : 
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                      }`}
                      onClick={() => !isDisabled && toggleGoal(goal.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
                          <IconComponent className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                            {goal.label}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>

            <Button onClick={handleNext}>
              {step === totalSteps ? (
                <>
                  <Rocket className="w-4 h-4 mr-1" />
                  Começar!
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
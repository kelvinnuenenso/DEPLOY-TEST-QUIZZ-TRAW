import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Star, Upload, Calendar } from 'lucide-react';
import { Question, QuestionOption, Component } from '@/types/quiz';
import { WrittenResponseField } from './WrittenResponseField';

interface QuestionRendererProps {
  question: Question;
  value?: any;
  onChange: (value: any) => void;
  theme?: any;
  component?: Component; // Para acessar configurações de resposta escrita
  writtenValue?: string;
  onWrittenChange?: (value: string) => void;
}

export function QuestionRenderer({ 
  question, 
  value, 
  onChange, 
  theme, 
  component,
  writtenValue = '',
  onWrittenChange = () => {}
}: QuestionRendererProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const renderSingleChoice = () => (
    <div className="space-y-4">
      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {question.options?.map((option: QuestionOption) => (
          <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Campo de resposta escrita para single choice */}
      {component?.writtenResponse?.enabled && (
        <WrittenResponseField
          config={component.writtenResponse}
          value={writtenValue}
          onChange={onWrittenChange}
        />
      )}
    </div>
  );

  const renderMultipleChoice = () => {
    const selectedValues = Array.isArray(value) ? value : [];
    
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {question.options?.map((option: QuestionOption) => (
            <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id={option.id}
                checked={selectedValues.includes(option.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selectedValues, option.id]);
                  } else {
                    onChange(selectedValues.filter((id: string) => id !== option.id));
                  }
                }}
              />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>

        {/* Campo de resposta escrita para multiple choice */}
        {component?.writtenResponse?.enabled && (
          <WrittenResponseField
            config={component.writtenResponse}
            value={writtenValue}
            onChange={onWrittenChange}
          />
        )}
      </div>
    );
  };

  const renderRating = () => {
    const maxRating = question.settings?.max || 5;
    const currentRating = value || 0;

    return (
      <div className="flex items-center gap-2 justify-center py-4">
        {[...Array(maxRating)].map((_, index) => (
          <Star
            key={index}
            className={`w-8 h-8 cursor-pointer transition-colors ${
              index < currentRating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
            onClick={() => onChange(index + 1)}
          />
        ))}
        <span className="ml-4 text-sm text-muted-foreground">
          {currentRating} de {maxRating}
        </span>
      </div>
    );
  };

  const renderNPS = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-11 gap-2">
        {[...Array(11)].map((_, index) => (
          <Button
            key={index}
            variant={value === index ? "default" : "outline"}
            size="sm"
            className="aspect-square"
            onClick={() => onChange(index)}
          >
            {index}
          </Button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Muito improvável</span>
        <span>Muito provável</span>
      </div>
      {value !== undefined && (
        <div className="text-center text-sm">
          Sua avaliação: <strong>{value}/10</strong>
        </div>
      )}
    </div>
  );

  const renderSlider = () => {
    const min = question.settings?.min || 0;
    const max = question.settings?.max || 10;
    const step = question.settings?.step || 1;
    const currentValue = value || min;

    return (
      <div className="space-y-4 py-4">
        <div className="px-3">
          <Slider
            value={[currentValue]}
            onValueChange={(values) => onChange(values[0])}
            min={min}
            max={max}
            step={step}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{min}</span>
          <span className="font-medium text-foreground">
            Valor selecionado: {currentValue}
          </span>
          <span>{max}</span>
        </div>
      </div>
    );
  };

  const renderTextInput = () => (
    <Input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.settings?.placeholder || 'Digite sua resposta...'}
      className="w-full"
    />
  );

  const renderLongText = () => (
    <Textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.settings?.placeholder || 'Digite sua resposta...'}
      rows={4}
      className="w-full"
    />
  );

  const renderEmail = () => (
    <Input
      type="email"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.settings?.placeholder || 'seu@email.com'}
      className="w-full"
    />
  );

  const renderPhone = () => (
    <Input
      type="tel"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.settings?.placeholder || '(11) 99999-9999'}
      className="w-full"
    />
  );

  const renderDate = () => (
    <div className="relative">
      <Input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10"
      />
      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    </div>
  );

  const renderFileUpload = () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Clique para selecionar ou arraste um arquivo
          </p>
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setUploadedFile(file);
                onChange(file.name);
              }
            }}
            className="hidden"
            id={`file-${question.id}`}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          />
          <Label htmlFor={`file-${question.id}`} className="cursor-pointer">
            <Button type="button" variant="outline" size="sm">
              Selecionar arquivo
            </Button>
          </Label>
        </div>
      </div>
      {uploadedFile && (
        <div className="text-sm text-muted-foreground">
          Arquivo selecionado: <strong>{uploadedFile.name}</strong>
        </div>
      )}
    </div>
  );

  const renderConsent = () => (
    <div className="flex items-start space-x-3 p-4 border rounded-lg">
      <Checkbox
        id={`consent-${question.id}`}
        checked={value || false}
        onCheckedChange={onChange}
      />
      <Label htmlFor={`consent-${question.id}`} className="flex-1 cursor-pointer leading-relaxed">
        {question.title}
      </Label>
    </div>
  );

  const renderCTA = () => (
    <Card className="p-6 text-center bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="space-y-4">
        <h3 className="text-xl font-bold">{question.title}</h3>
        {question.description && (
          <p className="text-muted-foreground">{question.description}</p>
        )}
        <Button
          size="lg"
          className="w-full max-w-xs"
          onClick={() => {
            onChange(true);
            // In a real app, this would trigger the CTA action
            if (question.settings?.href) {
              window.open(question.settings.href, '_blank');
            }
          }}
        >
          {question.settings?.buttonText || 'Continuar'}
        </Button>
      </div>
    </Card>
  );

  switch (question.type) {
    case 'single':
      return renderSingleChoice();
    case 'multiple':
      return renderMultipleChoice();
    case 'rating':
      return renderRating();
    case 'nps':
      return renderNPS();
    case 'slider':
      return renderSlider();
    case 'short_text':
      return renderTextInput();
    case 'long_text':
      return renderLongText();
    case 'email':
      return renderEmail();
    case 'phone':
      return renderPhone();
    case 'date':
      return renderDate();
    case 'file':
      return renderFileUpload();
    case 'consent':
      return renderConsent();
    case 'cta':
      return renderCTA();
    default:
      return <div>Tipo de pergunta não suportado: {question.type}</div>;
  }
}
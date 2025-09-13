import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { WrittenResponseConfig } from '@/types/quiz';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface WrittenResponseFieldProps {
  config: WrittenResponseConfig;
  value?: string;
  onChange: (value: string) => void;
}

export function WrittenResponseField({ config, value = '', onChange }: WrittenResponseFieldProps) {
  const [error, setError] = useState<string | null>(null);

  const validateInput = (inputValue: string) => {
    // Validar comprimento
    if (config.minLength && inputValue.length < config.minLength) {
      return `Mínimo de ${config.minLength} caracteres necessários`;
    }
    if (config.maxLength && inputValue.length > config.maxLength) {
      return `Máximo de ${config.maxLength} caracteres permitidos`;
    }

    // Validações específicas por tipo
    switch (config.validation) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (inputValue && !emailRegex.test(inputValue)) {
          return 'E-mail inválido';
        }
        break;
      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (inputValue && !phoneRegex.test(inputValue.replace(/\D/g, ''))) {
          return 'Telefone inválido';
        }
        break;
      case 'number':
        if (inputValue && isNaN(Number(inputValue))) {
          return 'Apenas números são permitidos';
        }
        break;
      case 'text':
        const textRegex = /^[a-zA-ZÀ-ÿ\s]*$/;
        if (inputValue && !textRegex.test(inputValue)) {
          return 'Apenas letras são permitidas';
        }
        break;
    }

    return null;
  };

  const handleChange = (inputValue: string) => {
    const validationError = validateInput(inputValue);
    setError(validationError);
    onChange(inputValue);
  };

  const isValid = !error && (!config.required || value.length > 0);
  const characterCount = value.length;
  const maxLength = config.maxLength;

  return (
    <div className="space-y-2 mt-4 p-4 border-2 border-dashed border-orange-200 rounded-lg bg-orange-50/30">
      <div className="flex items-center gap-2 mb-2">
        <Label className="text-sm font-medium text-orange-900">
          💭 Resposta por escrito
          {config.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {isValid && value && (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        )}
      </div>

      {config.allowMultiline ? (
        <Textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={config.placeholder || 'Digite sua resposta aqui...'}
          className={`w-full transition-colors ${
            error ? 'border-red-300 focus:border-red-500' : 'border-orange-200 focus:border-orange-400'
          }`}
          rows={3}
          maxLength={maxLength}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={config.placeholder || 'Digite sua resposta aqui...'}
          className={`w-full transition-colors ${
            error ? 'border-red-300 focus:border-red-500' : 'border-orange-200 focus:border-orange-400'
          }`}
          type={config.validation === 'email' ? 'email' : config.validation === 'number' ? 'number' : 'text'}
          maxLength={maxLength}
        />
      )}

      {/* Contador de caracteres e feedback */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {error && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span>{error}</span>
            </div>
          )}
          {!error && config.required && !value && (
            <span className="text-muted-foreground">Campo obrigatório</span>
          )}
        </div>
        
        {maxLength && (
          <span className={`${characterCount > maxLength * 0.9 ? 'text-orange-600' : 'text-muted-foreground'}`}>
            {characterCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
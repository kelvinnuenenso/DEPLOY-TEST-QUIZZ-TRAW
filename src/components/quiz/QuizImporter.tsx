import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ImportService } from '@/services/ImportService';
import { Quiz } from '@/types/quiz';
import { Download, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

interface QuizImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (quiz: Quiz) => void;
}

const QuizImporter = ({ open, onOpenChange, onImport }: QuizImporterProps) => {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState(ImportService.getApiKey() || '');
  const [isLoading, setIsLoading] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'config' | 'preview'>('config');

  const handleApiKeyTest = async () => {
    if (!apiKey.trim()) {
      setError('Por favor, insira sua chave da API Firecrawl');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const isValid = await ImportService.testApiKey(apiKey);
      if (isValid) {
        ImportService.saveApiKey(apiKey);
        setError(null);
      } else {
        setError('Chave da API inválida. Verifique sua chave no Firecrawl.');
      }
    } catch (error) {
      setError('Erro ao testar a chave da API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!url.trim()) {
      setError('Por favor, insira uma URL válida');
      return;
    }

    if (!apiKey.trim()) {
      setError('Por favor, configure sua chave da API Firecrawl primeiro');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ImportService.importQuiz(url);
      
      if (result.success && result.data) {
        setPreviewQuiz(result.data);
        setStep('preview');
      } else {
        setError(result.error || 'Erro ao importar quiz');
      }
    } catch (error) {
      setError('Erro ao processar importação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (previewQuiz) {
      onImport(previewQuiz);
      handleClose();
    }
  };

  const handleClose = () => {
    setUrl('');
    setError(null);
    setPreviewQuiz(null);
    setStep('config');
    onOpenChange(false);
  };

  const getSupportedPlatforms = () => [
    { name: 'Typeform', url: 'typeform.com', status: 'supported' },
    { name: 'Google Forms', url: 'forms.gle', status: 'supported' },
    { name: 'Microsoft Forms', url: 'forms.office.com', status: 'supported' },
    { name: 'Formulários Genéricos', url: 'HTML/Web', status: 'partial' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Importar Quiz Externo
          </DialogTitle>
          <DialogDescription>
            Importe quizzes de outras plataformas usando URL pública
          </DialogDescription>
        </DialogHeader>

        {step === 'config' && (
          <div className="space-y-6">
            {/* API Key Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuração da API</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api-key">Chave da API Firecrawl</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="api-key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="fc-xxxxxxxxxxxxx"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleApiKeyTest}
                      disabled={isLoading}
                    >
                      {isLoading ? <LoadingSpinner size="sm" /> : 'Testar'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Obtenha sua chave gratuita em{' '}
                    <a 
                      href="https://firecrawl.dev" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:text-primary"
                    >
                      firecrawl.dev
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Supported Platforms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plataformas Suportadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {getSupportedPlatforms().map((platform) => (
                    <div key={platform.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        <p className="text-xs text-muted-foreground">{platform.url}</p>
                      </div>
                      <Badge variant={platform.status === 'supported' ? 'default' : 'secondary'}>
                        {platform.status === 'supported' ? 'Suportado' : 'Parcial'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* URL Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">URL do Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="quiz-url">URL pública do quiz</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="quiz-url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.typeform.com/to/xxxxxx"
                      className="flex-1"
                    />
                    <Button onClick={handleImport} disabled={isLoading || !apiKey}>
                      {isLoading ? <LoadingSpinner size="sm" /> : 'Importar'}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Importante:</strong> Certifique-se que o quiz está público e acessível. 
                    Formulários privados ou protegidos por login não podem ser importados.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'preview' && previewQuiz && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Quiz Importado com Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{previewQuiz.name}</h3>
                  <p className="text-muted-foreground">{previewQuiz.description}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{previewQuiz.questions.length} perguntas importadas</span>
                  <Badge variant="secondary">Rascunho</Badge>
                </div>

                <div className="border rounded-lg p-4 max-h-60 overflow-auto">
                  <h4 className="font-medium mb-3">Preview das Perguntas:</h4>
                  <div className="space-y-3">
                    {previewQuiz.questions.slice(0, 5).map((question, index) => (
                      <div key={question.id} className="p-3 bg-muted rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">Q{index + 1}</span>
                          <Badge variant="outline">{question.type}</Badge>
                        </div>
                        <p className="text-sm">{question.title}</p>
                        {question.options && question.options.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {question.options.slice(0, 3).map((option) => (
                              <div key={option.id} className="text-xs text-muted-foreground pl-2">
                                • {option.label}
                              </div>
                            ))}
                            {question.options.length > 3 && (
                              <div className="text-xs text-muted-foreground pl-2">
                                + {question.options.length - 3} opções...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {previewQuiz.questions.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        + {previewQuiz.questions.length - 5} perguntas adicionais...
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between gap-3">
                  <Button variant="outline" onClick={() => setStep('config')}>
                    Voltar
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleClose}>
                      Cancelar
                    </Button>
                    <Button onClick={handleConfirmImport}>
                      Criar Quiz
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuizImporter;
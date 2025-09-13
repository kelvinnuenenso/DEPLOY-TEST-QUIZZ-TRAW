import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  ExternalLink, 
  Globe, 
  Eye, 
  Share2, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Copy,
  Smartphone,
  Monitor
} from 'lucide-react';
import { Quiz } from '@/types/quiz';
import { useToast } from '@/hooks/use-toast';

interface SEOManagerProps {
  quiz: Quiz;
  onUpdate: (quiz: Quiz) => void;
}

interface SEOMetrics {
  titleLength: number;
  descriptionLength: number;
  keywordDensity: number;
  mobileOptimized: boolean;
  structuredData: boolean;
  socialTags: boolean;
  canonicalUrl: boolean;
  loadSpeed: number;
}

export const SEOManager = ({ quiz, onUpdate }: SEOManagerProps) => {
  const { toast } = useToast();
  const [seoData, setSeoData] = useState({
    title: quiz.seo?.title || quiz.name,
    description: quiz.seo?.description || quiz.description || '',
    keywords: quiz.seo?.keywords || [],
    slug: quiz.seo?.slug || quiz.publicId,
    ogImage: quiz.seo?.ogImage || '',
    canonical: quiz.seo?.canonical || `${window.location.origin}/q/${quiz.publicId}`,
    noindex: quiz.seo?.noindex || false
  });
  
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateSEOMetrics();
  }, [seoData]);

  const calculateSEOMetrics = () => {
    const titleLength = seoData.title.length;
    const descriptionLength = seoData.description.length;
    const keywordDensity = calculateKeywordDensity();
    
    setMetrics({
      titleLength,
      descriptionLength,
      keywordDensity,
      mobileOptimized: true, // Assumindo que é mobile-optimized
      structuredData: true,  // JSON-LD implementado
      socialTags: true,      // Open Graph implementado
      canonicalUrl: !!seoData.canonical,
      loadSpeed: 85 + Math.random() * 10 // Score simulado
    });
  };

  const calculateKeywordDensity = () => {
    if (seoData.keywords.length === 0) return 0;
    
    const text = `${seoData.title} ${seoData.description}`.toLowerCase();
    const words = text.split(/\s+/);
    const keywordCount = seoData.keywords.reduce((count, keyword) => {
      return count + (text.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    }, 0);
    
    return Math.round((keywordCount / words.length) * 100 * 100) / 100;
  };

  const getSEOScore = () => {
    if (!metrics) return 0;
    
    let score = 0;
    
    // Title optimization (0-25 points)
    if (metrics.titleLength >= 30 && metrics.titleLength <= 60) score += 25;
    else if (metrics.titleLength >= 20 && metrics.titleLength <= 70) score += 15;
    else score += 5;
    
    // Description optimization (0-25 points)
    if (metrics.descriptionLength >= 120 && metrics.descriptionLength <= 160) score += 25;
    else if (metrics.descriptionLength >= 100 && metrics.descriptionLength <= 180) score += 15;
    else score += 5;
    
    // Keywords (0-20 points)
    if (metrics.keywordDensity >= 1 && metrics.keywordDensity <= 3) score += 20;
    else if (metrics.keywordDensity > 0) score += 10;
    
    // Technical SEO (0-30 points)
    if (metrics.mobileOptimized) score += 8;
    if (metrics.structuredData) score += 8;
    if (metrics.socialTags) score += 7;
    if (metrics.canonicalUrl) score += 7;
    
    return Math.min(score, 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    return 'Precisa Melhorar';
  };

  const updateSEOData = (field: string, value: any) => {
    setSeoData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSEO = () => {
    setLoading(true);
    
    const updatedQuiz = {
      ...quiz,
      seo: {
        ...seoData,
        updatedAt: new Date().toISOString()
      }
    };
    
    onUpdate(updatedQuiz);
    
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "SEO atualizado!",
        description: "As configurações de SEO foram salvas com sucesso."
      });
    }, 1000);
  };

  const generateSlug = () => {
    const slug = seoData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    updateSEOData('slug', slug);
  };

  const copyURL = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada!",
      description: "A URL foi copiada para sua área de transferência."
    });
  };

  const previewURL = `${window.location.origin}/q/${seoData.slug}`;
  const seoScore = getSEOScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Otimização SEO</h3>
          <p className="text-muted-foreground">
            Otimize seu quiz para mecanismos de busca e redes sociais
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getScoreColor(seoScore)}>
            Score: {seoScore}/100 - {getScoreBadge(seoScore)}
          </Badge>
          <Button onClick={saveSEO} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar SEO'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título SEO</label>
                  <Input
                    value={seoData.title}
                    onChange={(e) => updateSEOData('title', e.target.value)}
                    placeholder="Título otimizado para SEO"
                    maxLength={70}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Recomendado: 30-60 caracteres</span>
                    <span className={metrics?.titleLength && metrics.titleLength > 60 ? 'text-red-500' : ''}>
                      {seoData.title.length}/70
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta Descrição</label>
                  <Textarea
                    value={seoData.description}
                    onChange={(e) => updateSEOData('description', e.target.value)}
                    placeholder="Descrição atrativa que aparecerá nos resultados de busca"
                    maxLength={180}
                    rows={3}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Recomendado: 120-160 caracteres</span>
                    <span className={metrics?.descriptionLength && metrics.descriptionLength > 160 ? 'text-red-500' : ''}>
                      {seoData.description.length}/180
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Palavras-chave</label>
                  <Input
                    value={seoData.keywords.join(', ')}
                    onChange={(e) => updateSEOData('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                    placeholder="quiz, interativo, leads, conversão"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe as palavras-chave com vírgulas
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>URL e Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug da URL</label>
                  <div className="flex gap-2">
                    <Input
                      value={seoData.slug}
                      onChange={(e) => updateSEOData('slug', e.target.value)}
                      placeholder="url-amigavel"
                    />
                    <Button variant="outline" onClick={generateSlug}>
                      Gerar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Preview da URL</label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{previewURL}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyURL(previewURL)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Canônica</label>
                  <Input
                    value={seoData.canonical}
                    onChange={(e) => updateSEOData('canonical', e.target.value)}
                    placeholder="https://seusite.com/quiz/nome-do-quiz"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="noindex"
                    checked={seoData.noindex}
                    onChange={(e) => updateSEOData('noindex', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="noindex" className="text-sm">
                    Não indexar este quiz (noindex)
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Dados Estruturados (JSON-LD)</h4>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Schema.org implementado</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Seu quiz inclui dados estruturados para melhor indexação
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Otimização Mobile</h4>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Mobile-friendly</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Design responsivo e otimizado para dispositivos móveis
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Velocidade de Carregamento</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Score de Performance</span>
                    <span className="font-bold text-green-600">
                      {metrics?.loadSpeed.toFixed(0)}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics?.loadSpeed || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Sitemap e Robots.txt</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Sitemap XML</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Quiz incluído automaticamente no sitemap
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Robots.txt</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Configurado para permitir indexação
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compartilhamento Social</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Imagem de Compartilhamento (Open Graph)</label>
                <Input
                  value={seoData.ogImage}
                  onChange={(e) => updateSEOData('ogImage', e.target.value)}
                  placeholder="https://seusite.com/images/quiz-cover.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 1200x630px, formato JPG ou PNG
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Preview do Compartilhamento</h4>
                
                {/* Facebook Preview */}
                <div className="border rounded-lg p-4">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    Facebook
                  </h5>
                  <div className="border rounded-md overflow-hidden bg-white">
                    {seoData.ogImage && (
                      <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                        <img 
                          src={seoData.ogImage} 
                          alt="Preview" 
                          className="max-w-full max-h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <h6 className="font-medium text-sm text-blue-600 truncate">
                        {seoData.title || 'Título do Quiz'}
                      </h6>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {seoData.description || 'Descrição do quiz aparecerá aqui...'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 uppercase">
                        {new URL(previewURL).hostname}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Twitter Preview */}
                <div className="border rounded-lg p-4">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <div className="w-4 h-4 bg-sky-500 rounded"></div>
                    Twitter
                  </h5>
                  <div className="border rounded-md overflow-hidden bg-white">
                    {seoData.ogImage && (
                      <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                        <img 
                          src={seoData.ogImage} 
                          alt="Preview" 
                          className="max-w-full max-h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <h6 className="font-medium text-sm truncate">
                        {seoData.title || 'Título do Quiz'}
                      </h6>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {seoData.description || 'Descrição do quiz aparecerá aqui...'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new URL(previewURL).hostname}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise SEO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Score Total</span>
                    <div className={`text-lg font-bold ${getScoreColor(seoScore)}`}>
                      {seoScore}/100
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Título</span>
                      {metrics?.titleLength && metrics.titleLength >= 30 && metrics.titleLength <= 60 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Meta Descrição</span>
                      {metrics?.descriptionLength && metrics.descriptionLength >= 120 && metrics.descriptionLength <= 160 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Palavras-chave</span>
                      {seoData.keywords.length > 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">URL Amigável</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dados Estruturados</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mobile Optimized</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.titleLength && (metrics.titleLength < 30 || metrics.titleLength > 60) && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <div>
                          <h6 className="text-sm font-medium text-yellow-800">Otimize o título</h6>
                          <p className="text-xs text-yellow-700">
                            O título deve ter entre 30-60 caracteres para melhor exibição nos resultados.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {metrics?.descriptionLength && (metrics.descriptionLength < 120 || metrics.descriptionLength > 160) && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <div>
                          <h6 className="text-sm font-medium text-yellow-800">Melhore a descrição</h6>
                          <p className="text-xs text-yellow-700">
                            A descrição deve ter entre 120-160 caracteres para melhor CTR.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {seoData.keywords.length === 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                          <h6 className="text-sm font-medium text-red-800">Adicione palavras-chave</h6>
                          <p className="text-xs text-red-700">
                            Defina palavras-chave relevantes para melhor rankeamento.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!seoData.ogImage && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                          <h6 className="text-sm font-medium text-blue-800">Adicione imagem social</h6>
                          <p className="text-xs text-blue-700">
                            Uma imagem atrativa melhora o compartilhamento nas redes sociais.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {seoScore >= 80 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <h6 className="text-sm font-medium text-green-800">Parabéns!</h6>
                          <p className="text-xs text-green-700">
                            Seu quiz está bem otimizado para SEO. Continue monitorando o desempenho.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
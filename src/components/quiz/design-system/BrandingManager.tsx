import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Upload, Download, Image as ImageIcon, Globe, Share2, 
  Star, Tag, Link, Eye, Settings, Crown
} from 'lucide-react';

interface BrandingConfig {
  logo: {
    file?: string;
    position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    size: 'sm' | 'md' | 'lg';
    showText: boolean;
    text?: string;
  };
  watermark: {
    enabled: boolean;
    text: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
  };
  favicon: {
    file?: string;
    generated: boolean;
  };
  social: {
    title: string;
    description: string;
    image?: string;
    twitterCard: 'summary' | 'summary_large_image';
    ogType: 'website' | 'article';
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
    robots: string;
  };
  customDomain: {
    enabled: boolean;
    domain?: string;
    subdomain?: string;
  };
}

interface BrandingManagerProps {
  config: BrandingConfig;
  onChange: (config: BrandingConfig) => void;
  onPreview: () => void;
}

const LOGO_POSITIONS = [
  { value: 'top-left', label: 'Superior Esquerda' },
  { value: 'top-center', label: 'Superior Centro' },
  { value: 'top-right', label: 'Superior Direita' },
  { value: 'bottom-left', label: 'Inferior Esquerda' },
  { value: 'bottom-center', label: 'Inferior Centro' },
  { value: 'bottom-right', label: 'Inferior Direita' },
];

const WATERMARK_POSITIONS = [
  { value: 'top-left', label: 'Superior Esquerda' },
  { value: 'top-right', label: 'Superior Direita' },
  { value: 'bottom-left', label: 'Inferior Esquerda' },
  { value: 'bottom-right', label: 'Inferior Direita' },
  { value: 'center', label: 'Centro' },
];

export function BrandingManager({ config, onChange, onPreview }: BrandingManagerProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [socialImageFile, setSocialImageFile] = useState<File | null>(null);

  const updateConfig = (path: string, value: any) => {
    const newConfig = { ...config };
    const keys = path.split('.');
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onChange(newConfig);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      // Simular upload - em produção, fazer upload real
      updateConfig('logo.file', URL.createObjectURL(file));
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      updateConfig('favicon.file', URL.createObjectURL(file));
    }
  };

  const generateFavicon = () => {
    // Gerar favicon automaticamente a partir do logo ou cores do tema
    updateConfig('favicon.generated', true);
  };

  const addKeyword = (keyword: string) => {
    if (keyword && !config.seo.keywords.includes(keyword)) {
      updateConfig('seo.keywords', [...config.seo.keywords, keyword]);
    }
  };

  const removeKeyword = (keyword: string) => {
    updateConfig('seo.keywords', config.seo.keywords.filter(k => k !== keyword));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Gerenciador de Branding
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure a identidade visual e otimização para compartilhamento
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar Configurações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logo" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logo">Logo & Marca</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="domain">Domínio</TabsTrigger>
        </TabsList>

        <TabsContent value="logo" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Logo</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Upload do Logo</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload">
                        <Button variant="outline" className="w-full cursor-pointer" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Escolher Arquivo
                          </span>
                        </Button>
                      </label>
                    </div>
                    {config.logo.file && (
                      <div className="mt-2 p-2 border rounded-lg">
                        <img 
                          src={config.logo.file} 
                          alt="Logo preview" 
                          className="h-16 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label>Posição</Label>
                    <Select 
                      value={config.logo.position} 
                      onValueChange={(value) => updateConfig('logo.position', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOGO_POSITIONS.map((position) => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Tamanho</Label>
                    <Select 
                      value={config.logo.size} 
                      onValueChange={(value) => updateConfig('logo.size', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sm">Pequeno</SelectItem>
                        <SelectItem value="md">Médio</SelectItem>
                        <SelectItem value="lg">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Mostrar Texto da Marca</Label>
                    <Switch
                      checked={config.logo.showText}
                      onCheckedChange={(checked) => updateConfig('logo.showText', checked)}
                    />
                  </div>
                  
                  {config.logo.showText && (
                    <div>
                      <Label>Texto da Marca</Label>
                      <Input
                        value={config.logo.text || ''}
                        onChange={(e) => updateConfig('logo.text', e.target.value)}
                        placeholder="Nome da sua marca"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Marca d'água & Favicon</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Ativar Marca d'água</Label>
                    <Switch
                      checked={config.watermark.enabled}
                      onCheckedChange={(checked) => updateConfig('watermark.enabled', checked)}
                    />
                  </div>
                  
                  {config.watermark.enabled && (
                    <>
                      <div>
                        <Label>Texto da Marca d'água</Label>
                        <Input
                          value={config.watermark.text}
                          onChange={(e) => updateConfig('watermark.text', e.target.value)}
                          placeholder="© Sua Marca"
                        />
                      </div>
                      
                      <div>
                        <Label>Posição</Label>
                        <Select 
                          value={config.watermark.position} 
                          onValueChange={(value) => updateConfig('watermark.position', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WATERMARK_POSITIONS.map((position) => (
                              <SelectItem key={position.value} value={position.value}>
                                {position.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Opacidade: {config.watermark.opacity}%</Label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={config.watermark.opacity}
                          onChange={(e) => updateConfig('watermark.opacity', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="border-t pt-4">
                    <Label>Favicon</Label>
                    <div className="space-y-2 mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFaviconUpload}
                        className="hidden"
                        id="favicon-upload"
                      />
                      <label htmlFor="favicon-upload">
                        <Button variant="outline" size="sm" className="w-full cursor-pointer" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Favicon
                          </span>
                        </Button>
                      </label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={generateFavicon}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Gerar Automaticamente
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Metadados para Redes Sociais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Título para Compartilhamento</Label>
                    <Input
                      value={config.social.title}
                      onChange={(e) => updateConfig('social.title', e.target.value)}
                      placeholder="Título que aparecerá nas redes sociais"
                    />
                  </div>
                  
                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={config.social.description}
                      onChange={(e) => updateConfig('social.description', e.target.value)}
                      placeholder="Descrição que aparecerá nas redes sociais"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>Tipo de Card Twitter</Label>
                    <Select 
                      value={config.social.twitterCard} 
                      onValueChange={(value) => updateConfig('social.twitterCard', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Resumo</SelectItem>
                        <SelectItem value="summary_large_image">Imagem Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Tipo OpenGraph</Label>
                    <Select 
                      value={config.social.ogType} 
                      onValueChange={(value) => updateConfig('social.ogType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="article">Artigo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Imagem de Compartilhamento</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSocialImageFile(file);
                            updateConfig('social.image', URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                        id="social-image-upload"
                      />
                      <label htmlFor="social-image-upload">
                        <Button variant="outline" className="w-full cursor-pointer" asChild>
                          <span>
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Escolher Imagem (1200x630px)
                          </span>
                        </Button>
                      </label>
                    </div>
                    {config.social.image && (
                      <div className="mt-2 p-2 border rounded-lg">
                        <img 
                          src={config.social.image} 
                          alt="Social media preview" 
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Preview do card social */}
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="text-sm font-medium mb-2">Preview Facebook/LinkedIn</h4>
                    <div className="border rounded bg-background overflow-hidden">
                      {config.social.image && (
                        <img 
                          src={config.social.image} 
                          alt="Preview" 
                          className="w-full h-24 object-cover"
                        />
                      )}
                      <div className="p-3">
                        <h5 className="font-medium text-sm truncate">
                          {config.social.title || 'Título do Quiz'}
                        </h5>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {config.social.description || 'Descrição do quiz...'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          elevado-quiz.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Otimização para Buscadores (SEO)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Título SEO (60 caracteres)</Label>
                    <Input
                      value={config.seo.title}
                      onChange={(e) => updateConfig('seo.title', e.target.value)}
                      placeholder="Título otimizado para SEO"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {config.seo.title.length}/60 caracteres
                    </p>
                  </div>
                  
                  <div>
                    <Label>Meta Descrição (160 caracteres)</Label>
                    <Textarea
                      value={config.seo.description}
                      onChange={(e) => updateConfig('seo.description', e.target.value)}
                      placeholder="Descrição otimizada para SEO"
                      maxLength={160}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {config.seo.description.length}/160 caracteres
                    </p>
                  </div>
                  
                  <div>
                    <Label>URL Canônica</Label>
                    <Input
                      value={config.seo.canonicalUrl || ''}
                      onChange={(e) => updateConfig('seo.canonicalUrl', e.target.value)}
                      placeholder="https://seusite.com/quiz"
                    />
                  </div>
                  
                  <div>
                    <Label>Robots Meta Tag</Label>
                    <Select 
                      value={config.seo.robots} 
                      onValueChange={(value) => updateConfig('seo.robots', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="index,follow">Index, Follow</SelectItem>
                        <SelectItem value="noindex,follow">NoIndex, Follow</SelectItem>
                        <SelectItem value="index,nofollow">Index, NoFollow</SelectItem>
                        <SelectItem value="noindex,nofollow">NoIndex, NoFollow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Palavras-chave</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Adicionar palavra-chave"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addKeyword(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Adicionar palavra-chave"]') as HTMLInputElement;
                          if (input?.value) {
                            addKeyword(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        <Tag className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {config.seo.keywords.map((keyword) => (
                        <Badge 
                          key={keyword} 
                          variant="secondary" 
                          className="cursor-pointer"
                          onClick={() => removeKeyword(keyword)}
                        >
                          {keyword} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Preview SEO */}
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="text-sm font-medium mb-2">Preview Google</h4>
                    <div className="space-y-1">
                      <h5 className="text-blue-600 text-sm font-medium">
                        {config.seo.title || 'Título do Quiz'}
                      </h5>
                      <p className="text-green-700 text-xs">
                        {config.seo.canonicalUrl || 'https://elevado-quiz.com/meu-quiz'}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {config.seo.description || 'Descrição do quiz...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="domain" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuração de Domínio</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Domínio Personalizado</Label>
                    <p className="text-sm text-muted-foreground">
                      Use seu próprio domínio ou subdomínio
                    </p>
                  </div>
                  <Switch
                    checked={config.customDomain.enabled}
                    onCheckedChange={(checked) => updateConfig('customDomain.enabled', checked)}
                  />
                </div>
                
                {config.customDomain.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Domínio Principal</Label>
                      <Input
                        value={config.customDomain.domain || ''}
                        onChange={(e) => updateConfig('customDomain.domain', e.target.value)}
                        placeholder="meusite.com"
                      />
                    </div>
                    
                    <div>
                      <Label>Subdomínio</Label>
                      <Input
                        value={config.customDomain.subdomain || ''}
                        onChange={(e) => updateConfig('customDomain.subdomain', e.target.value)}
                        placeholder="quiz"
                      />
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Instruções de Configuração
                  </h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>1. Configure o DNS do seu domínio para apontar para nossos servidores</p>
                    <p>2. Adicione um registro CNAME: <code className="bg-blue-100 px-1 rounded">quiz.seudominio.com CNAME elevado-quiz.vercel.app</code></p>
                    <p>3. Aguarde a propagação do DNS (até 24h)</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    URL atual: {config.customDomain.enabled && config.customDomain.subdomain && config.customDomain.domain 
                      ? `${config.customDomain.subdomain}.${config.customDomain.domain}`
                      : 'elevado-quiz.vercel.app/seu-quiz'
                    }
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
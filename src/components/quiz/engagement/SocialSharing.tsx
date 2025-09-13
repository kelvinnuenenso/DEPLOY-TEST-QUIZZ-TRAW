import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { QuizTheme } from '@/types/quiz';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Share, 
  MessageCircle, 
  Instagram, 
  Facebook,
  Twitter,
  Copy,
  Image,
  Link2,
  Eye
} from 'lucide-react';

interface SocialSharingProps {
  theme: QuizTheme;
  onUpdate: (theme: QuizTheme) => void;
  quizId: string;
}

export function SocialSharing({ theme, onUpdate, quizId }: SocialSharingProps) {
  const isMobile = useIsMobile();
  
  const getSocialConfig = () => ({
    enabled: theme.socialSharingEnabled || false,
    platforms: {
      whatsapp: theme.socialSharingWhatsApp || true,
      instagram: theme.socialSharingInstagram || true,
      facebook: theme.socialSharingFacebook || false,
      twitter: theme.socialSharingTwitter || false,
    },
    customization: {
      logo: theme.socialSharingLogo || theme.logo || '',
      ctaText: theme.socialSharingCTA || 'Descubra seu perfil neste quiz incrível!',
      redirectUrl: theme.socialSharingRedirectUrl || '',
      customMessage: theme.socialSharingCustomMessage || '',
    }
  });

  const config = getSocialConfig();

  const handleUpdate = (updates: Partial<QuizTheme>) => {
    onUpdate({ ...theme, ...updates });
  };

  const updatePlatform = (platform: string, enabled: boolean) => {
    handleUpdate({ [`socialSharing${platform.charAt(0).toUpperCase() + platform.slice(1)}`]: enabled });
  };

  const updateCustomization = (key: string, value: string) => {
    handleUpdate({ [`socialSharing${key}`]: value });
  };

  const generateShareText = () => {
    const baseText = config.customization.ctaText || 'Descubra seu perfil neste quiz incrível!';
    const quizUrl = `${window.location.origin}/q/${quizId}`;
    return `${baseText}\n\n${quizUrl}`;
  };

  const socialPlatforms = [
    {
      key: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-600',
      description: 'Compartilhamento direto via WhatsApp',
      enabled: config.platforms.whatsapp
    },
    {
      key: 'instagram',
      name: 'Instagram Stories',
      icon: Instagram,
      color: 'text-pink-600',
      description: 'Card otimizado para Stories',
      enabled: config.platforms.instagram
    },
    {
      key: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      description: 'Post com preview rico',
      enabled: config.platforms.facebook
    },
    {
      key: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      description: 'Tweet com card visual',
      enabled: config.platforms.twitter
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Configuration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Share className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Quiz Social – Compartilhável</h3>
              <p className="text-sm text-muted-foreground">
                Facilite o compartilhamento em redes sociais com cards personalizados
              </p>
            </div>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => handleUpdate({ socialSharingEnabled: enabled })}
          />
        </div>

        {config.enabled && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ✨ Quando habilitado, aparecerão botões de compartilhamento no final do quiz
            </p>
          </div>
        )}
      </Card>

      {config.enabled && (
        <>
          {/* Platform Selection */}
          <Card className="p-6">
            <h4 className="font-medium mb-4">Plataformas Disponíveis</h4>
            
            <div className="space-y-4">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <div key={platform.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${platform.color}`} />
                      <div>
                        <Label className="text-sm font-medium">{platform.name}</Label>
                        <p className="text-xs text-muted-foreground">
                          {platform.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={platform.enabled}
                      onCheckedChange={(enabled) => updatePlatform(platform.key, enabled)}
                    />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Customization */}
          <Card className="p-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Personalização do Card
            </h4>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Logo do Card</Label>
                <Input
                  placeholder="URL da imagem do logo"
                  value={config.customization.logo}
                  onChange={(e) => updateCustomization('Logo', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Será exibido no card compartilhado
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Texto de CTA</Label>
                <Textarea
                  placeholder="Descubra seu perfil neste quiz incrível!"
                  value={config.customization.ctaText}
                  onChange={(e) => updateCustomization('CTA', e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Link de Redirecionamento</Label>
                <Input
                  placeholder="https://seusite.com/landing (opcional)"
                  value={config.customization.redirectUrl}
                  onChange={(e) => updateCustomization('RedirectUrl', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Se preenchido, redireciona para este link em vez do quiz
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Mensagem Personalizada</Label>
                <Textarea
                  placeholder="Acabei de descobrir meu perfil! Que tal descobrir o seu?"
                  value={config.customization.customMessage}
                  onChange={(e) => updateCustomization('CustomMessage', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Mensagem que aparece junto com o link compartilhado
                </p>
              </div>
            </div>
          </Card>

          {/* Preview */}
          <Card className="p-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Pré-visualização do Compartilhamento
            </h4>
            
            {/* WhatsApp Preview */}
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">WhatsApp</span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-sm">
                  <p className="whitespace-pre-line">{generateShareText()}</p>
                </div>
              </div>

              {/* Instagram Preview */}
              <div className="p-4 bg-pink-50 dark:bg-pink-950/50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span className="text-sm font-medium">Instagram Stories</span>
                </div>
                <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-1 rounded-lg">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                    {config.customization.logo && (
                      <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                    )}
                    <p className="text-sm font-medium mb-1">Quiz Personalizado</p>
                    <p className="text-xs text-muted-foreground">
                      {config.customization.ctaText}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copiar Link
              </Button>
              <Button variant="outline" size="sm">
                <Link2 className="w-4 h-4 mr-2" />
                Testar Compartilhamento
              </Button>
            </div>
          </Card>

          {/* Implementation Note */}
          <Card className="p-6">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
              <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                📱 Como Funciona
              </h5>
              <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                <p>• Botões aparecem automaticamente no final do quiz</p>
                <p>• Cards são gerados dinamicamente com as informações configuradas</p>
                <p>• Links incluem UTM automático para rastreamento</p>
                <p>• WhatsApp e Instagram têm formatos otimizados para cada plataforma</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
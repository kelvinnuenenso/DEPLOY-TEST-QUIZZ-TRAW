import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { QuizTheme } from '@/types/quiz';
import { 
  Film, 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Monitor,
  Smartphone,
  Eye,
  Download,
  Trash2,
  Link as LinkIcon
} from 'lucide-react';

interface VideoBackgroundProps {
  theme: QuizTheme;
  onUpdate: (theme: QuizTheme) => void;
}

const videoPresets = [
  {
    id: 'abstract-blue',
    name: 'Abstrato Azul',
    url: 'https://cdn.pixabay.com/video/2016/05/09/3333-166937754_large.mp4',
    thumbnail: '/video-thumbs/abstract-blue.jpg',
    category: 'abstract'
  },
  {
    id: 'particles',
    name: 'Partículas',
    url: 'https://cdn.pixabay.com/video/2019/07/27/25002-353850874_large.mp4',
    thumbnail: '/video-thumbs/particles.jpg',
    category: 'abstract'
  },
  {
    id: 'geometric',
    name: 'Geométrico',
    url: 'https://cdn.pixabay.com/video/2020/01/30/32044-391336900_large.mp4',
    thumbnail: '/video-thumbs/geometric.jpg',
    category: 'abstract'
  },
  {
    id: 'nature-forest',
    name: 'Floresta',
    url: 'https://cdn.pixabay.com/video/2016/08/05/4716-175799584_large.mp4',
    thumbnail: '/video-thumbs/forest.jpg',
    category: 'nature'
  },
  {
    id: 'nature-ocean',
    name: 'Oceano',
    url: 'https://cdn.pixabay.com/video/2016/07/26/4326-173546264_large.mp4',
    thumbnail: '/video-thumbs/ocean.jpg',
    category: 'nature'
  },
  {
    id: 'tech-circuit',
    name: 'Circuito',
    url: 'https://cdn.pixabay.com/video/2020/09/28/50824-465142396_large.mp4',
    thumbnail: '/video-thumbs/circuit.jpg',
    category: 'tech'
  }
];

const overlayStyles = [
  { id: 'none', name: 'Nenhum', class: '' },
  { id: 'dark', name: 'Escuro', class: 'bg-black/40' },
  { id: 'light', name: 'Claro', class: 'bg-white/20' },
  { id: 'gradient-dark', name: 'Gradiente Escuro', class: 'bg-gradient-to-t from-black/60 to-transparent' },
  { id: 'gradient-light', name: 'Gradiente Claro', class: 'bg-gradient-to-t from-white/40 to-transparent' },
  { id: 'blur', name: 'Desfoque', class: 'backdrop-blur-sm bg-black/20' }
];

export function VideoBackground({ theme, onUpdate }: VideoBackgroundProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateTheme = (updates: Partial<QuizTheme>) => {
    onUpdate({ ...theme, ...updates });
  };

  const handleVideoSelect = (preset: typeof videoPresets[0]) => {
    updateTheme({
      useVideoBackground: true,
      videoBackgroundUrl: preset.url,
      videoAutoplay: true,
      videoMuted: true
    });
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      updateTheme({
        useVideoBackground: true,
        videoBackgroundUrl: videoUrl,
        videoAutoplay: true,
        videoMuted: true
      });
    }
  };

  const handleUrlSubmit = (url: string) => {
    if (url) {
      updateTheme({
        useVideoBackground: true,
        videoBackgroundUrl: url,
        videoAutoplay: true,
        videoMuted: true
      });
    }
  };

  const toggleVideoBackground = (enabled: boolean) => {
    updateTheme({ useVideoBackground: enabled });
  };

  const filteredPresets = selectedCategory === 'all' 
    ? videoPresets 
    : videoPresets.filter(preset => preset.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Film className="w-5 h-5" />
            Vídeo de Fundo
          </h3>
          <p className="text-sm text-muted-foreground">
            Adicione movimento dinâmico com vídeos de fundo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="video-enabled"
            checked={theme.useVideoBackground || false}
            onCheckedChange={toggleVideoBackground}
          />
          <Label htmlFor="video-enabled">Ativar Vídeo</Label>
        </div>
      </div>

      {theme.useVideoBackground && (
        <>
          {/* Upload/URL Input */}
          <Card className="p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Adicionar Vídeo Personalizado</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Upload de Arquivo</Label>
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Escolher Arquivo de Vídeo
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>URL do Vídeo</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="https://exemplo.com/video.mp4"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUrlSubmit((e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousSibling as HTMLInputElement;
                        handleUrlSubmit(input.value);
                      }}
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Filtros de Categoria */}
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'abstract', label: 'Abstrato' },
              { id: 'nature', label: 'Natureza' },
              { id: 'tech', label: 'Tecnologia' }
            ].map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Galeria de Presets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPresets.map((preset) => (
              <Card 
                key={preset.id}
                className={`overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                  theme.videoBackgroundUrl === preset.url 
                    ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleVideoSelect(preset)}
              >
                <div className="aspect-video bg-muted relative">
                  {/* Placeholder para thumbnail */}
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Film className="w-8 h-8 text-primary" />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <h4 className="text-white font-medium text-sm">{preset.name}</h4>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {preset.category}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Configurações de Vídeo */}
          <Card className="p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Configurações de Reprodução</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoplay">Reprodução Automática</Label>
                    <Switch
                      id="autoplay"
                      checked={theme.videoAutoplay !== false}
                      onCheckedChange={(checked) => updateTheme({ videoAutoplay: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="muted">Sem Som</Label>
                    <Switch
                      id="muted"
                      checked={theme.videoMuted !== false}
                      onCheckedChange={(checked) => updateTheme({ videoMuted: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="loop">Repetir Vídeo</Label>
                    <Switch
                      id="loop"
                      checked={theme.videoLoop !== false}
                      onCheckedChange={(checked) => updateTheme({ videoLoop: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Opacidade do Overlay: {theme.videoOverlayOpacity || 50}%</Label>
                    <Slider
                      value={[parseInt(theme.videoOverlayOpacity || '50')]}
                      onValueChange={([value]) => updateTheme({ videoOverlayOpacity: value.toString() })}
                      min={0}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Estilo do Overlay</Label>
                    <Select
                      value={theme.videoOverlayStyle || 'dark'}
                      onValueChange={(value) => updateTheme({ videoOverlayStyle: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {overlayStyles.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Preview */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Preview</h4>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className={`border rounded-lg overflow-hidden ${
                previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-4xl mx-auto'
              }`}>
                <div className="aspect-video relative">
                  {theme.videoBackgroundUrl ? (
                    <video
                      ref={videoRef}
                      src={theme.videoBackgroundUrl}
                      autoPlay={theme.videoAutoplay}
                      muted={theme.videoMuted}
                      loop={theme.videoLoop}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Film className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Overlay Preview */}
                  <div 
                    className={`absolute inset-0 ${
                      overlayStyles.find(s => s.id === theme.videoOverlayStyle)?.class || 'bg-black/40'
                    }`}
                    style={{ 
                      opacity: (parseInt(theme.videoOverlayOpacity || '50')) / 100 
                    }}
                  />
                  
                  {/* Content Preview */}
                  <div className="absolute inset-0 flex items-center justify-center text-center text-white">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Título do Quiz</h2>
                      <Button variant="secondary">
                        Começar Quiz
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
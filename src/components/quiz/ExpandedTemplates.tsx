import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanBadge } from '@/components/PlanBadge';
import { 
  expandedTemplates, 
  templateCategories, 
  getTemplatesByCategory, 
  getPopularTemplates,
  getPremiumTemplates,
  searchTemplates,
  type ExpandedQuizTemplate 
} from '@/lib/expandedTemplates';
import { Eye, Zap, Search, Star, Crown, Filter, Clock, Users2, TrendingUp } from 'lucide-react';

interface ExpandedTemplatesProps {
  onSelectTemplate: (template: any) => void;
}

const ExpandedTemplates = ({ onSelectTemplate }: ExpandedTemplatesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<ExpandedQuizTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('browse');

  const filteredTemplates = useMemo(() => {
    let templates = expandedTemplates;
    
    // Apply search filter
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery);
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory);
    }
    
    // Sort by popular first, then by name
    return templates.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [selectedCategory, searchQuery]);

  const popularTemplates = getPopularTemplates();
  const premiumTemplates = getPremiumTemplates();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Avançado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const TemplateCard = ({ template }: { template: ExpandedQuizTemplate }) => {
    const IconComponent = template.icon;
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 relative overflow-hidden">
        {template.isPopular && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              <Star className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          </div>
        )}
        
        {template.isPremium && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg leading-tight">{template.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">{template.category}</p>
                  {template.subcategory && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground">{template.subcategory}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm line-clamp-2">{template.description}</p>
          
          <div className="flex items-center justify-between">
            <Badge className={getDifficultyColor(template.difficulty)}>
              {template.difficulty}
            </Badge>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {template.estimatedTime}
              </span>
              <span className="flex items-center gap-1">
                <Users2 className="w-3 h-3" />
                {template.questions?.length} perguntas
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <IconComponent className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="text-xl">{template.name}</h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        {template.category} • {template.difficulty} • {template.estimatedTime}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-base">{template.description}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Caso de Uso</h4>
                      <p className="text-sm text-muted-foreground">{template.useCase}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Público-alvo</h4>
                      <p className="text-sm text-muted-foreground">{template.targetAudience}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Perguntas incluídas</h4>
                    <div className="space-y-3">
                      {template.questions?.slice(0, 3).map((question, index) => (
                        <div key={question.id} className="p-4 border rounded-lg bg-muted/20">
                          <p className="font-medium">
                            {index + 1}. {question.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Tipo: {question.type === 'single' ? 'Múltipla escolha' : 
                                   question.type === 'multiple' ? 'Múltiplas opções' :
                                   question.type === 'email' ? 'Email' :
                                   question.type === 'nps' ? 'NPS' :
                                   question.type === 'rating' ? 'Avaliação' :
                                   question.type === 'slider' ? 'Escala' : question.type}
                          </p>
                        </div>
                      ))}
                      {template.questions && template.questions.length > 3 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +{template.questions.length - 3} perguntas adicionais
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              size="sm" 
              className="flex-1 bg-gradient-primary hover:shadow-lg transition-all"
              onClick={() => onSelectTemplate(template)}
            >
              <Zap className="w-4 h-4 mr-2" />
              Usar Template
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Navegar
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Populares
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Premium
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar templates por nome, categoria ou tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {templateCategories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {category.name}
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar sua busca ou selecionar uma categoria diferente.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          <div className="text-center py-4">
            <h3 className="text-2xl font-bold mb-2">🔥 Templates Mais Populares</h3>
            <p className="text-muted-foreground">
              Os templates mais usados pela nossa comunidade
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {popularTemplates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="premium" className="space-y-6">
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h3 className="text-2xl font-bold">Templates Premium</h3>
            </div>
            <p className="text-muted-foreground">
              Templates avançados com recursos profissionais
            </p>
            <div className="mt-4">
              <PlanBadge plan="premium" size="lg" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {premiumTemplates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpandedTemplates;
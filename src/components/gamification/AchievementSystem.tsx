import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Crown, 
  Medal, 
  Gift,
  Lock,
  CheckCircle,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'completion' | 'engagement' | 'social' | 'streak' | 'milestone';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  conditions: AchievementCondition[];
}

interface AchievementCondition {
  type: 'quiz_complete' | 'score_threshold' | 'time_limit' | 'consecutive_days' | 'social_share';
  value: number;
  description: string;
}

interface UserLevel {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  levelName: string;
  perks: string[];
}

interface AchievementSystemProps {
  userId: string;
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

export const AchievementSystem = ({ userId, onAchievementUnlocked }: AchievementSystemProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [category, setCategory] = useState<'all' | Achievement['category']>('all');

  useEffect(() => {
    loadAchievements();
    loadUserLevel();
  }, [userId]);

  const loadAchievements = () => {
    // Mock achievements data
    const mockAchievements: Achievement[] = [
      {
        id: 'first_quiz',
        title: 'Primeiro Passo',
        description: 'Complete seu primeiro quiz',
        icon: '🎯',
        category: 'completion',
        points: 100,
        rarity: 'common',
        progress: 1,
        maxProgress: 1,
        isUnlocked: true,
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        conditions: [
          { type: 'quiz_complete', value: 1, description: 'Completar 1 quiz' }
        ]
      },
      {
        id: 'perfect_score',
        title: 'Perfeição',
        description: 'Obtenha 100% de pontuação em um quiz',
        icon: '⭐',
        category: 'milestone',
        points: 500,
        rarity: 'epic',
        progress: 0,
        maxProgress: 1,
        isUnlocked: false,
        conditions: [
          { type: 'score_threshold', value: 100, description: 'Atingir 100% de pontuação' }
        ]
      },
      {
        id: 'speed_demon',
        title: 'Demônio da Velocidade',
        description: 'Complete um quiz em menos de 2 minutos',
        icon: '⚡',
        category: 'engagement',
        points: 250,
        rarity: 'rare',
        progress: 0,
        maxProgress: 1,
        isUnlocked: false,
        conditions: [
          { type: 'time_limit', value: 120, description: 'Completar em menos de 2 minutos' }
        ]
      },
      {
        id: 'social_butterfly',
        title: 'Borboleta Social',
        description: 'Compartilhe seus resultados 5 vezes',
        icon: '🦋',
        category: 'social',
        points: 300,
        rarity: 'rare',
        progress: 2,
        maxProgress: 5,
        isUnlocked: false,
        conditions: [
          { type: 'social_share', value: 5, description: 'Compartilhar 5 resultados' }
        ]
      },
      {
        id: 'streak_master',
        title: 'Mestre da Sequência',
        description: 'Complete quizzes por 7 dias consecutivos',
        icon: '🔥',
        category: 'streak',
        points: 750,
        rarity: 'epic',
        progress: 3,
        maxProgress: 7,
        isUnlocked: false,
        conditions: [
          { type: 'consecutive_days', value: 7, description: '7 dias consecutivos' }
        ]
      },
      {
        id: 'quiz_master',
        title: 'Mestre dos Quizzes',
        description: 'Complete 50 quizzes',
        icon: '👑',
        category: 'milestone',
        points: 1000,
        rarity: 'legendary',
        progress: 23,
        maxProgress: 50,
        isUnlocked: false,
        conditions: [
          { type: 'quiz_complete', value: 50, description: 'Completar 50 quizzes' }
        ]
      },
      {
        id: 'early_bird',
        title: 'Madrugador',
        description: 'Complete um quiz antes das 7h da manhã',
        icon: '🌅',
        category: 'engagement',
        points: 200,
        rarity: 'common',
        progress: 1,
        maxProgress: 1,
        isUnlocked: true,
        unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        conditions: [
          { type: 'time_limit', value: 7, description: 'Completar antes das 7h' }
        ]
      },
      {
        id: 'perfectionist',
        title: 'Perfeccionista',
        description: 'Obtenha pontuação perfeita em 10 quizzes',
        icon: '💎',
        category: 'milestone',
        points: 2000,
        rarity: 'legendary',
        progress: 3,
        maxProgress: 10,
        isUnlocked: false,
        conditions: [
          { type: 'score_threshold', value: 100, description: 'Pontuação perfeita em 10 quizzes' }
        ]
      }
    ];

    setAchievements(mockAchievements);
  };

  const loadUserLevel = () => {
    // Calculate user level based on achievements
    const totalXP = achievements.reduce((sum, achievement) => 
      achievement.isUnlocked ? sum + achievement.points : sum, 0
    );

    const level = Math.floor(totalXP / 1000) + 1;
    const currentLevelXP = totalXP % 1000;
    const xpToNext = 1000 - currentLevelXP;

    const levelNames = [
      'Iniciante', 'Aprendiz', 'Explorador', 'Especialista', 'Mestre',
      'Veterano', 'Elite', 'Lenda', 'Mito', 'Transcendente'
    ];

    const levelPerks = [
      ['Acesso básico'],
      ['Temas personalizados', 'Estatísticas básicas'],
      ['Analytics avançado', 'Compartilhamento social'],
      ['Conquistas especiais', 'Badges customizados'],
      ['Acesso prioritário', 'Recursos premium'],
      ['Beta features', 'Suporte prioritário'],
      ['Recursos exclusivos', 'Consultoria 1:1'],
      ['Programa VIP', 'Eventos exclusivos'],
      ['Mentor da comunidade', 'Recursos ilimitados'],
      ['Status divino', 'Poderes cósmicos']
    ];

    setUserLevel({
      currentLevel: level,
      currentXP: totalXP,
      xpToNextLevel: xpToNext,
      totalXP,
      levelName: levelNames[Math.min(level - 1, levelNames.length - 1)],
      perks: levelPerks[Math.min(level - 1, levelPerks.length - 1)]
    });
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getRarityIcon = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return <Star className="w-4 h-4" />;
      case 'rare': return <Medal className="w-4 h-4" />;
      case 'epic': return <Crown className="w-4 h-4" />;
      case 'legendary': return <Trophy className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'completion': return <CheckCircle className="w-4 h-4" />;
      case 'engagement': return <Zap className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'streak': return <TrendingUp className="w-4 h-4" />;
      case 'milestone': return <Target className="w-4 h-4" />;
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked' && !achievement.isUnlocked) return false;
    if (filter === 'locked' && achievement.isUnlocked) return false;
    if (category !== 'all' && achievement.category !== category) return false;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalPoints = achievements.reduce((sum, a) => a.isUnlocked ? sum + a.points : sum, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Sistema de Conquistas</h3>
          <p className="text-muted-foreground">
            Desbloqueie conquistas e suba de nível completando desafios
          </p>
        </div>
      </div>

      {/* User Level Card */}
      {userLevel && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold">Nível {userLevel.currentLevel}</h4>
                  <p className="text-purple-100">{userLevel.levelName}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-100">XP Total</div>
                <div className="text-2xl font-bold">{userLevel.totalXP.toLocaleString()}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progresso para o próximo nível</span>
                <span>{userLevel.currentXP}/1000 XP</span>
              </div>
              <Progress 
                value={(userLevel.currentXP / 1000) * 100} 
                className="h-2 bg-white bg-opacity-20"
              />
              <div className="flex flex-wrap gap-2">
                {userLevel.perks.map((perk, index) => (
                  <Badge key={index} variant="secondary" className="bg-white bg-opacity-20 text-white">
                    {perk}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conquistas Desbloqueadas
              </CardTitle>
              <Trophy className="w-4 h-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unlockedCount}/{achievements.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round((unlockedCount / achievements.length) * 100)}% completo
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pontos Totais
              </CardTitle>
              <Star className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">
              +{achievements.reduce((sum, a) => !a.isUnlocked ? sum + a.points : sum, 0)} disponíveis
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Próxima Conquista
              </CardTitle>
              <Target className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const nextAchievement = achievements
                .filter(a => !a.isUnlocked && a.progress > 0)
                .sort((a, b) => (b.progress / b.maxProgress) - (a.progress / a.maxProgress))[0];
              
              return nextAchievement ? (
                <>
                  <div className="text-lg font-bold">{nextAchievement.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {nextAchievement.progress}/{nextAchievement.maxProgress}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold">-</div>
                  <div className="text-sm text-muted-foreground">Nenhuma em progresso</div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas
            </Button>
            <Button 
              variant={filter === 'unlocked' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('unlocked')}
            >
              Desbloqueadas
            </Button>
            <Button 
              variant={filter === 'locked' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('locked')}
            >
              Bloqueadas
            </Button>
            
            <div className="h-4 w-px bg-border mx-2" />
            
            <Button 
              variant={category === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCategory('all')}
            >
              Todas Categorias
            </Button>
            <Button 
              variant={category === 'completion' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCategory('completion')}
            >
              Conclusão
            </Button>
            <Button 
              variant={category === 'engagement' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCategory('engagement')}
            >
              Engajamento  
            </Button>
            <Button 
              variant={category === 'social' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCategory('social')}
            >
              Social
            </Button>
          </div>

          {/* Achievements Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <Card 
                key={achievement.id}
                className={`relative transition-all duration-200 hover:scale-105 ${
                  achievement.isUnlocked 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 opacity-75'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    {achievement.isUnlocked ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Progress */}
                    {!achievement.isUnlocked && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                          {getRarityIcon(achievement.rarity)}
                          {achievement.rarity}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoryIcon(achievement.category)}
                          {achievement.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-purple-600">
                        <Star className="w-4 h-4" />
                        {achievement.points} XP
                      </div>
                    </div>

                    {/* Unlock Date */}
                    {achievement.unlockedAt && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Desbloqueada em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conquistas em Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements
                  .filter(a => !a.isUnlocked && a.progress > 0)
                  .map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Recompensa</div>
                        <div className="font-medium text-purple-600">{achievement.points} XP</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Recompensas por Nível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { level: 5, reward: 'Tema Premium Desbloqueado', unlocked: userLevel?.currentLevel >= 5 },
                    { level: 10, reward: 'Analytics Avançado', unlocked: userLevel?.currentLevel >= 10 },
                    { level: 15, reward: 'Certificado Personalizado', unlocked: userLevel?.currentLevel >= 15 },
                    { level: 20, reward: 'Acesso Beta Features', unlocked: userLevel?.currentLevel >= 20 },
                    { level: 25, reward: 'Suporte Prioritário', unlocked: userLevel?.currentLevel >= 25 }
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        item.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.unlocked ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={item.unlocked ? 'text-green-800' : 'text-gray-600'}>
                          {item.reward}
                        </span>
                      </div>
                      <Badge variant={item.unlocked ? 'default' : 'secondary'}>
                        Nível {item.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Conquistas Raras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements
                    .filter(a => a.rarity === 'epic' || a.rarity === 'legendary')
                    .map((achievement) => (
                      <div 
                        key={achievement.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          achievement.isUnlocked 
                            ? 'bg-purple-50 border-purple-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="text-xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                          <div className="text-sm font-medium text-purple-600 mt-1">
                            {achievement.points} XP
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
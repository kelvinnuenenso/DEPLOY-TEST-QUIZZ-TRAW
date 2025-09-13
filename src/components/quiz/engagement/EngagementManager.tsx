import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { SmartProgressEditor } from './SmartProgressEditor';
import { EmotionalAnalytics } from './EmotionalAnalytics';
import { MicroRewards } from './MicroRewards';
import { SocialSharing } from './SocialSharing';
import { ConditionalProgress } from './ConditionalProgress';
import { QuizTheme } from '@/types/quiz';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Target, 
  Brain, 
  Gift, 
  Share, 
  Zap
} from 'lucide-react';

interface EngagementManagerProps {
  theme: QuizTheme;
  onUpdate: (theme: QuizTheme) => void;
  quizId: string;
}

export function EngagementManager({ theme, onUpdate, quizId }: EngagementManagerProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('smart-progress');

  return (
    <div className="h-full flex flex-col">
      <div className={`flex items-center justify-between p-4 border-b ${isMobile ? 'p-2' : 'p-4'}`}>
        <div className="flex items-center gap-2">
          <Target className={`text-primary ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          <h2 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
            {isMobile ? 'Engajamento' : 'Sistema de Engajamento'}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className={`grid w-full grid-cols-5 ${isMobile ? 'mx-2 mt-2' : 'mx-4 mt-4'}`}>
            <TabsTrigger value="smart-progress" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
              <Zap className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && 'Progresso'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
              <Brain className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && 'Análise'}
            </TabsTrigger>
            <TabsTrigger value="rewards" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
              <Gift className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && 'Recompensas'}
            </TabsTrigger>
            <TabsTrigger value="social" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
              <Share className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && 'Social'}
            </TabsTrigger>
            <TabsTrigger value="conditional" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
              <Target className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && 'Urgência'}
            </TabsTrigger>
          </TabsList>

          <div className={`flex-1 overflow-auto ${isMobile ? 'p-2' : 'p-4'}`}>
            <TabsContent value="smart-progress" className="mt-0">
              <SmartProgressEditor 
                theme={theme} 
                onUpdate={onUpdate}
                quizId={quizId}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <EmotionalAnalytics 
                theme={theme} 
                onUpdate={onUpdate}
                quizId={quizId}
              />
            </TabsContent>

            <TabsContent value="rewards" className="mt-0">
              <MicroRewards 
                theme={theme} 
                onUpdate={onUpdate}
                quizId={quizId}
              />
            </TabsContent>

            <TabsContent value="social" className="mt-0">
              <SocialSharing 
                theme={theme} 
                onUpdate={onUpdate}
                quizId={quizId}
              />
            </TabsContent>

            <TabsContent value="conditional" className="mt-0">
              <ConditionalProgress 
                theme={theme} 
                onUpdate={onUpdate}
                quizId={quizId}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
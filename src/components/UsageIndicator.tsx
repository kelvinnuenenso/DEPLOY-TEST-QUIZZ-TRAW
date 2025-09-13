import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlanManager } from '@/lib/planManager';
import { AlertTriangle, TrendingUp, Database, BarChart3, Crown } from 'lucide-react';
import { PlanUpgradeModal } from './PlanUpgradeModal';
import { useState } from 'react';

interface UsageIndicatorProps {
  type?: 'compact' | 'detailed' | 'dashboard';
  showUpgrade?: boolean;
}

export function UsageIndicator({ type = 'compact', showUpgrade = true }: UsageIndicatorProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const usage = PlanManager.getUsageStats();
  const warnings = PlanManager.getUsageWarnings();
  const recommendation = PlanManager.getPlanRecommendation();

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (type === 'compact') {
    const highestUsage = Math.max(
      usage.quizzes.percentage,
      usage.storage.percentage,
      usage.responses.percentage
    );

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${
            highestUsage >= 90 ? 'bg-red-500' : 
            highestUsage >= 75 ? 'bg-yellow-500' : 
            'bg-green-500'
          }`} />
          <span className="text-xs text-muted-foreground">
            {Math.round(highestUsage)}% usado
          </span>
        </div>
        
        {warnings.length > 0 && (
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
        )}
      </div>
    );
  }

  if (type === 'dashboard') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quizzes Usage */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Quizzes</span>
            </div>
            <Badge variant="outline">
              {usage.quizzes.current}/{usage.quizzes.limit === -1 ? '∞' : usage.quizzes.limit}
            </Badge>
          </div>
          {usage.quizzes.limit !== -1 && (
            <>
              <Progress 
                value={usage.quizzes.percentage} 
                className="h-2 mb-2"
              />
              <p className="text-xs text-muted-foreground">
                {Math.round(usage.quizzes.percentage)}% do limite utilizado
              </p>
            </>
          )}
        </Card>

        {/* Storage Usage */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-green-500" />
              <span className="font-medium">Armazenamento</span>
            </div>
            <Badge variant="outline">
              {formatBytes(usage.storage.current)}
            </Badge>
          </div>
          {usage.storage.limit !== -1 && (
            <>
              <Progress 
                value={usage.storage.percentage} 
                className="h-2 mb-2"
              />
              <p className="text-xs text-muted-foreground">
                {Math.round(usage.storage.percentage)}% de {formatBytes(usage.storage.limit)}
              </p>
            </>
          )}
        </Card>

        {/* Responses Usage */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="font-medium">Respostas</span>
            </div>
            <Badge variant="outline">
              {formatNumber(usage.responses.current)}/mês
            </Badge>
          </div>
          {usage.responses.limit !== -1 && (
            <>
              <Progress 
                value={usage.responses.percentage} 
                className="h-2 mb-2"
              />
              <p className="text-xs text-muted-foreground">
                {Math.round(usage.responses.percentage)}% de {formatNumber(usage.responses.limit)}
              </p>
            </>
          )}
        </Card>
      </div>
    );
  }

  // Detailed view
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Uso do Plano</h3>
          {recommendation.shouldUpgrade && showUpgrade && (
            <Button 
              onClick={() => setShowUpgradeModal(true)}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          )}
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <div 
                key={index}
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  warning.type === 'error' 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 ${
                  warning.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                }`} />
                <span className={`text-sm ${
                  warning.type === 'error' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {warning.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Usage Details */}
        <div className="space-y-4">
          {/* Quizzes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Quizzes</span>
              <span className="text-sm text-muted-foreground">
                {usage.quizzes.current}/{usage.quizzes.limit === -1 ? '∞' : usage.quizzes.limit}
              </span>
            </div>
            {usage.quizzes.limit !== -1 && (
              <Progress 
                value={usage.quizzes.percentage} 
                className="h-2"
              />
            )}
          </div>

          {/* Storage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Armazenamento</span>
              <span className="text-sm text-muted-foreground">
                {formatBytes(usage.storage.current)}
                {usage.storage.limit !== -1 && ` / ${formatBytes(usage.storage.limit)}`}
              </span>
            </div>
            {usage.storage.limit !== -1 && (
              <Progress 
                value={usage.storage.percentage} 
                className="h-2"
              />
            )}
          </div>

          {/* Responses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Respostas (este mês)</span>
              <span className="text-sm text-muted-foreground">
                {formatNumber(usage.responses.current)}
                {usage.responses.limit !== -1 && ` / ${formatNumber(usage.responses.limit)}`}
              </span>
            </div>
            {usage.responses.limit !== -1 && (
              <Progress 
                value={usage.responses.percentage} 
                className="h-2"
              />
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendation.shouldUpgrade && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Recomendação de Upgrade</h4>
            <ul className="text-sm text-blue-700 space-y-1 mb-3">
              {recommendation.reasons.map((reason, index) => (
                <li key={index}>• {reason}</li>
              ))}
            </ul>
            {showUpgrade && (
              <Button 
                onClick={() => setShowUpgradeModal(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Ver Planos
              </Button>
            )}
          </div>
        )}
      </div>

      <PlanUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        suggestedPlan={recommendation.recommendedPlan === 'free' ? 'pro' : recommendation.recommendedPlan}
      />
    </Card>
  );
}
import { Badge } from '@/components/ui/badge';
import { Crown, Star, User } from 'lucide-react';
import { DemoUserManager, type DemoUserPlan } from '@/lib/demoUser';

interface PlanBadgeProps {
  plan?: DemoUserPlan;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PlanBadge({ plan, showIcon = true, size = 'md' }: PlanBadgeProps) {
  const currentPlan = plan || DemoUserManager.getCurrentUser()?.plan || 'free';
  
  const getConfig = (plan: DemoUserPlan) => {
    switch (plan) {
      case 'premium':
        return {
          label: 'PREMIUM',
          className: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0',
          icon: Crown
        };
      case 'pro':
        return {
          label: 'PRO',
          className: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0',
          icon: Star
        };
      default:
        return {
          label: 'FREE',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: User
        };
    }
  };

  const config = getConfig(currentPlan);
  const IconComponent = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5', 
    lg: 'w-4 h-4'
  };

  return (
    <Badge className={`${config.className} ${sizeClasses[size]} font-medium flex items-center gap-1`}>
      {showIcon && <IconComponent className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}
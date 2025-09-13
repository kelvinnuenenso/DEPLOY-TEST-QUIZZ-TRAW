import { PlanSubscription } from '@/components/PlanSubscription';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export default function PlansPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PlanSubscription />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
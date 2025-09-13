import { WebhooksIntegrations } from '@/components/WebhooksIntegrations';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export default function WebhooksPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <WebhooksIntegrations />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// This file now acts as a facade to the refactored notification services
import { 
  notifyStatusChange,
  notifyNewDeclaration,
  updateStatusAndNotify,
  getDeclarationNotificationHistory,
  notifyProviderAssignment,
  notifyTenantMeetingScheduled,
  notifyProviderQuoteApproved,
  notifyTenantQuoteApproved
} from '@/services/notifications';

export {
  notifyStatusChange,
  notifyNewDeclaration,
  updateStatusAndNotify,
  getDeclarationNotificationHistory,
  notifyProviderAssignment,
  notifyTenantMeetingScheduled,
  notifyProviderQuoteApproved,
  notifyTenantQuoteApproved
};

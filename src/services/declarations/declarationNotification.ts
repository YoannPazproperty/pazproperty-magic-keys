
// This file now acts as a facade to the refactored notification services
import { 
  notifyStatusChange,
  notifyNewDeclaration,
  updateStatusAndNotify,
  getDeclarationNotificationHistory
} from '../notifications';

export {
  notifyStatusChange,
  notifyNewDeclaration,
  updateStatusAndNotify,
  getDeclarationNotificationHistory
};

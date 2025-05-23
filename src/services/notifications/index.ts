
// Re-export all functionality from our modules
export * from './declarationNotifier';
export * from './notificationHistory';
export * from './notificationStorage';

// Fix re-exporting issue by excluding the duplicate export
export { 
  updateStatusAndNotify,
  notifyStatusChange,
  notifyNewDeclaration 
} from './declarationNotifier';

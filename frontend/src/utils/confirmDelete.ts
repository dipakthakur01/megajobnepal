import { useConfirm } from '@/context/ConfirmContext';

// For direct usage in components
export function useConfirmDelete() {
  const { confirm } = useConfirm();
  
  return async (message: string = 'Are you sure you want to delete?'): Promise<boolean> => {
    return await confirm({
      title: 'Confirm Deletion',
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });
  };
}

// For compatibility with existing code that expects a synchronous response
// Note: This should be gradually replaced with the async version above
export function confirmDelete(message: string = 'Are you sure you want to delete?'): boolean {
  console.warn('Synchronous confirmDelete is deprecated. Use useConfirmDelete hook instead.');
  return window.confirm(message);
}
import { useEffect } from 'react';
import { useStore } from '../store/AppStore';
import { useFeedback } from './FeedbackProvider';

/** يعرض أخطاء الحفظ اللي صارت بالخلفية (حذف، تحديث ممشى، رفع مستند) */
export default function SyncErrorBridge() {
  const { syncError, clearSyncError, retryLoad } = useStore();
  const { showError } = useFeedback();

  useEffect(() => {
    if (!syncError) return;
    // نرجّع البيانات من الخادم عشان الشاشة تطابق الحقيقة
    showError(syncError, retryLoad);
    clearSyncError();
  }, [syncError, showError, clearSyncError, retryLoad]);

  return null;
}

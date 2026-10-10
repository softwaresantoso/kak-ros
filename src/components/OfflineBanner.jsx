import { useEffect, useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

/**
 * Shows a fixed banner when the connection drops, and a brief
 * "back online" confirmation when it returns — so the app never just
 * silently stops working with no explanation (product-34).
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const t = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isOnline, wasOffline]);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] bg-status-cancelled text-white text-sm font-semibold text-center py-2"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        Koneksi terputus — sebagian data mungkin belum tersimpan
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] bg-status-ready text-white text-sm font-semibold text-center py-2"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        Koneksi kembali normal
      </div>
    );
  }

  return null;
}

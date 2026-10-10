import { useState } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const DISMISS_KEY = 'kakros-install-dismissed';

export function InstallBanner() {
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');

  if (!canInstall || installed || dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, '1');
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md
      bg-brand-dark text-white rounded-card shadow-lg px-4 py-3 flex items-center justify-between gap-3">
      <p className="text-sm font-medium">Install aplikasi ini untuk akses lebih cepat</p>
      <div className="flex gap-2 shrink-0">
        <button onClick={handleDismiss} className="text-xs text-white/60 font-semibold px-2">Nanti</button>
        <button onClick={promptInstall} className="text-xs bg-white text-brand-dark font-bold px-3 py-1.5 rounded-lg">
          Install
        </button>
      </div>
    </div>
  );
}

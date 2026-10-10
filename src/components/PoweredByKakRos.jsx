export function PoweredByKakRos({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-1.5 py-4 ${className}`}>
      <span className="text-xs text-brand-dark/50">Powered by</span>
      <img src="/branding/kak-ros-wordmark.png" alt="Kak ROS" className="h-5 w-auto" />
    </div>
  );
}

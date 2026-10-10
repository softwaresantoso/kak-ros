import { Button } from './Button';

export function QtyStepper({ value, onChange, min = 0 }) {
  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-9 rounded-full border border-brand-red text-brand-red font-bold text-lg leading-none"
      >
        −
      </button>
      <span className="w-6 text-center font-semibold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 rounded-full bg-brand-red text-white font-bold text-lg leading-none"
      >
        +
      </button>
    </div>
  );
}

import { formatRupiah } from '../../lib/format';

/**
 * Renders one modifier group (e.g. "Level pedas", "Tambahan").
 * `selected` is the array of currently-picked option ids for this group.
 * Calls onChange(groupId, newSelectedOptionIds).
 */
export function ModifierGroup({ group, selected, onChange }) {
  const isSingle = group.type === 'single';

  function toggle(optionId) {
    if (isSingle) {
      onChange(group.id, [optionId]);
    } else {
      const next = selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId];
      onChange(group.id, next);
    }
  }

  return (
    <div className="py-3 border-b border-black/5 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-sm">{group.name}</p>
        {group.required && <span className="text-xs text-brand-red">Wajib pilih</span>}
      </div>
      <div className="flex flex-col gap-2">
        {group.options.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm text-left transition
                ${active ? 'border-brand-red bg-brand-red/5' : 'border-black/10'}`}
            >
              <span>{opt.name}</span>
              <span className="text-brand-dark/60">
                {opt.priceDelta ? `+${formatRupiah(opt.priceDelta)}` : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

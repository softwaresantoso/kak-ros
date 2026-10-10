function newOption() {
  return { id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: '', priceDelta: 0 };
}

export function ModifierGroupEditor({ groups, onChange }) {
  function addGroup() {
    onChange([...groups, {
      id: `grp-${Date.now()}`, name: '', type: 'single', required: false, options: [newOption()]
    }]);
  }
  function updateGroup(i, patch) {
    const next = [...groups];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function removeGroup(i) {
    onChange(groups.filter((_, idx) => idx !== i));
  }
  function addOption(i) {
    updateGroup(i, { options: [...groups[i].options, newOption()] });
  }
  function updateOption(i, j, patch) {
    const options = [...groups[i].options];
    options[j] = { ...options[j], ...patch };
    updateGroup(i, { options });
  }
  function removeOption(i, j) {
    updateGroup(i, { options: groups[i].options.filter((_, idx) => idx !== j) });
  }

  return (
    <div className="space-y-3">
      {groups.map((g, i) => (
        <div key={g.id} className="border border-black/10 rounded-lg p-3">
          <div className="flex gap-2 mb-2">
            <input
              value={g.name}
              onChange={(e) => updateGroup(i, { name: e.target.value })}
              placeholder="Nama grup (mis. Level Pedas)"
              className="flex-1 rounded-lg border border-black/10 p-2 text-sm"
            />
            <select
              value={g.type}
              onChange={(e) => updateGroup(i, { type: e.target.value })}
              className="rounded-lg border border-black/10 p-2 text-sm"
            >
              <option value="single">Pilih 1</option>
              <option value="multiple">Pilih banyak</option>
            </select>
            <button onClick={() => removeGroup(i)} className="text-xs text-brand-red font-semibold px-2">Hapus</button>
          </div>
          <label className="flex items-center gap-2 text-xs text-brand-dark/60 mb-2">
            <input type="checkbox" checked={g.required} onChange={(e) => updateGroup(i, { required: e.target.checked })} />
            Wajib dipilih
          </label>

          <div className="space-y-1.5">
            {g.options.map((opt, j) => (
              <div key={opt.id} className="flex gap-2">
                <input
                  value={opt.name}
                  onChange={(e) => updateOption(i, j, { name: e.target.value })}
                  placeholder="Nama opsi"
                  className="flex-1 rounded-lg border border-black/10 p-2 text-xs"
                />
                <input
                  type="number"
                  value={opt.priceDelta}
                  onChange={(e) => updateOption(i, j, { priceDelta: Number(e.target.value) })}
                  placeholder="+Rp"
                  className="w-24 rounded-lg border border-black/10 p-2 text-xs"
                />
                <button onClick={() => removeOption(i, j)} className="text-xs text-brand-red">✕</button>
              </div>
            ))}
            <button onClick={() => addOption(i)} className="text-xs font-semibold text-brand-red">+ Tambah opsi</button>
          </div>
        </div>
      ))}
      <button onClick={addGroup} className="text-sm font-semibold text-brand-red">+ Tambah Grup Modifier</button>
    </div>
  );
}

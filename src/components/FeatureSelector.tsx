type FeatureSelectorProps = {
  title: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

function FeatureSelector({ title, options, selected, onChange }: FeatureSelectorProps) {
  const toggle = (option: string) => {
    onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option])
  }

  return (
    <section className="rounded-[8px] border border-orange-200/10 bg-white/[0.055] p-4">
      <h2 className="text-base font-bold text-orange-50">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`min-h-11 rounded-full border px-3 text-sm transition ${
                active
                  ? 'border-orange-400 bg-orange-500 text-slate-950'
                  : 'border-orange-200/15 bg-black/20 text-orange-50/75'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default FeatureSelector

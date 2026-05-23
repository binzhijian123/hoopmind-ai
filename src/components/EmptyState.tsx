type EmptyStateProps = {
  title: string
  description: string
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[8px] border border-dashed border-orange-200/20 bg-white/[0.035] p-6 text-center">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full border border-orange-300/25 bg-orange-500/10" />
      <h2 className="text-base font-bold text-orange-50">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-orange-100/62">{description}</p>
    </div>
  )
}

export default EmptyState

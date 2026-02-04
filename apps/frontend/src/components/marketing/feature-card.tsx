interface FeatureCardProps {
    icon: string
    title: string
    description: string
}

export default function FeatureCard({
    icon,
    title,
    description,
}: FeatureCardProps) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition-colors hover:bg-zinc-900/60">
            <div className="bg-primary-400/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <i className={`${icon} text-primary-400 text-xl`}></i>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm leading-relaxed text-zinc-400">
                {description}
            </p>
        </div>
    )
}

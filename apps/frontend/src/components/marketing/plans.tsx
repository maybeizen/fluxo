import Button from '@/components/ui/button'

interface Plan {
    name: string
    price: string
    features: string[]
}

const plans: Plan[] = [
    {
        name: 'Minecraft XS',
        price: '$3.99/mo',
        features: [
            '4GB RAM',
            '30GB NVMe Storage',
            'Unlimited Player Slots',
            'Online 24/7',
            'Instant Setup',
        ],
    },
    {
        name: 'Minecraft M',
        price: '$11.99/mo',
        features: [
            '8GB RAM',
            '50GB NVMe Storage',
            'Unlimited Player Slots',
            'Online 24/7',
            'Instant Setup',
        ],
    },
    {
        name: 'Minecraft L',
        price: '$15.99/mo',
        features: [
            '16GB RAM',
            '60GB NVMe Storage',
            'Unlimited Player Slots',
            'Online 24/7',
            'Instant Setup',
        ],
    },
    {
        name: 'Minecraft XL',
        price: '$22.99/mo',
        features: [
            '24GB RAM',
            '70GB NVMe Storage',
            'Unlimited Player Slots',
            'Online 24/7',
            'Instant Setup',
        ],
    },
]

export default function Plans() {
    const getFeatureIcon = (feature: string) => {
        const f = feature.toLowerCase()
        if (f.includes('ram')) return 'fas fa-memory'
        if (f.includes('storage')) return 'fas fa-hard-drive'
        if (f.includes('player')) return 'fas fa-users'
        if (f.includes('24/7') || f.includes('online')) return 'fas fa-clock'
        if (f.includes('instant')) return 'fas fa-bolt'
        return 'fas fa-check'
    }

    return (
        <section className="container mx-auto px-6 py-16 lg:px-12">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold text-white">
                    Choose Your Plan
                </h2>
                <p className="mt-2 text-zinc-400">
                    Flexible pricing for every type of Minecraft server
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {plans.map((plan) => {
                    const isPopular = plan.name === 'Minecraft M'
                    return (
                        <div
                            key={plan.name}
                            className={`hover:border-primary-400/40 relative rounded-xl border bg-zinc-950 p-6 transition-all hover:shadow-[0_0_40px_rgba(220,38,38,0.08)] ${
                                isPopular
                                    ? 'border-primary-400/30'
                                    : 'border-zinc-800'
                            }`}
                        >
                            {isPopular && (
                                <div className="absolute -top-3 right-4">
                                    <span className="shadow-primary-400/30 bg-primary-500 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white shadow">
                                        <i className="fas fa-fire"></i>
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            <h3 className="text-xl font-semibold text-white">
                                {plan.name}
                            </h3>
                            <p className="mt-3 text-3xl font-bold text-white">
                                {plan.price}
                                <span className="text-sm font-normal text-zinc-400">
                                    {' '}
                                    + VAT
                                </span>
                            </p>
                            <ul className="mt-5 space-y-2">
                                {plan.features.map((f) => {
                                    const icon = getFeatureIcon(f)
                                    return (
                                        <li
                                            key={f}
                                            className="flex items-center gap-2 text-sm text-zinc-300"
                                        >
                                            <i
                                                className={`${icon} text-primary-400`}
                                            ></i>
                                            {f}
                                        </li>
                                    )
                                })}
                            </ul>
                            <div className="mt-6">
                                <Button
                                    variant="primary"
                                    fullWidth
                                    rounded="lg"
                                    icon="fas fa-cart-plus"
                                >
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

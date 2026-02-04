import Button from '@/components/ui/button'
import Link from 'next/link'

export default function CTA() {
    return (
        <section className="container mx-auto px-6 py-16 lg:px-12">
            <div className="border-primary-400/30 to-primary-400/10 from-primary-500/20 rounded-2xl border bg-gradient-to-r p-8 text-center md:p-10">
                <h3 className="text-2xl font-bold text-white md:text-3xl">
                    Launch your Minecraft server today
                </h3>
                <p className="mt-2 text-zinc-300">
                    Instant setup, powerful hardware, and 24/7 support. Your
                    world, your rules.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4">
                    <Link href="/auth/register">
                        <Button
                            variant="primary"
                            size="lg"
                            rounded="lg"
                            icon="fas fa-rocket"
                        >
                            Get Started
                        </Button>
                    </Link>
                    <Link href="#plans">
                        <Button
                            variant="glass"
                            size="lg"
                            rounded="lg"
                            icon="fas fa-tag"
                        >
                            View Plans
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

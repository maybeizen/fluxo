import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/ui/footer'
import MarketingNavbar from '@/components/marketing/navbar'
import FeatureCard from '@/components/marketing/feature-card'
import Plans from '@/components/marketing/plans'
import FAQ from '@/components/marketing/faq'
import Testimonials from '@/components/marketing/testimonials'
import CTA from '@/components/marketing/cta'

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            <MarketingNavbar />

            <div className="relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/bg.png"
                        alt="Background"
                        fill
                        className="object-cover"
                        priority
                        quality={100}
                    />
                    <div className="absolute inset-0 bg-black/75" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
                    <div className="bg-gradient-radial absolute inset-0 from-transparent via-black/20 to-black/60" />
                </div>
                <div className="relative z-10">
                    <div className="container mx-auto px-6 py-24 md:py-16 lg:px-12 lg:py-24">
                        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                            <div className="space-y-6">
                                <div className="shadow-primary-400/10 hover:shadow-primary-400/20 border-primary-500/30 from-primary-500/30 to-primary-500/20 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-4 py-2 shadow-lg backdrop-blur-sm transition-all duration-300">
                                    <i className="fa-solid fa-ticket text-primary-400"></i>
                                    <span className="text-sm">
                                        Use code{' '}
                                        <span className="font-bold text-white">
                                            WELCOME
                                        </span>{' '}
                                        for{' '}
                                        <span className="font-bold text-white">
                                            15% off!
                                        </span>
                                    </span>
                                </div>
                                <h1 className="text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                                    Host the Game Server of your Dreams with{' '}
                                    <span className="text-primary-500 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                                        Fluxo
                                    </span>
                                </h1>
                                <p className="max-w-xl text-lg leading-relaxed text-gray-300 md:text-xl">
                                    High-performance servers, instant setup, and
                                    24/7 support. Create, play, and conquer with
                                    Fluxo.
                                </p>
                                <div className="space-y-3">
                                    <div className="group flex cursor-default items-center gap-3">
                                        <div className="bg-primary-400/10 group-hover:bg-primary-400/20 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                                            <i className="fa-solid fa-bolt text-primary-400 text-lg"></i>
                                        </div>
                                        <span className="text-base lg:text-lg">
                                            Instant Server Setup
                                        </span>
                                    </div>
                                    <div className="group flex cursor-default items-center gap-3">
                                        <div className="bg-primary-400/10 group-hover:bg-primary-400/20 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                                            <i className="fa-solid fa-gauge-high text-primary-400 text-lg"></i>
                                        </div>
                                        <span className="text-base lg:text-lg">
                                            High-Performance Servers
                                        </span>
                                    </div>
                                    <div className="group flex cursor-default items-center gap-3">
                                        <div className="bg-primary-400/10 group-hover:bg-primary-400/20 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                                            <i className="fa-solid fa-headset text-primary-400 text-lg"></i>
                                        </div>
                                        <span className="text-base lg:text-lg">
                                            24/7 Customer Support
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                                    <Link
                                        href="/auth/register"
                                        className="bg-primary-400 shadow-primary-400/20 hover:shadow-primary-400/30 hover:bg-primary-500 border-primary-400 inline-flex items-center justify-center rounded-lg border px-5 py-2.5 text-lg font-semibold text-white shadow-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                                    >
                                        <span className="flex items-center">
                                            Create My Server
                                        </span>
                                        <span
                                            className="ml-2 flex items-center"
                                            aria-hidden="true"
                                        >
                                            <i className="fa-solid fa-arrow-right" />
                                        </span>
                                    </Link>
                                    <Link
                                        href="#plans"
                                        className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/10 px-5 py-2.5 text-lg font-semibold text-white shadow-white/10 backdrop-blur-sm transition-all duration-150 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                                    >
                                        <span className="flex items-center">
                                            <span
                                                className="mr-2 flex items-center"
                                                aria-hidden="true"
                                            >
                                                <i className="fa-solid fa-tag" />
                                            </span>
                                            View Pricing
                                        </span>
                                    </Link>
                                </div>
                                <div className="flex items-center gap-4 pt-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <i className="fa-solid fa-shield-check text-green-500"></i>
                                        <span>DDoS Protected</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <i className="fa-solid fa-clock text-blue-500"></i>
                                        <span>Instant Activation</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative hidden items-center justify-center lg:flex">
                                <div className="bg-primary-500/20 absolute inset-0 rounded-full blur-[100px]" />
                                <div className="relative flex items-center justify-center rounded-lg">
                                    <Image
                                        src="/hero-image.png"
                                        alt="Nether Panel Interface"
                                        width={580}
                                        height={420}
                                        className="h-auto max-h-[400px] w-auto max-w-full rounded-2xl border border-white/5 shadow-2xl"
                                        priority
                                        style={{
                                            objectFit: 'contain',
                                            display: 'block',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section id="features" className="relative z-10 bg-black py-16">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-bold text-white">
                            Why Fluxo?
                        </h2>
                        <p className="mt-2 text-zinc-400">
                            Focused on performance, reliability, and support
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <FeatureCard
                            icon="fas fa-heart-pulse"
                            title="Built for Uptime"
                            description="High availability infrastructure keeps your worlds online, always."
                        />
                        <FeatureCard
                            icon="fas fa-rotate"
                            title="Automatic Updates"
                            description="Stay current with seamless software and security updates."
                        />
                        <FeatureCard
                            icon="fas fa-shield-halved"
                            title="Security First"
                            description="DDoS protection and hardened configurations by default."
                        />
                        <FeatureCard
                            icon="fas fa-gauge-high"
                            title="Fast and Reliable"
                            description="Low latency network and powerful hardware for smooth gameplay."
                        />
                        <FeatureCard
                            icon="fas fa-headset"
                            title="Dedicated Support"
                            description="Real humans ready to help 24/7 via tickets and chat."
                        />
                        <FeatureCard
                            icon="fas fa-globe"
                            title="Global Availability"
                            description="Deploy in regions closest to your players for best ping."
                        />
                    </div>
                </div>
            </section>

            {}
            <div id="plans" className="relative z-10 bg-black">
                <Plans />
            </div>

            {}
            <div className="relative z-10 bg-black">
                <FAQ />
            </div>

            {}
            <div className="relative z-10 bg-black">
                <Testimonials />
            </div>

            {}
            <div id="support" className="relative z-10 bg-black">
                <CTA />
            </div>

            <Footer />
        </div>
    )
}

import Link from 'next/link'
import Logo from '@/components/ui/logo'
import Button from '@/components/ui/button'
import { getServerUser } from '@/lib/server-auth'
import { getAppSettings } from '@/lib/public/app-settings'

export default async function MarketingNavbar() {
    const user = await getServerUser()
    const appSettings = await getAppSettings()

    return (
        <header className="fixed top-8 right-0 left-0 z-20 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur md:top-0">
            <div className="container mx-auto flex items-center justify-between px-6 py-3 lg:px-12">
                <Link href="/" className="flex items-center gap-3">
                    <Logo
                        width={36}
                        height={36}
                        className="rounded"
                        logoUrl={appSettings?.logoUrl}
                    />
                    <span className="text-lg font-semibold text-white">
                        {appSettings?.name || 'Fluxo'}
                    </span>
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    <Link
                        href="/#features"
                        className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                    >
                        Features
                    </Link>
                    <Link
                        href="/#plans"
                        className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                    >
                        Plans
                    </Link>
                    <Link
                        href="/#support"
                        className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                    >
                        Support
                    </Link>
                </nav>

                {user ? (
                    <div className="flex items-center gap-3">
                        <Link href="/client">
                            <Button
                                variant="primary"
                                size="sm"
                                rounded="lg"
                                icon="fas fa-gauge"
                            >
                                Dashboard
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link href="/auth/login">
                            <Button
                                variant="glass"
                                size="sm"
                                rounded="lg"
                                icon="fas fa-right-to-bracket"
                            >
                                Login
                            </Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button
                                variant="primary"
                                size="sm"
                                rounded="lg"
                                icon="fas fa-user-plus"
                            >
                                Register
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}

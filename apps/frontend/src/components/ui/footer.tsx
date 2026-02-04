'use client'

import Link from 'next/link'
import Logo from './logo'
import { useEffect, useState } from 'react'

export default function Footer() {
    const currentYear = new Date().getFullYear()
    const [apiStatus, setApiStatus] = useState<
        'checking' | 'healthy' | 'unhealthy'
    >('checking')

    useEffect(() => {
        const checkApiHealth = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/health`,
                    {
                        method: 'GET',
                        cache: 'no-store',
                    }
                )

                if (response.ok) {
                    const data = await response.json()
                    if (data.status === 'ok') {
                        setApiStatus('healthy')
                    } else {
                        setApiStatus('unhealthy')
                    }
                } else {
                    setApiStatus('unhealthy')
                }
            } catch {
                setApiStatus('unhealthy')
            }
        }

        checkApiHealth()
        const interval = setInterval(checkApiHealth, 60000)

        return () => clearInterval(interval)
    }, [])

    return (
        <footer className="mt-auto border-t border-zinc-900 bg-zinc-950">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Logo className="h-8 w-8" />
                            <span className="text-xl font-bold text-white">
                                Fluxo
                            </span>
                        </div>
                        <p className="text-sm text-zinc-400">
                            High-performance game servers with instant setup and
                            24/7 support.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="https://discord.gg/NdRseZYNzk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 transition-colors hover:bg-[#5865F2]"
                            >
                                <i className="fab fa-discord text-white"></i>
                            </a>
                            <a
                                href="https://twitter.com/netherhost"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 transition-colors hover:bg-[#1DA1F2]"
                            >
                                <i className="fab fa-twitter text-white"></i>
                            </a>
                            <a
                                href="https://github.com/netherhost"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 transition-colors hover:bg-zinc-700"
                            >
                                <i className="fab fa-github text-white"></i>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-white">
                            Products
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/products/minecraft"
                                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                                >
                                    Minecraft Hosting
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/products/discord-bots"
                                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                                >
                                    Discord Bot Hosting
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/products/vps"
                                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                                >
                                    VPS Hosting
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/products/dedicated"
                                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                                >
                                    Dedicated Servers
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-white">
                            Company
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/careers"
                                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                                >
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/status"
                                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                                >
                                    Status
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-white">Legal</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/terms"
                                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/refund"
                                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                                >
                                    Refund Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/aup"
                                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                                >
                                    Acceptable Use
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-900 pt-8 md:flex-row">
                    <div className="flex flex-col items-center gap-4 md:flex-row">
                        <p className="text-sm text-zinc-500">
                            © {currentYear} Fluxo. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5">
                            {apiStatus === 'checking' ? (
                                <>
                                    <i className="fas fa-circle-notch fa-spin text-xs text-zinc-500"></i>
                                    <span className="text-xs text-zinc-400">
                                        Checking API...
                                    </span>
                                </>
                            ) : apiStatus === 'healthy' ? (
                                <>
                                    <i className="fas fa-check-circle text-xs text-green-500"></i>
                                    <span className="text-xs text-zinc-400">
                                        API Operational
                                    </span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-times-circle text-primary-400 text-xs"></i>
                                    <span className="text-xs text-zinc-400">
                                        API Offline
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <a
                            href="#"
                            className="text-sm text-zinc-500 transition-colors hover:text-white"
                        >
                            Documentation
                        </a>
                        <a
                            href="#"
                            className="text-sm text-zinc-500 transition-colors hover:text-white"
                        >
                            Support
                        </a>
                        <a
                            href="#"
                            className="text-sm text-zinc-500 transition-colors hover:text-white"
                        >
                            API
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

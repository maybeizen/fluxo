'use client'

import React from 'react'
import { Product } from '@fluxo/types'
import Spinner from '@/components/ui/spinner'

interface PlanSelectionProps {
    products: Product[]
    selectedPlan: string
    isLoading: boolean
    onPlanSelect: (planId: string) => void
}

export default function PlanSelection({
    products,
    selectedPlan,
    isLoading,
    onPlanSelect,
}: PlanSelectionProps) {
    const formatPrice = (price: number) => {
        console.log(price)
        const dollars = (price / 100).toFixed(2)
        return { dollars, full: `$${dollars}/mo` }
    }

    return (
        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6 lg:p-8">
            <h2 className="mb-2 text-xl font-semibold text-white">
                Step 3: Choose Plan
            </h2>
            <p className="mb-6 text-sm text-zinc-400">
                Select the plan that best fits your needs.
            </p>

            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Spinner />
                </div>
            ) : products.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-zinc-400">
                        No plans available at the moment.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => {
                        const price = formatPrice(product.metadata.price)
                        const specs = product.specifications
                        const memoryGB = (specs.ram / 1024).toFixed(0)
                        const storageGB = (specs.storage / 1024).toFixed(0)
                        const cpuCores = (specs.cpu / 100).toFixed(0)

                        return (
                            <button
                                key={product.uuid}
                                type="button"
                                onClick={() => onPlanSelect(product.uuid)}
                                className={`relative cursor-pointer rounded-lg border-2 p-6 text-left transition-all ${
                                    selectedPlan === product.uuid
                                        ? 'border-primary-400 bg-zinc-900'
                                        : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                                }`}
                            >
                                <div className="mb-2 flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="mb-1 text-xl font-bold text-white">
                                            {product.metadata.name}
                                        </h3>
                                        <p className="text-sm text-zinc-400">
                                            {product.metadata.description}
                                        </p>
                                    </div>
                                    <div className="ml-4 text-right">
                                        <p className="text-2xl font-bold text-green-500">
                                            ${price.dollars}
                                            <span className="text-lg font-normal text-green-500">
                                                /mo
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-zinc-800 pt-6">
                                    <div className="flex flex-col items-center">
                                        <i className="fas fa-memory text-primary-400 mb-2 text-xl"></i>
                                        <p className="mb-1 text-lg font-bold text-white">
                                            {memoryGB}GB
                                        </p>
                                        <p className="text-xs text-zinc-400 uppercase">
                                            Memory
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <i className="fas fa-microchip text-primary-400 mb-2 text-xl"></i>
                                        <p className="mb-1 text-lg font-bold text-white">
                                            {cpuCores} Cores
                                        </p>
                                        <p className="text-xs text-zinc-400 uppercase">
                                            CPU
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <i className="fas fa-hard-drive text-primary-400 mb-2 text-xl"></i>
                                        <p className="mb-1 text-lg font-bold text-white">
                                            {storageGB}GB
                                        </p>
                                        <p className="text-xs text-zinc-400 uppercase">
                                            Storage
                                        </p>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

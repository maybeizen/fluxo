'use client'

import { useState, useEffect } from 'react'
import { Service, Invoice as InvoiceType } from '@fluxo/types'
import { fetchServices, fetchInvoices, fetchNews, News } from '@/lib/dashboard'

export function useDashboardData() {
    const [services, setServices] = useState<Service[]>([])
    const [invoices, setInvoices] = useState<InvoiceType[]>([])
    const [news, setNews] = useState<News[]>([])
    const [isLoadingServices, setIsLoadingServices] = useState(false)
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)
    const [isLoadingNews, setIsLoadingNews] = useState(false)

    useEffect(() => {
        const loadAllData = async () => {
            setIsLoadingServices(true)
            setIsLoadingInvoices(true)
            setIsLoadingNews(true)

            try {
                const [servicesData, invoicesData, newsData] =
                    await Promise.all([
                        fetchServices(),
                        fetchInvoices(),
                        fetchNews(),
                    ])

                setServices(servicesData)
                setInvoices(invoicesData as InvoiceType[])
                setNews(newsData)
            } catch (error) {
                console.error('Error loading dashboard data:', error)
            } finally {
                setIsLoadingServices(false)
                setIsLoadingInvoices(false)
                setIsLoadingNews(false)
            }
        }

        loadAllData()
    }, [])

    return {
        services,
        invoices,
        news,
        isLoadingServices,
        isLoadingInvoices,
        isLoadingNews,
        setNews,
    }
}

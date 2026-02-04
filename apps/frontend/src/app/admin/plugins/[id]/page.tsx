'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Redirect /admin/plugins/[id] to /admin/plugins/[id]/overview
 */
export default function PluginDetailRedirect() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    useEffect(() => {
        if (id) router.replace(`/admin/plugins/${id}/overview`)
    }, [id, router])

    return null
}

import { getDb, services, userConfigSelections, eq, and } from '@fluxo/db'

export async function submitUserSelections(
    serviceId: number,
    userId: number,
    selections: Record<number, unknown>
): Promise<void> {
    const db = getDb()

    const [service] = await db
        .select({ id: services.id })
        .from(services)
        .where(
            and(eq(services.id, serviceId), eq(services.serviceOwnerId, userId))
        )
        .limit(1)

    if (!service) {
        throw new Error('Service not found')
    }

    const optionIds = Object.keys(selections).map((id) => parseInt(id, 10))

    for (const optionId of optionIds) {
        await db
            .delete(userConfigSelections)
            .where(
                and(
                    eq(userConfigSelections.userId, userId),
                    eq(userConfigSelections.optionId, optionId)
                )
            )
    }

    const rows = Object.entries(selections).map(([optionId, value]) => ({
        userId,
        optionId: parseInt(optionId, 10),
        value,
        invoiceId: null,
    }))

    if (rows.length > 0) {
        await db.insert(userConfigSelections).values(rows)
    }
}

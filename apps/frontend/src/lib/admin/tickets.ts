import { apiClient } from '@/lib/api-client'
import {
    type Ticket,
    type TicketStatus,
    type TicketType,
    type TicketMessage,
    type UserRole,
    type UserProfile,
} from '@fluxo/types'
import { type TicketWithMessages } from '@/lib/client/tickets'

export interface FetchTicketsParams {
    page?: number
    limit?: number
    status?: TicketStatus
    type?: TicketType
    assignedToId?: string
    userId?: string
}

export interface FetchTicketsResponse {
    success: boolean
    message: string
    tickets: Ticket[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export interface UpdateTicketData {
    title?: string
    content?: string
    status?: TicketStatus
    type?: TicketType
    assignedToId?: string
}

export async function fetchTickets(
    params: FetchTicketsParams = {}
): Promise<FetchTicketsResponse> {
    const { page = 1, limit = 10, status, type, assignedToId, userId } = params
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    })

    if (status) queryParams.append('status', status)
    if (type) queryParams.append('type', type)
    if (assignedToId) queryParams.append('assignedToId', assignedToId)
    if (userId) queryParams.append('userId', userId)

    const response = await apiClient.get(
        `/admin/tickets?${queryParams.toString()}`,
        {
            withCredentials: true,
        }
    )

    return response.data
}

export async function fetchTicketById(id: string): Promise<TicketWithMessages> {
    const response = await apiClient.get(`/admin/tickets/${id}`, {})
    return response.data.ticket
}

export async function updateTicket(
    id: string,
    data: UpdateTicketData
): Promise<Ticket> {
    const response = await apiClient.patch(`/admin/tickets/${id}`, data, {
        withCredentials: true,
    })
    return response.data.ticket
}

export async function deleteTicket(id: string): Promise<void> {
    await apiClient.delete(`/admin/tickets/${id}`, {})
}

interface TicketMessageWithAuthor extends TicketMessage {
    author?: {
        uuid: string
        email: string
        profile?: UserProfile
        role?: UserRole
    }
}

export async function addMessage(
    ticketId: string,
    content: string
): Promise<{ success: boolean; ticketMessage: TicketMessageWithAuthor }> {
    const response = await apiClient.post(
        `/admin/tickets/${ticketId}/messages`,
        { content },
        {
            withCredentials: true,
        }
    )
    return response.data
}

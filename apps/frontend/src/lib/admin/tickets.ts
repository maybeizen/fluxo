import axios from 'axios'
import {
    Ticket,
    TicketStatus,
    TicketType,
    TicketMessage,
    UserRole,
    UserProfile,
} from '@fluxo/types'
import { TicketWithMessages } from '@/lib/client/tickets'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

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

    const response = await axios.get(
        `${API_URL}/admin/tickets?${queryParams.toString()}`,
        {
            withCredentials: true,
        }
    )

    return response.data
}

export async function fetchTicketById(id: string): Promise<TicketWithMessages> {
    const response = await axios.get(`${API_URL}/admin/tickets/${id}`, {
        withCredentials: true,
    })
    return response.data.ticket
}

export async function updateTicket(
    id: string,
    data: UpdateTicketData
): Promise<Ticket> {
    const response = await axios.patch(`${API_URL}/admin/tickets/${id}`, data, {
        withCredentials: true,
    })
    return response.data.ticket
}

export async function deleteTicket(id: string): Promise<void> {
    await axios.delete(`${API_URL}/admin/tickets/${id}`, {
        withCredentials: true,
    })
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
    const response = await axios.post(
        `${API_URL}/admin/tickets/${ticketId}/messages`,
        { content },
        {
            withCredentials: true,
        }
    )
    return response.data
}

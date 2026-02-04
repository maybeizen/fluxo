import axios from 'axios'
import {
    Ticket,
    TicketMessage,
    TicketStatus,
    TicketType,
    UserRole,
    UserProfile,
    UserPunishment,
} from '@fluxo/types'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export interface CreateTicketData {
    title: string
    content: string
    type: TicketType
}

export interface AddMessageData {
    content: string
}

export interface FetchTicketsParams {
    page?: number
    limit?: number
    status?: TicketStatus
    type?: TicketType
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

interface TicketMessageAuthor {
    uuid: string
    email: string
    profile?: UserProfile
    role?: UserRole
}

interface TicketUser {
    uuid: string
    email: string
    profile?: UserProfile
    role?: UserRole
    punishment?: UserPunishment
}

export interface TicketWithMessages extends Ticket {
    messages?: (TicketMessage & { author?: TicketMessageAuthor })[]
    user?: TicketUser
    assignedTo?: TicketUser
}

export async function fetchTickets(
    params: FetchTicketsParams = {}
): Promise<FetchTicketsResponse> {
    const { page = 1, limit = 10, status, type } = params
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    })

    if (status) queryParams.append('status', status)
    if (type) queryParams.append('type', type)

    const response = await axios.get(
        `${API_URL}/client/tickets?${queryParams.toString()}`,
        {
            withCredentials: true,
        }
    )

    return response.data
}

export async function fetchTicketById(id: string): Promise<TicketWithMessages> {
    const response = await axios.get(`${API_URL}/client/tickets/${id}`, {
        withCredentials: true,
    })
    return response.data.ticket
}

export async function createTicket(data: CreateTicketData): Promise<Ticket> {
    const response = await axios.post(`${API_URL}/client/tickets`, data, {
        withCredentials: true,
    })
    return response.data.ticket
}

export async function addMessage(
    ticketId: string,
    data: AddMessageData
): Promise<TicketMessage> {
    const response = await axios.post(
        `${API_URL}/client/tickets/${ticketId}/messages`,
        data,
        {
            withCredentials: true,
        }
    )
    return response.data.ticketMessage
}

export async function uploadAttachment(
    ticketId: string,
    file: File
): Promise<{ uuid: string; fileUrl: string; createdAt: Date }> {
    const formData = new FormData()
    formData.append('attachment', file)

    const response = await axios.post(
        `${API_URL}/client/tickets/${ticketId}/attachments`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
        }
    )

    return response.data.attachment
}

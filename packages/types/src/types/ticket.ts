export enum TicketStatus {
    OPEN = 'open',
    CLOSED = 'closed',
    DELETED = 'deleted',
}

export enum TicketType {
    GENERAL = 'general',
    TECHNICAL = 'account',
    BILLING = 'billing',
    LEGAL = 'legal',
    OTHER = 'other',
}

export interface TicketMessage {
    uuid: string
    ticketUuid: string
    content: string
    authorId: string
    createdAt: Date
}

export interface TicketAttachment {
    uuid: string
    ticketUuid: string
    fileUrl: string
    createdAt: Date
}

export interface TicketTimestamps {
    createdAt: Date
    updatedAt: Date
    respondedToAt?: Date
    closedAt?: Date
    deletedAt?: Date
}

export interface Ticket {
    uuid: string
    userId: string
    assignedToId?: string
    title: string
    content: string
    status: TicketStatus
    type: TicketType
    timestamps: TicketTimestamps
}

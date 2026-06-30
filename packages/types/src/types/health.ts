export interface HealthResponse {
    status: HealthStatus
    message: string
    timestamp: string
}

export enum HealthStatus {
    OK = 'ok',
}

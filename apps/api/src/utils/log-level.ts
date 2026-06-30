import { setLogLevel } from '@fluxo/logger'

export function applyDebugLogLevel(debugMode: boolean): void {
    setLogLevel(debugMode ? 'debug' : undefined)
}

export interface CommandOption {
    name: string
    description?: string
    type?: string
    required?: boolean
}

export interface CommandData {
    name: string
    description?: string
    usage?: string
    group?: string
    options?: CommandOption[]
    examples?: string[]
}

export type CommandExecute = (
    positionals: string[],
    options: Record<string, string | boolean>
) => Promise<void> | void

export interface CommandModule {
    key: string
    data: CommandData
    execute: CommandExecute
}

export type CommandRegistry = Map<string, CommandModule>

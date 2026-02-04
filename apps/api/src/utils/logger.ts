import chalk from 'chalk'

chalk.level = 3

type LogLevel = 'SUCCESS' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

interface LogConfig {
    color?: string
    source?: string
    prefix?: string
    badge?: string
    timestamp?: boolean
}

interface LogOptions {
    level: LogLevel
    message: string
    config?: LogConfig
}

const getLevelColor = (level: LogLevel): ((text: string) => string) => {
    const colors: Record<LogLevel, (text: string) => string> = {
        SUCCESS: chalk.green,
        INFO: chalk.blue,
        WARN: chalk.yellow,
        ERROR: chalk.red,
        FATAL: chalk.bgRed.white,
    }
    return colors[level]
}

const getMessageColor = (
    level: LogLevel,
    customColor?: string
): ((text: string) => string) => {
    if (customColor) {
        const colorMap: Record<string, (text: string) => string> = {
            red: chalk.red,
            green: chalk.green,
            blue: chalk.blue,
            yellow: chalk.yellow,
            magenta: chalk.magenta,
            cyan: chalk.cyan,
            white: chalk.white,
            gray: chalk.gray,
            grey: chalk.gray,
            black: chalk.black,
            redBright: chalk.redBright,
            greenBright: chalk.greenBright,
            blueBright: chalk.blueBright,
            yellowBright: chalk.yellowBright,
            magentaBright: chalk.magentaBright,
            cyanBright: chalk.cyanBright,
        }
        return colorMap[customColor] || chalk.white
    }

    const colors: Record<LogLevel, (text: string) => string> = {
        SUCCESS: chalk.green,
        INFO: chalk.white,
        WARN: chalk.yellow,
        ERROR: chalk.red,
        FATAL: chalk.red.bold,
    }
    return colors[level]
}

const formatTime = (): string => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0')
    return `${hours}:${minutes}:${seconds}.${milliseconds}`
}

const getSourceFromStack = (): string | undefined => {
    const stack = new Error().stack
    if (!stack) return undefined

    const lines = stack.split('\n')
    for (const line of lines) {
        if (line.includes('/api/v1/')) {
            const match = line.match(/\/api\/v1\/([^/]+)/)
            if (match) {
                const dir = match[1]
                return dir.charAt(0).toUpperCase() + dir.slice(1)
            }
        }
        if (line.includes('/workers/')) {
            return 'Worker'
        }
        if (line.includes('/middleware/')) {
            return 'Middleware'
        }
        if (line.includes('/utils/')) {
            const match = line.match(/\/utils\/([^./]+)/)
            if (match) {
                const util = match[1]
                return util.charAt(0).toUpperCase() + util.slice(1)
            }
        }
        if (line.includes('index.ts') || line.includes('app.ts')) {
            return 'Server'
        }
    }
    return undefined
}

const log = ({ level, message, config = {} }: LogOptions): void => {
    const showTimestamp = config.timestamp !== false
    const parts: string[] = []

    if (showTimestamp) {
        parts.push(chalk.gray(`[${formatTime()}]`))
    }

    const levelColor = getLevelColor(level)
    parts.push(levelColor(`[${level}]`))

    const source = config.source || getSourceFromStack()
    if (source) {
        parts.push(chalk.cyan(`[${source}]`))
    }

    if (config.badge) {
        parts.push(chalk.bgBlue.white(` ${config.badge} `))
    }

    if (config.prefix) {
        parts.push(chalk.gray(config.prefix))
    }

    const messageColor = getMessageColor(level, config.color)
    const formattedMessage = messageColor(message)
    parts.push(formattedMessage)

    console.log(parts.join(' '))
}

export const logger = {
    success: (message: string, config?: LogConfig) => {
        log({ level: 'SUCCESS', message, config })
    },

    info: (message: string, config?: LogConfig) => {
        log({ level: 'INFO', message, config })
    },

    warn: (message: string, config?: LogConfig) => {
        log({ level: 'WARN', message, config })
    },

    error: (message: string, config?: LogConfig) => {
        log({ level: 'ERROR', message, config })
    },

    fatal: (message: string, config?: LogConfig) => {
        log({ level: 'FATAL', message, config })
    },
}

import chalk from 'chalk'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import winston from 'winston'
import { resolveLogsDir } from './paths.js'

chalk.level = 3

type LogLevel = 'SUCCESS' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'DEBUG'

export interface LogConfig {
    color?: string
    source?: string
    prefix?: string
    badge?: string
    timestamp?: boolean
}

export interface FluxoLogger {
    success: (message: string, config?: LogConfig) => void
    info: (message: string, config?: LogConfig) => void
    warn: (message: string, config?: LogConfig) => void
    error: (message: string, config?: LogConfig) => void
    fatal: (message: string, config?: LogConfig) => void
    debug: (message: string, config?: LogConfig) => void
    setLogLevel: (level?: string) => void
}

export interface CreateLoggerOptions {
    source?: string
    file?: boolean
    level?: string
    json?: boolean
}

const getLevelColor = (level: LogLevel): ((text: string) => string) => {
    const colors: Record<LogLevel, (text: string) => string> = {
        SUCCESS: chalk.green,
        INFO: chalk.blue,
        WARN: chalk.yellow,
        ERROR: chalk.red,
        FATAL: chalk.bgRed.white,
        DEBUG: chalk.magenta,
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
        DEBUG: chalk.gray,
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

const formatPrettyLine = (
    level: LogLevel,
    message: string,
    config: LogConfig = {},
    defaultSource?: string
): string => {
    const showTimestamp = config.timestamp !== false
    const parts: string[] = []

    if (showTimestamp) {
        parts.push(chalk.gray(`[${formatTime()}]`))
    }

    const levelColor = getLevelColor(level)
    parts.push(levelColor(`[${level}]`))

    const source = config.source || defaultSource
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
    parts.push(messageColor(message))

    return parts.join(' ')
}

const winstonLevelMap: Record<LogLevel, string> = {
    SUCCESS: 'info',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    FATAL: 'error',
    DEBUG: 'debug',
}

function resolveLogLevel(opts: CreateLoggerOptions): string {
    if (opts.level) return opts.level.toLowerCase()
    const envLevel = process.env.LOG_LEVEL ?? process.env.FLUXO_LOG_LEVEL
    if (envLevel) return envLevel.toLowerCase()
    return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

function useJsonFormat(opts: CreateLoggerOptions): boolean {
    if (opts.json !== undefined) return opts.json
    return (
        process.env.LOG_FORMAT === 'json' ||
        process.env.NODE_ENV === 'production'
    )
}

export function createLogger(opts: CreateLoggerOptions = {}): FluxoLogger {
    const { source: defaultSource, file = true } = opts
    const jsonMode = useJsonFormat(opts)
    const level = resolveLogLevel(opts)

    const transports: winston.transport[] = [
        new winston.transports.Console({
            format: jsonMode
                ? winston.format.combine(
                      winston.format.timestamp(),
                      winston.format.json()
                  )
                : winston.format.printf(({ message }) => String(message)),
        }),
    ]

    if (file) {
        const logsDir = resolveLogsDir()
        mkdirSync(logsDir, { recursive: true })
        transports.push(
            new winston.transports.File({
                filename: join(logsDir, 'combined.log'),
                maxsize: 5 * 1024 * 1024,
                maxFiles: 5,
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                ),
            }),
            new winston.transports.File({
                filename: join(logsDir, 'error.log'),
                level: 'error',
                maxsize: 5 * 1024 * 1024,
                maxFiles: 5,
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                ),
            })
        )
    }

    const winstonLogger = winston.createLogger({
        level,
        transports,
    })

    const setLogLevel = (nextLevel?: string): void => {
        winstonLogger.level = nextLevel ?? resolveLogLevel({})
    }

    const log = (
        logLevel: LogLevel,
        message: string,
        config?: LogConfig
    ): void => {
        if (jsonMode) {
            winstonLogger.log(winstonLevelMap[logLevel], message, {
                level: logLevel,
                source: config?.source ?? defaultSource,
            })
            return
        }
        const prettyLine = formatPrettyLine(
            logLevel,
            message,
            config,
            defaultSource
        )
        winstonLogger.log(winstonLevelMap[logLevel], prettyLine)
    }

    return {
        success: (message, config) => log('SUCCESS', message, config),
        info: (message, config) => log('INFO', message, config),
        warn: (message, config) => log('WARN', message, config),
        error: (message, config) => log('ERROR', message, config),
        fatal: (message, config) => log('FATAL', message, config),
        debug: (message, config) => log('DEBUG', message, config),
        setLogLevel,
    }
}

let defaultLogger: FluxoLogger | null = null

export function setLogLevel(level?: string): void {
    defaultLogger?.setLogLevel(level)
}

export const logger = createLogger()
defaultLogger = logger
export { findRepoRoot, resolveLogsDir } from './paths.js'

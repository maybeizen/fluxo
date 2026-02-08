/**
 * Parse CLI arguments into positional args and options.
 * Supports: --flag, --flag=value, -f, -f value
 * Validates against command's data.options when provided.
 */

/**
 * @typedef {Object} OptionDef
 * @property {string} name
 * @property {string} [type] - 'string' | 'boolean' | 'number'
 * @property {boolean} [required]
 * @property {string} [description]
 */

/**
 * @typedef {Object} ParseResult
 * @property {string[]} positionals - positional arguments
 * @property {Record<string, string | boolean | number>} options - parsed options
 */

/**
 * Parse raw argv into positionals and options.
 * Stops parsing options at '--' (remainder become positionals).
 *
 * @param {string[]} argv - e.g. process.argv.slice(2)
 * @param {OptionDef[]} [optionDefs] - command's data.options for validation
 * @returns {ParseResult}
 */
export function parseArgs(argv, optionDefs = []) {
    const positionals = []
    const options =
        /** @type {Record<string, string | boolean | number>} */ ({})

    const defByName = new Map((optionDefs || []).map((d) => [d.name, d]))

    let i = 0
    while (i < argv.length) {
        const arg = argv[i]

        if (arg === '--') {
            positionals.push(...argv.slice(i + 1))
            break
        }

        if (arg.startsWith('--')) {
            const name = arg.slice(2)
            const eq = name.indexOf('=')
            const key = eq >= 0 ? name.slice(0, eq) : name
            const valueStr = eq >= 0 ? name.slice(eq + 1) : undefined

            if (valueStr !== undefined) {
                options[key] = coerceValue(key, valueStr, defByName.get(key))
            } else {
                const def = defByName.get(key)
                if (def && (def.type === 'boolean' || !def.type)) {
                    options[key] = true
                } else {
                    i += 1
                    if (i >= argv.length) {
                        throw new Error(`Option --${key} requires a value`)
                    }
                    options[key] = coerceValue(key, argv[i], def)
                }
            }
            i += 1
            continue
        }

        if (arg.length > 1 && arg.startsWith('-') && !arg.startsWith('--')) {
            const short = arg.slice(1)
            const def = Array.from(defByName.values()).find(
                (d) =>
                    d.name === short ||
                    (d.name.length === 1 && d.name === short)
            )
            if (def && (def.type === 'boolean' || !def.type)) {
                options[def.name] = true
            } else {
                if (short.length > 1) {
                    options[short] = coerceValue(short, short, def)
                } else {
                    i += 1
                    if (i >= argv.length) {
                        throw new Error(`Option -${short} requires a value`)
                    }
                    options[def?.name || short] = coerceValue(
                        def?.name || short,
                        argv[i],
                        def
                    )
                }
            }
            i += 1
            continue
        }

        positionals.push(arg)
        i += 1
    }

    if (optionDefs && optionDefs.length) {
        validateOptions(options, optionDefs)
    }

    return { positionals, options }
}

/**
 * @param {string} key
 * @param {string} valueStr
 * @param {OptionDef | undefined} def
 * @returns {string | boolean | number}
 */
function coerceValue(key, valueStr, def) {
    if (def?.type === 'boolean') {
        const v = valueStr.toLowerCase()
        if (v === 'true' || v === '1' || v === 'yes') return true
        if (v === 'false' || v === '0' || v === 'no') return false
    }
    if (def?.type === 'number') {
        const n = Number(valueStr)
        if (Number.isNaN(n)) {
            throw new Error(
                `Option --${key} expects a number, got: ${valueStr}`
            )
        }
        return n
    }
    return valueStr
}

/**
 * @param {Record<string, string | boolean | number>} options
 * @param {OptionDef[]} optionDefs
 */
function validateOptions(options, optionDefs) {
    for (const def of optionDefs) {
        if (
            def.required &&
            (options[def.name] === undefined || options[def.name] === '')
        ) {
            throw new Error(
                `Missing required option: ${def.name}${def.description ? ` (${def.description})` : ''}`
            )
        }
    }
}

import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createLogger } from '@fluxo/logger'
import { pluginManifestSchema } from '@fluxo/forge'
import { findRepoRoot } from '../../utils/paths.js'
import { promptSelect, promptText } from '../../utils/prompts.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'new',
    description: 'Scaffold a new gateway or service plugin',
    usage: 'fluxo plugins new [--type gateway|service] [--id <id>] [--name <name>] [--author <author>] [--description <text>]',
    group: 'Plugins',
    options: [
        { name: 'type', description: 'Plugin type: gateway or service' },
        { name: 'id', description: 'Plugin id (lowercase, a-z0-9-_)' },
        { name: 'name', description: 'Display name' },
        { name: 'author', description: 'Author name' },
        { name: 'description', description: 'Short description' },
    ],
    examples: [
        'fluxo plugins new --type service --id my-service --name "My Service"',
        'fluxo plugins new --type gateway --id my-gateway',
    ],
}

function optString(
    options: Record<string, string | boolean>,
    key: string
): string | undefined {
    const v = options[key]
    return typeof v === 'string' ? v : undefined
}

function toPascalCase(id: string): string {
    return id
        .split(/[-_]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
}

function gatewayBackend(className: string, id: string): string {
    return `import {
    FluxoGatewayPlugin,
    type GatewayPaymentRequest,
    type GatewayPaymentResult,
    type PluginSettingsField,
} from '@fluxo/forge'

export default class ${className} extends FluxoGatewayPlugin {
    getPaymentProviderKey(): string {
        return '${id}'
    }

    override getSettingsSchema(): PluginSettingsField[] {
        return []
    }

    async processPayment(
        request: GatewayPaymentRequest
    ): Promise<GatewayPaymentResult> {
        this.ctx.logger.info('Processing payment (stub)', {
            source: this.manifest.id,
        })

        return {
            redirectUrl: \`/client/invoices?pay=\${request.invoiceId}\`,
            transactionId: \`pending-\${request.invoiceId}\`,
        }
    }
}
`
}

function serviceBackend(className: string): string {
    return `import {
    FluxoServerPlugin,
    type ProvisionServiceInput,
    type ProvisionServiceResult,
    type ServicePluginConfigField,
} from '@fluxo/forge'

export default class ${className} extends FluxoServerPlugin {
    getConfigFields(): ServicePluginConfigField[] {
        return [
            {
                key: 'example',
                label: 'Example field',
                type: 'string',
                placeholder: 'value',
            },
        ]
    }

    async provisionService(
        input: ProvisionServiceInput
    ): Promise<ProvisionServiceResult> {
        this.ctx.logger.info('Provisioning service (stub)', {
            source: this.manifest.id,
        })

        return {
            externalId: \`stub-\${input.userId}-\${Date.now()}\`,
            metadata: { pluginConfig: input.pluginConfig },
        }
    }
}
`
}

export const execute: CommandExecute = async (_positionals, options) => {
    const type =
        optString(options, 'type') ??
        (await promptSelect('Plugin type', [
            { value: 'service', label: 'Service (server provisioning)' },
            { value: 'gateway', label: 'Gateway (payments)' },
        ]))

    if (type !== 'gateway' && type !== 'service') {
        throw new Error('Type must be gateway or service')
    }

    const id =
        optString(options, 'id') ??
        (await promptText('Plugin id', {
            placeholder: 'my-plugin',
            validate: (v) => {
                const r = pluginManifestSchema.shape.id.safeParse(v)
                return r.success
                    ? undefined
                    : (r.error.issues[0]?.message ?? 'Invalid id')
            },
        }))

    pluginManifestSchema.shape.id.parse(id)

    const name =
        optString(options, 'name') ??
        (await promptText('Display name', {
            defaultValue: id
                .split(/[-_]+/)
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' '),
        }))

    const author =
        optString(options, 'author') ??
        (await promptText('Author', { defaultValue: 'Fluxo' }))

    const description =
        optString(options, 'description') ??
        (await promptText('Description (optional)', { defaultValue: '' }))

    const root = findRepoRoot()
    const pluginDir = join(root, 'plugins', id)

    if (existsSync(pluginDir)) {
        throw new Error(
            `Plugin directory already exists: plugins/${id}. Choose a different id or remove the existing directory.`
        )
    }

    const manifest = {
        id,
        name,
        version: '1.0.0',
        type,
        description: description || undefined,
        author,
    }

    pluginManifestSchema.parse(manifest)

    const packageName = `@fluxo/plugin-${id}`
    const className = `${toPascalCase(id)}Plugin`

    const packageJson = {
        name: packageName,
        version: '1.0.0',
        private: true,
        type: 'module',
        scripts: {
            lint: 'eslint',
            types: 'tsc --noEmit',
        },
        dependencies: {
            '@fluxo/forge': 'workspace:*',
            zod: '^4.3.6',
        },
        devDependencies: {
            '@fluxo/eslint-config': 'workspace:*',
            eslint: '^9.39.2',
            typescript: '^5.9.3',
        },
    }

    const tsconfig = {
        extends: '../../tsconfig.base.json',
        compilerOptions: {
            moduleResolution: 'node',
            noEmit: true,
        },
        include: ['backend/**/*.ts'],
    }

    const eslintConfig = `import { fluxoNodeConfig } from '@fluxo/eslint-config/node'

export default [...fluxoNodeConfig]
`

    const readme = `# ${name}

${description || `Scaffolded ${type} plugin for Fluxo.`}

## Development

\`\`\`bash
bun install
bun run --filter ${packageName} types
\`\`\`

See [docs/plugins/API.md](../../docs/plugins/API.md) for plugin contracts.
`

    const backend =
        type === 'gateway'
            ? gatewayBackend(className, id)
            : serviceBackend(className)

    await mkdir(join(pluginDir, 'backend'), { recursive: true })
    await writeFile(
        join(pluginDir, 'plugin.json'),
        `${JSON.stringify(manifest, null, 4)}\n`
    )
    await writeFile(
        join(pluginDir, 'package.json'),
        `${JSON.stringify(packageJson, null, 4)}\n`
    )
    await writeFile(
        join(pluginDir, 'tsconfig.json'),
        `${JSON.stringify(tsconfig, null, 4)}\n`
    )
    await writeFile(join(pluginDir, 'eslint.config.js'), eslintConfig)
    await writeFile(join(pluginDir, 'README.md'), readme)
    await writeFile(join(pluginDir, 'backend', 'index.ts'), backend)

    logger.success(`Created plugin at plugins/${id}`)
    console.log(`\nNext steps:`)
    console.log(`  bun install`)
    console.log(`  bun run --filter ${packageName} types`)
}

import * as clack from '@clack/prompts'

function handleCancel<T>(value: T | symbol): T {
    if (clack.isCancel(value)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
    }
    return value
}

export async function promptText(
    message: string,
    opts?: {
        placeholder?: string
        defaultValue?: string
        validate?: (v: string) => string | undefined
    }
): Promise<string> {
    const value = await clack.text({
        message,
        placeholder: opts?.placeholder,
        defaultValue: opts?.defaultValue,
        validate: opts?.validate,
    })
    return handleCancel(value)
}

export async function promptPassword(
    message: string,
    opts?: { validate?: (v: string) => string | undefined }
): Promise<string> {
    const value = await clack.password({
        message,
        validate: opts?.validate,
    })
    return handleCancel(value)
}

export async function promptSelect<T extends string>(
    message: string,
    options: { value: T; label: string; hint?: string }[]
): Promise<T> {
    const value = await clack.select({
        message,
        options: options.map((o) => {
            const opt: { value: T; label: string; hint?: string } = {
                value: o.value,
                label: o.label,
            }
            if (o.hint) opt.hint = o.hint
            return opt
        }) as clack.Option<T>[],
    })
    return handleCancel(value) as T
}

export async function promptConfirm(
    message: string,
    initialValue = false
): Promise<boolean> {
    const value = await clack.confirm({ message, initialValue })
    return handleCancel(value)
}

export function intro(title: string): void {
    clack.intro(title)
}

export function outro(message: string): void {
    clack.outro(message)
}

import sharp from 'sharp'

export type ImageVariantSize = number | 'full'

export interface ProcessedVariant {
    size: ImageVariantSize
    buffer: Buffer
}

export interface ProcessImageOptions {
    sizes: ImageVariantSize[]
    cap: number
    quality?: number
}

export async function processImage(
    buffer: Buffer,
    options: ProcessImageOptions
): Promise<ProcessedVariant[]> {
    const quality = options.quality ?? 82
    const results: ProcessedVariant[] = []

    for (const size of options.sizes) {
        if (size === 'full') {
            const resized = sharp(buffer).rotate().resize({
                width: options.cap,
                height: options.cap,
                fit: 'inside',
                withoutEnlargement: true,
            })
            results.push({
                size: 'full',
                buffer: await resized.webp({ quality }).toBuffer(),
            })
            continue
        }

        const resized = sharp(buffer).rotate().resize(size, size, {
            fit: 'cover',
            position: 'centre',
        })
        results.push({
            size,
            buffer: await resized.webp({ quality }).toBuffer(),
        })
    }

    return results
}

export function variantFilename(
    baseKey: string,
    size: ImageVariantSize
): string {
    const parts = baseKey.split('/')
    const filename = parts.pop()!
    const category = parts.join('/')
    const variantName = `${filename}-${size}.webp`
    return category ? `${category}/${variantName}` : variantName
}

export function variantSuffix(size: ImageVariantSize): string {
    return `-${size}.webp`
}

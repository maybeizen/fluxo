import {
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3'

export interface S3ClientConfig {
    endpoint?: string
    region: string
    bucket: string
    accessKeyId: string
    secretAccessKey: string
    forcePathStyle?: boolean
    publicUrlBase?: string
}

export interface PutObjectParams {
    key: string
    body: Buffer
    contentType: string
}

export function createS3Client(config: S3ClientConfig) {
    const client = new S3Client({
        region: config.region,
        endpoint: config.endpoint,
        forcePathStyle: config.forcePathStyle ?? false,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        },
    })

    const bucket = config.bucket

    async function putObject({
        key,
        body,
        contentType,
    }: PutObjectParams): Promise<void> {
        await client.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
            })
        )
    }

    async function deleteObject(key: string): Promise<void> {
        await client.send(
            new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            })
        )
    }

    function getPublicUrl(key: string): string {
        if (config.publicUrlBase) {
            const base = config.publicUrlBase.replace(/\/$/, '')
            return `${base}/${key}`
        }

        if (config.endpoint) {
            const endpoint = config.endpoint.replace(/\/$/, '')
            if (config.forcePathStyle) {
                return `${endpoint}/${bucket}/${key}`
            }
        }

        return `https://${bucket}.s3.${config.region}.amazonaws.com/${key}`
    }

    return { putObject, deleteObject, getPublicUrl }
}

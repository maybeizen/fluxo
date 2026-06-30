import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
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

export interface S3ClientHelpers {
    putObject: (params: PutObjectParams) => Promise<void>
    deleteObject: (key: string) => Promise<void>
    getPublicUrl: (key: string) => string
}

export function createS3Client(config: S3ClientConfig): S3ClientHelpers {
    const client = new S3Client({
        region: config.region,
        endpoint: config.endpoint,
        forcePathStyle: config.forcePathStyle ?? false,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        },
    })

    const putObject = async ({
        key,
        body,
        contentType,
    }: PutObjectParams): Promise<void> => {
        await client.send(
            new PutObjectCommand({
                Bucket: config.bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
            })
        )
    }

    const deleteObject = async (key: string): Promise<void> => {
        await client.send(
            new DeleteObjectCommand({
                Bucket: config.bucket,
                Key: key,
            })
        )
    }

    const getPublicUrl = (key: string): string => {
        if (config.publicUrlBase) {
            const base = config.publicUrlBase.replace(/\/$/, '')
            return `${base}/${key}`
        }

        if (config.endpoint) {
            const endpoint = config.endpoint.replace(/\/$/, '')
            if (config.forcePathStyle) {
                return `${endpoint}/${config.bucket}/${key}`
            }
        }

        return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`
    }

    return { putObject, deleteObject, getPublicUrl }
}

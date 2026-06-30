import { type Request, type Response } from 'express'
import { ZodError } from 'zod'
import { submitConfigSelectionsSchema } from '../../../../validators/client/config-selections'
import { logger } from '../../../../utils/logger'
import { submitUserSelections } from '../../../../services/configurable-options'
import { formatZodErrors } from '../../../../utils/zod-errors'

export const submitConfigSelections = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const validated = await submitConfigSelectionsSchema.parseAsync({
            params: req.params,
            body: req.body,
        })

        await submitUserSelections(
            validated.params.id,
            req.userId,
            validated.body.selections
        )

        return res.status(200).json({
            success: true,
            message: 'Config selections updated successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error submitting config selections - ${error}`)
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: formatZodErrors(error),
            })
        }
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Internal server error',
        })
    }
}

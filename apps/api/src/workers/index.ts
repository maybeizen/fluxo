import { startServiceSuspensionWorker } from './service-suspension'
import { startServicePaymentWarningWorker } from './service-payment-warning'
import { startRenewalReminderWorker } from './renewal-reminder'
import { startUnverifiedCleanupWorker } from './unverified-cleanup'
import { startCouponExpiryWorker } from './coupon-expiry'
import { startInvoiceExpiryWorker } from './invoice-expiry'
import { startInvoiceCreationWorker } from './invoice-creation'
import { startInvoiceReminderWorker } from './invoice-reminder'
import { logger } from '../utils/logger'

export const startAllWorkers = () => {
    logger.info('Starting all background workers...')
    startServiceSuspensionWorker()
    startServicePaymentWarningWorker()
    startRenewalReminderWorker()
    startUnverifiedCleanupWorker()
    startCouponExpiryWorker()
    startInvoiceExpiryWorker()
    startInvoiceCreationWorker()
    startInvoiceReminderWorker()
    logger.success('All background workers started successfully')
}

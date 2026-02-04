import { Invoice, InvoiceCoupon } from '@fluxo/types'

export function calculateDiscount(
    amount: number,
    coupon?: InvoiceCoupon
): number {
    if (!coupon) return 0

    if (coupon.type === 'percentage') {
        return Math.round((amount * coupon.value) / 100)
    } else if (coupon.type === 'fixed') {
        return Math.round(coupon.value * 100)
    }

    return 0
}

export function calculateInvoiceAmount(invoice: Invoice): number {
    const discount = calculateDiscount(invoice.amount, invoice.coupon)
    return Math.max(0, invoice.amount - discount)
}

export function calculateAmountWithCoupon(
    amount: number,
    coupon?: InvoiceCoupon
): number {
    const discount = calculateDiscount(amount, coupon)
    return Math.max(0, amount - discount)
}

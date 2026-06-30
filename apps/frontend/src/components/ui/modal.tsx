'use client'

import React, { useEffect, useRef } from 'react'
import Button from '@/components/ui/button'

interface ModalProps {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    children?: React.ReactNode
    confirmLabel?: string
    cancelLabel?: string
    onConfirm?: () => void | Promise<void>
    variant?: 'default' | 'danger'
    loading?: boolean
}

export default function Modal({
    open,
    onClose,
    title,
    description,
    children,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    variant = 'default',
    loading = false,
}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (open && !dialog.open) {
            dialog.showModal()
        } else if (!open && dialog.open) {
            dialog.close()
        }
    }, [open])

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        const handleClose = () => onClose()
        dialog.addEventListener('close', handleClose)
        return () => dialog.removeEventListener('close', handleClose)
    }, [onClose])

    const handleConfirm = async () => {
        if (onConfirm) await onConfirm()
        onClose()
    }

    return (
        <dialog
            ref={dialogRef}
            className="border-border bg-surface text-foreground fixed inset-0 z-50 m-auto w-full max-w-md rounded-lg border p-0 shadow-xl backdrop:bg-black/60 open:flex open:flex-col"
            aria-labelledby="modal-title"
            aria-describedby={description ? 'modal-description' : undefined}
            onClick={(e) => {
                if (e.target === dialogRef.current) onClose()
            }}
        >
            <div className="p-6">
                <h2
                    id="modal-title"
                    className="text-foreground mb-2 text-lg font-semibold"
                >
                    {title}
                </h2>
                {description && (
                    <p
                        id="modal-description"
                        className="text-muted mb-4 text-sm"
                    >
                        {description}
                    </p>
                )}
                {children}
                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </Button>
                    {onConfirm && (
                        <Button
                            variant={variant === 'danger' ? 'fail' : 'primary'}
                            onClick={handleConfirm}
                            loading={loading}
                        >
                            {confirmLabel}
                        </Button>
                    )}
                </div>
            </div>
        </dialog>
    )
}

interface ConfirmModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    title: string
    description: string
    confirmLabel?: string
    variant?: 'default' | 'danger'
    loading?: boolean
}

export function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    variant = 'danger',
    loading = false,
}: ConfirmModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            description={description}
            confirmLabel={confirmLabel}
            onConfirm={onConfirm}
            variant={variant}
            loading={loading}
        />
    )
}

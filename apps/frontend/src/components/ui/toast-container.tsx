'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import Toast from './toast'
import { ToastPosition } from './toast'
import { useNotifications } from '../../context/notification-context'

const positionStyles: Record<ToastPosition, string> = {
    'top-left': 'top-4 left-4 items-start',
    'top-right': 'top-4 right-4 items-end',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2 items-center',
    'bottom-left': 'bottom-4 left-4 items-start',
    'bottom-right': 'bottom-4 right-4 items-end',
    'bottom-center':
        'bottom-4 left-1/2 transform -translate-x-1/2 items-center',
}

interface ToastContainerProps {
    position?: ToastPosition
    maxToasts?: number
}

export default function ToastContainer({
    position = 'top-right',
    maxToasts = 5,
}: ToastContainerProps) {
    const { notifications, removeNotification } = useNotifications()

    const notificationsByPosition = notifications.reduce(
        (acc, notification) => {
            const pos = notification.position || position
            if (!acc[pos]) acc[pos] = []
            acc[pos].push(notification)
            return acc
        },
        {} as Record<ToastPosition, typeof notifications>
    )

    if (notifications.length === 0) {
        return null
    }

    return createPortal(
        <>
            {Object.entries(notificationsByPosition).map(
                ([pos, positionNotifications]) => {
                    const positionKey = pos as ToastPosition
                    const limitedNotifications =
                        positionNotifications.slice(-maxToasts)

                    return (
                        <div
                            key={positionKey}
                            className={`pointer-events-none fixed z-50 flex flex-col gap-2 ${positionStyles[positionKey]} `}
                            style={{
                                maxWidth: 'calc(100vw - 2rem)',
                                width: 'auto',
                            }}
                        >
                            {limitedNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="pointer-events-auto"
                                >
                                    <Toast
                                        {...notification}
                                        onClose={removeNotification}
                                    />
                                </div>
                            ))}
                        </div>
                    )
                }
            )}
        </>,
        document.body
    )
}

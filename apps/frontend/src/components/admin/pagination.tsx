import React from 'react'
import Button from '@/components/ui/button'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    className?: string
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
}: PaginationProps) {
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push('...')
                pages.push(currentPage - 1)
                pages.push(currentPage)
                pages.push(currentPage + 1)
                pages.push('...')
                pages.push(totalPages)
            }
        }

        return pages
    }

    return (
        <div className={`flex items-center justify-center gap-2 ${className}`}>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3"
            >
                <i className="fas fa-chevron-left"></i>
            </Button>

            {getPageNumbers().map((page, index) => {
                if (page === '...') {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-zinc-500"
                        >
                            ...
                        </span>
                    )
                }

                return (
                    <Button
                        key={`page-${page}-${index}`}
                        variant={currentPage === page ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => onPageChange(page as number)}
                        className="min-w-[2.5rem]"
                    >
                        {page}
                    </Button>
                )
            })}

            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3"
            >
                <i className="fas fa-chevron-right"></i>
            </Button>
        </div>
    )
}

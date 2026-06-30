const faqs = [
    {
        q: 'How fast is setup?',
        a: 'Servers are provisioned instantly after payment, so you can start right away.',
    },
    {
        q: 'Do you offer backups?',
        a: 'Yes. Automated backups are available on most plans and can be scheduled to your preference.',
    },
    {
        q: 'Is there DDoS protection?',
        a: 'All plans come with enterprise-grade DDoS protection included by default.',
    },
    {
        q: 'Can I upgrade later?',
        a: 'Absolutely. You can scale up your resources at any time from your dashboard.',
    },
    {
        q: 'What is your refund policy?',
        a: 'Within 48 hours of purchase, you can request a 70% cash refund or a 100% refund to your account balance. After 48 hours, refunds are not available.',
    },
]

export default function FAQ() {
    return (
        <section className="container mx-auto px-6 py-16 lg:px-12">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold text-white">
                    Frequently Asked Questions
                </h2>
                <p className="mt-2 text-zinc-400">
                    Answers to common questions about Fluxo
                </p>
            </div>
            <div className="mx-auto max-w-4xl divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950">
                {faqs.map((f) => (
                    <details key={f.q} className="group px-6 py-4">
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary-400/10 flex h-8 w-8 items-center justify-center rounded-md">
                                    <i className="fas fa-circle-question text-primary-400 text-sm"></i>
                                </div>
                                <h3 className="font-medium text-white">
                                    {f.q}
                                </h3>
                            </div>
                            <i className="fas fa-chevron-down text-zinc-500 transition-transform group-open:rotate-180"></i>
                        </summary>
                        <p className="mt-3 pl-11 text-sm leading-relaxed text-zinc-400">
                            {f.a}
                        </p>
                    </details>
                ))}
            </div>
        </section>
    )
}

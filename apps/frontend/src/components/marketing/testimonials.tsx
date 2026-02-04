import Image from 'next/image'

interface Testimonial {
    name: string
    profession: string
    text: string
    avatarUrl: string
}

const testimonials: Testimonial[] = [
    {
        name: 'kaito kid',
        profession: 'Server Owner',
        text: 'My experience with Fluxo was very good, very easy to use, incredible prices and very good customer service.',
        avatarUrl: 'https://minotar.net/avatar/kaitokid/80',
    },
    {
        name: 'akmloli',
        profession: 'Server Owner',
        text: 'Is an excellent hosting service with fast and stable performance. They provide efficient and friendly technical support. The pricing is very competitive compared to other providers.',
        avatarUrl: 'https://minotar.net/avatar/loli/80',
    },
    {
        name: 'Sormessi',
        profession: 'Server Administrator',
        text: 'I have used this host for now over a year and the service thay give is exepcional. They have very cheap plans with a good performance.',
        avatarUrl: 'https://minotar.net/avatar/Sormessi/80',
    },
]

export default function Testimonials() {
    return (
        <section className="container mx-auto px-6 py-16 lg:px-12">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold text-white">
                    What Minecraft Gamers Say
                </h2>
                <p className="mt-2 text-zinc-400">
                    Trusted by communities worldwide
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {testimonials.map((t) => (
                    <div
                        key={t.name}
                        className="rounded-xl border border-zinc-800 bg-zinc-950 p-6"
                    >
                        <div className="mb-3 flex items-center gap-3">
                            <Image
                                src={t.avatarUrl}
                                alt={t.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                            <div>
                                <p className="font-medium text-white">
                                    {t.name}
                                </p>
                                <p className="text-primary-300 text-sm">
                                    {t.profession}
                                </p>
                            </div>
                        </div>
                        <div
                            className="mb-2 flex items-center gap-1"
                            aria-label="5 star rating"
                        >
                            {Array.from({ length: 5 }).map((_, i) => (
                                <i
                                    key={i}
                                    className="fas fa-star text-yellow-400"
                                ></i>
                            ))}
                        </div>
                        <p className="text-sm leading-relaxed text-zinc-300">
                            “{t.text}”
                        </p>
                    </div>
                ))}
            </div>
        </section>
    )
}

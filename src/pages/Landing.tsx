import { About } from '@/components/About'
import { Gallery } from '@/components/Gallery'
import { Prices } from '@/components/Prices'
import { Hero } from '@components/Hero'
import { Menu } from '@components/Menu'

export const Landing = () => {
    return (
        <>
            <Hero />
            <Menu />
            <Prices />
            <Gallery />
            <About />
        </>
    )
}

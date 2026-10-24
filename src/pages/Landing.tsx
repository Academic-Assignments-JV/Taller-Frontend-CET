import { About } from '@/components/About'
import { Admin } from '@/components/Admin'
import { CartModal } from '@/components/CartModal'
import { DetailModal } from '@/components/DetailModal'
import { Footer } from '@/components/Footer'
import { Gallery } from '@/components/Gallery'
import { Prices } from '@/components/Prices'
import { ShopProvider } from '@/hooks'
import { Header } from '@components/Header'
import { Hero } from '@components/Hero'
import { Menu } from '@components/Menu'

export const Landing = () => {
    return (
        <ShopProvider>
            <Header />
            <main>
                <Hero />
                <Menu />
                <Admin />
                <Prices />
                <Gallery />
                <About />
            </main>
            <Footer />
            <CartModal />
            <DetailModal />
        </ShopProvider>
    )
}
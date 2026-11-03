import type { ReactNode } from 'react'
import { CartModal } from '@/components/CartModal'
import { DetailModal } from '@/components/DetailModal'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LoginModal } from '@/components/LoginModal'

interface MainLayoutProps {
    children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <>
            <Header />
            <main>{children}</main>
            <Footer />
            <CartModal />
            <DetailModal />
            <LoginModal />
        </>
    )
}

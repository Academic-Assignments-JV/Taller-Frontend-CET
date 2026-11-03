import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { useShop } from '@/hooks'
import './Header.css'

const NAV_ITEMS = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Menú', href: '#menu' },
    { name: 'Precios', href: '#precios' },
    { name: 'Galería', href: '#galeria' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Contacto', href: '#contacto' }
] as const

export default function Header() {
    const {
        currentPath,
        navigate,
        totalQuantity,
        isCartOpen,
        openCart,
        user,
        isLoginOpen,
        openLogin,
        logout
    } = useShop()
    const [activeHash, setActiveHash] = useState<string>(() => window.location.hash || '#inicio')

    useEffect(() => {
        function handleHashChange() {
            if (window.location.hash) {
                setActiveHash(window.location.hash)
            }
        }

        window.addEventListener('hashchange', handleHashChange)
        return () => window.removeEventListener('hashchange', handleHashChange)
    }, [])

    function handleSectionClick(event: MouseEvent<HTMLAnchorElement>, hash: string) {
        setActiveHash(hash)
        if (currentPath !== '/') {
            event.preventDefault()
            navigate('/', hash)
        }
    }

    function handleAdminClick(event: MouseEvent<HTMLAnchorElement>) {
        event.preventDefault()
        navigate('/admin')
    }

    return (
        <header>
            <a
                href="/#inicio"
                className="brand-wrapper"
                aria-label="Ir a inicio de Cafetería de Javi"
                onClick={(e) => handleSectionClick(e, '#inicio')}
            >
                <svg className="brand-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2,21H20V19H2M20,8H18V5H20M20,3H4V13A4,4 0,0,0 8,17H14A4,4 0,0,0 18,13V10H20A2,2 0,0,0 22,8V5C22,3.89 21.1,3 20,3Z" />
                </svg>
                <h1>Javi's Coffee</h1>
            </a>
            <nav aria-label="Navegación principal">
                <ul>
                    {NAV_ITEMS.map((item) => (
                        <li key={item.href}>
                            <a
                                href={`/${item.href}`}
                                className={
                                    currentPath === '/' && activeHash === item.href
                                        ? 'nav-active'
                                        : undefined
                                }
                                onClick={(e) => handleSectionClick(e, item.href)}
                            >
                                {item.name}
                            </a>
                        </li>
                    ))}
                    {user?.role === 'admin' && (
                        <li>
                            <a
                                href="/admin"
                                className={currentPath === '/admin' ? 'nav-active' : undefined}
                                onClick={handleAdminClick}
                            >
                                Panel Admin
                            </a>
                        </li>
                    )}
                    <li>
                        {user ? (
                            <div className="nav-user-session">
                                <span className="nav-user-info" title={user.correo}>
                                    <strong>{user.nombre}</strong> ({user.correo})
                                    <span className="nav-role-badge">
                                        {user.role === 'admin' ? 'Admin' : 'Usuario'}
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    id="logout-btn"
                                    className="nav-auth-btn nav-logout-btn"
                                    onClick={logout}
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                id="open-login-btn"
                                className="nav-auth-btn"
                                aria-haspopup="dialog"
                                aria-expanded={isLoginOpen}
                                onClick={openLogin}
                            >
                                Iniciar sesión
                            </button>
                        )}
                    </li>
                    <li>
                        <button
                            type="button"
                            id="open-cart-btn"
                            className="nav-cart-btn"
                            aria-label="Abrir carrito de compras"
                            aria-haspopup="dialog"
                            aria-expanded={isCartOpen}
                            onClick={openCart}
                        >
                            <svg className="cart-icon" viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
                                <path d="M17 18C15.9 18 15 18.9 15 20C15 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 18.1 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM7 18C5.9 18 5 18.9 5 20C5 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 8.1 18Z" />
                            </svg>
                            <span className="cart-badge" id="cart-nav-count">
                                {totalQuantity}
                            </span>
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    )
}

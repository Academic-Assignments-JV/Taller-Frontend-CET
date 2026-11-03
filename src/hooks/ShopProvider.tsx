import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
    showConfirmDialog,
    showSuccessAlert,
    showToast
} from '@utils/alerts'
import { getProducts, getTestUsers } from '@utils/api'
import type { AuthUser, CartItem, Product, ProductInput } from '@utils/api'
import { ShopContext } from './useShop'
import type { AppRoute } from './useShop'

interface ShopProviderProps {
    children: ReactNode
}

function normalizeText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
}

function resolveRoute(pathname: string): AppRoute {
    return pathname === '/admin' ? '/admin' : '/'
}

export function ShopProvider({ children }: ShopProviderProps) {
    const [requestedPath, setRequestedPath] = useState<AppRoute>(() =>
        resolveRoute(window.location.pathname)
    )
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const adminSectionRef = useRef<HTMLElement | null>(null)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false)

    const [cart, setCart] = useState<CartItem[]>([])
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false)

    const [detailProductId, setDetailProductId] = useState<string | number | null>(null)

    const currentPath: AppRoute =
        requestedPath === '/admin' && user?.role === 'admin' ? '/admin' : '/'

    const navigate = useCallback(
        (path: AppRoute, hash?: string) => {
            if (path === '/admin' && user?.role !== 'admin') {
                window.history.replaceState({}, '', '/')
                setRequestedPath('/')
                showToast('Acceso restringido: se requiere perfil de administrador', 'warning')
                return
            }

            const targetUrl = hash ? `${path}${hash}` : path
            if (window.location.pathname !== path || (hash && window.location.hash !== hash)) {
                window.history.pushState({}, '', targetUrl)
            }
            setRequestedPath(path)
            if (hash) {
                window.dispatchEvent(new HashChangeEvent('hashchange'))
                setTimeout(() => {
                    const element = document.querySelector(hash)
                    element?.scrollIntoView({ behavior: 'smooth' })
                }, 30)
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        },
        [user]
    )

    useEffect(() => {
        function handlePopState() {
            const target = resolveRoute(window.location.pathname)
            if (target === '/admin' && user?.role !== 'admin') {
                window.history.replaceState({}, '', '/')
                setRequestedPath('/')
                showToast('Acceso restringido: se requiere perfil de administrador', 'warning')
                return
            }
            setRequestedPath(target)
        }
        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [user])

    useEffect(() => {
        if (window.location.pathname === '/admin' && user?.role !== 'admin') {
            window.history.replaceState({}, '', '/')
            showToast('Acceso restringido: se requiere perfil de administrador', 'warning')
        }
    }, [user])

    const refreshProducts = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const fullCatalog = await getProducts('all')
            setAllProducts(fullCatalog)
        } catch (loadError) {
            console.error('No se pudo cargar el catálogo de productos:', loadError)
            setError('No se pudo cargar el menú. Intenta nuevamente.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        let isCurrent = true

        async function load() {
            setIsLoading(true)
            setError(null)
            try {
                const fullCatalog = await getProducts('all')
                if (isCurrent) {
                    setAllProducts(fullCatalog)
                }
            } catch (loadError) {
                console.error('No se pudo cargar el catálogo de productos:', loadError)
                if (isCurrent) {
                    setError('No se pudo cargar el menú. Intenta nuevamente.')
                }
            } finally {
                if (isCurrent) setIsLoading(false)
            }
        }

        void load()
        return () => {
            isCurrent = false
        }
    }, [])

    const products = useMemo(() => {
        const normalizedSearch = normalizeText(searchQuery)
        return allProducts.filter((product) => {
            const matchesCategory =
                selectedCategory === 'all' || product.categoria === selectedCategory
            const matchesSearch =
                !normalizedSearch ||
                normalizeText(product.nombre).includes(normalizedSearch)
            return matchesCategory && matchesSearch
        })
    }, [allProducts, selectedCategory, searchQuery])

    const addProductInMemory = useCallback((productInput: ProductInput): Product => {
        const createdProduct: Product = {
            ...productInput,
            id: `local-${Date.now()}`
        }
        setAllProducts((prev) => [createdProduct, ...prev])
        return createdProduct
    }, [])

    const updateProductInMemory = useCallback(
        (id: string | number, productInput: ProductInput) => {
            setAllProducts((prev) =>
                prev.map((product) =>
                    String(product.id) === String(id)
                        ? { ...productInput, id: product.id }
                        : product
                )
            )
            setCart((prevCart) =>
                prevCart.map((item) =>
                    String(item.product.id) === String(id)
                        ? { ...item, product: { ...productInput, id: item.product.id } }
                        : item
                )
            )
        },
        []
    )

    const selectProductForEdit = useCallback(
        (product: Product) => {
            setEditingProduct(product)
            if (currentPath !== '/admin') {
                navigate('/admin')
            } else {
                adminSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
            showToast(`Editando: ${product.nombre}`, 'info')
        },
        [currentPath, navigate]
    )

    const cancelProductEdit = useCallback(() => {
        setEditingProduct(null)
    }, [])

    const removeProduct = useCallback(
        async (id: string | number) => {
            const confirmed = await showConfirmDialog(
                '¿Eliminar producto?',
                '¿Seguro que deseas eliminar este producto del catálogo?',
                'Sí, eliminar'
            )
            if (!confirmed) return

            setAllProducts((prev) => prev.filter((item) => String(item.id) !== String(id)))
            setCart((prevCart) =>
                prevCart.filter((item) => String(item.product.id) !== String(id))
            )
            if (editingProduct && String(editingProduct.id) === String(id)) {
                setEditingProduct(null)
            }
            await showSuccessAlert(
                'Producto eliminado',
                'El producto fue eliminado correctamente del catálogo en memoria.'
            )
        },
        [editingProduct]
    )

    const openLogin = useCallback(() => setIsLoginOpen(true), [])
    const closeLogin = useCallback(() => setIsLoginOpen(false), [])

    const login = useCallback((correo: string, password: string): boolean => {
        const normalizedEmail = correo.trim().toLowerCase()
        const testUsers = getTestUsers()
        const matched = testUsers.find(
            (candidate) =>
                candidate.correo.toLowerCase() === normalizedEmail &&
                candidate.password === password
        )
        if (!matched) {
            return false
        }
        setUser({
            nombre: matched.nombre,
            correo: matched.correo,
            role: matched.role
        })
        setIsLoginOpen(false)
        showToast(`¡Bienvenido, ${matched.nombre}!`)
        return true
    }, [])

    const logout = useCallback(() => {
        setUser(null)
        setEditingProduct(null)
        setRequestedPath('/')
        if (window.location.pathname !== '/') {
            window.history.pushState({}, '', '/')
        }
        showToast('Sesión cerrada correctamente', 'info')
    }, [])

    const addToCart = useCallback((product: Product) => {
        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex(
                (item) => String(item.product.id) === String(product.id)
            )
            if (existingIndex >= 0) {
                return prevCart.map((item, idx) =>
                    idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prevCart, { product, quantity: 1 }]
        })
        showToast(`${product.nombre} agregado al carrito`)
    }, [])

    const removeFromCart = useCallback((productId: string | number) => {
        setCart((prevCart) =>
            prevCart.filter((item) => String(item.product.id) !== String(productId))
        )
        showToast('Producto eliminado del carrito', 'info')
    }, [])

    const changeCartQuantity = useCallback((productId: string | number, delta: number) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    String(item.product.id) === String(productId)
                        ? { ...item, quantity: item.quantity + delta }
                        : item
                )
                .filter((item) => item.quantity > 0)
        )
    }, [])

    const clearCart = useCallback(() => {
        setCart([])
    }, [])

    const confirmAndClearCart = useCallback(async () => {
        const confirmed = await showConfirmDialog(
            '¿Vaciar carrito?',
            'Se eliminarán todos los productos seleccionados en tu pedido.',
            'Sí, vaciar'
        )
        if (!confirmed) return
        setCart([])
        showToast('Carrito vaciado', 'info')
    }, [])

    const openCart = useCallback(() => setIsCartOpen(true), [])
    const closeCart = useCallback(() => setIsCartOpen(false), [])

    const openProductDetail = useCallback((id: string | number) => {
        setDetailProductId(id)
    }, [])

    const closeProductDetail = useCallback(() => {
        setDetailProductId(null)
    }, [])

    const totalQuantity = useMemo(
        () => cart.reduce((sum, item) => sum + item.quantity, 0),
        [cart]
    )

    const totalPrice = useMemo(
        () => cart.reduce((sum, item) => sum + item.product.precio * item.quantity, 0),
        [cart]
    )

    const value = useMemo(
        () => ({
            currentPath,
            navigate,
            products,
            allProducts,
            selectedCategory,
            searchQuery,
            isLoading,
            error,
            setSelectedCategory,
            setSearchQuery,
            refreshProducts,
            adminSectionRef,
            editingProduct,
            addProductInMemory,
            updateProductInMemory,
            selectProductForEdit,
            cancelProductEdit,
            removeProduct,
            user,
            isLoginOpen,
            openLogin,
            closeLogin,
            login,
            logout,
            cart,
            totalQuantity,
            totalPrice,
            isCartOpen,
            openCart,
            closeCart,
            addToCart,
            removeFromCart,
            changeCartQuantity,
            clearCart,
            confirmAndClearCart,
            detailProductId,
            openProductDetail,
            closeProductDetail
        }),
        [
            currentPath,
            navigate,
            products,
            allProducts,
            selectedCategory,
            searchQuery,
            isLoading,
            error,
            refreshProducts,
            editingProduct,
            addProductInMemory,
            updateProductInMemory,
            selectProductForEdit,
            cancelProductEdit,
            removeProduct,
            user,
            isLoginOpen,
            openLogin,
            closeLogin,
            login,
            logout,
            cart,
            totalQuantity,
            totalPrice,
            isCartOpen,
            openCart,
            closeCart,
            addToCart,
            removeFromCart,
            changeCartQuantity,
            clearCart,
            confirmAndClearCart,
            detailProductId,
            openProductDetail,
            closeProductDetail
        ]
    )

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

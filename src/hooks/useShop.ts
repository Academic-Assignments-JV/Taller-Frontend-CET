import { createContext, useContext } from 'react'
import type { RefObject } from 'react'
import type { AuthUser, CartItem, Product, ProductInput } from '@utils/api'

export type AppRoute = '/' | '/admin'

export interface ShopContextValue {
    // Routing (SPA)
    currentPath: AppRoute
    navigate: (path: AppRoute, hash?: string) => void

    // Catalog & filtering
    products: Product[]
    allProducts: Product[]
    selectedCategory: string
    searchQuery: string
    isLoading: boolean
    error: string | null
    setSelectedCategory: (category: string) => void
    setSearchQuery: (query: string) => void
    refreshProducts: () => Promise<void>

    // Product Administration (In-memory state)
    adminSectionRef: RefObject<HTMLElement | null>
    editingProduct: Product | null
    addProductInMemory: (productInput: ProductInput) => Product
    updateProductInMemory: (id: string | number, productInput: ProductInput) => void
    selectProductForEdit: (product: Product) => void
    cancelProductEdit: () => void
    removeProduct: (id: string | number) => Promise<void>

    // Simulated Authentication (In-memory context)
    user: AuthUser | null
    isLoginOpen: boolean
    openLogin: () => void
    closeLogin: () => void
    login: (correo: string, password: string) => boolean
    logout: () => void

    // Shopping Cart & Cart Modal
    cart: CartItem[]
    totalQuantity: number
    totalPrice: number
    isCartOpen: boolean
    openCart: () => void
    closeCart: () => void
    addToCart: (product: Product) => void
    removeFromCart: (productId: string | number) => void
    changeCartQuantity: (productId: string | number, delta: number) => void
    clearCart: () => void
    confirmAndClearCart: () => Promise<void>

    // Product Detail Modal
    detailProductId: string | number | null
    openProductDetail: (id: string | number) => void
    closeProductDetail: () => void
}

export const ShopContext = createContext<ShopContextValue | null>(null)

export function useShop(): ShopContextValue {
    const context = useContext(ShopContext)
    if (!context) {
        throw new Error('useShop debe utilizarse dentro de un ShopProvider')
    }
    return context
}

import { createContext, useContext } from 'react'
import type { RefObject } from 'react'
import type { CartItem, Product } from '@utils/api'

export interface ShopContextValue {
    // Catalog & filtering
    products: Product[]
    allProducts: Product[]
    selectedCategory: string
    isLoading: boolean
    error: string | null
    setSelectedCategory: (category: string) => void
    refreshProducts: () => Promise<void>

    // Product Administration (CRUD)
    adminSectionRef: RefObject<HTMLElement | null>
    editingProduct: Product | null
    selectProductForEdit: (product: Product) => void
    cancelProductEdit: () => void
    removeProduct: (id: string | number) => Promise<void>

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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
    showConfirmDialog,
    showErrorAlert,
    showSuccessAlert,
    showToast
} from '@utils/alerts'
import { deleteProduct, getProducts } from '@utils/api'
import type { CartItem, Product } from '@utils/api'
import { ShopContext } from './useShop'

interface ShopProviderProps {
    children: ReactNode
}

export function ShopProvider({ children }: ShopProviderProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const adminSectionRef = useRef<HTMLElement | null>(null)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

    const [cart, setCart] = useState<CartItem[]>([])
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false)

    const [detailProductId, setDetailProductId] = useState<string | number | null>(null)

    const refreshProducts = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const [fullCatalog, categoryCatalog] = await Promise.all([
                getProducts('all'),
                selectedCategory === 'all' ? Promise.resolve(null) : getProducts(selectedCategory)
            ])
            setAllProducts(fullCatalog)
            setProducts(categoryCatalog ?? fullCatalog)
        } catch (loadError) {
            console.error('No se pudo cargar el catálogo de productos:', loadError)
            setError(
                selectedCategory === 'all'
                    ? 'No se pudo cargar el menú. Intenta nuevamente.'
                    : 'No se pudo cargar esta categoría.'
            )
        } finally {
            setIsLoading(false)
        }
    }, [selectedCategory])

    useEffect(() => {
        let isCurrent = true

        async function load() {
            setIsLoading(true)
            setError(null)
            try {
                const [fullCatalog, categoryCatalog] = await Promise.all([
                    getProducts('all'),
                    selectedCategory === 'all'
                        ? Promise.resolve(null)
                        : getProducts(selectedCategory)
                ])
                if (isCurrent) {
                    setAllProducts(fullCatalog)
                    setProducts(categoryCatalog ?? fullCatalog)
                }
            } catch (loadError) {
                console.error('No se pudo cargar el catálogo de productos:', loadError)
                if (isCurrent) {
                    setError(
                        selectedCategory === 'all'
                            ? 'No se pudo cargar el menú. Intenta nuevamente.'
                            : 'No se pudo cargar esta categoría.'
                    )
                }
            } finally {
                if (isCurrent) setIsLoading(false)
            }
        }

        void load()
        return () => {
            isCurrent = false
        }
    }, [selectedCategory])

    const selectProductForEdit = useCallback((product: Product) => {
        setEditingProduct(product)
        adminSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
        showToast(`Editando: ${product.nombre}`, 'info')
    }, [])

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

            try {
                await deleteProduct(id)
                if (editingProduct && String(editingProduct.id) === String(id)) {
                    setEditingProduct(null)
                }
                await refreshProducts()
                await showSuccessAlert(
                    'Producto eliminado',
                    'El producto fue eliminado correctamente del catálogo.'
                )
            } catch (deleteError) {
                console.error('No se pudo eliminar el producto:', deleteError)
                await showErrorAlert(
                    'Error al eliminar',
                    'No se pudo eliminar el producto. Intenta nuevamente.'
                )
            }
        },
        [editingProduct, refreshProducts]
    )

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
            products,
            allProducts,
            selectedCategory,
            isLoading,
            error,
            setSelectedCategory,
            refreshProducts,
            adminSectionRef,
            editingProduct,
            selectProductForEdit,
            cancelProductEdit,
            removeProduct,
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
            products,
            allProducts,
            selectedCategory,
            isLoading,
            error,
            refreshProducts,
            editingProduct,
            selectProductForEdit,
            cancelProductEdit,
            removeProduct,
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

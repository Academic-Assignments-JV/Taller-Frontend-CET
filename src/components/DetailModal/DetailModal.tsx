import { useEffect, useRef, useState } from 'react'
import { useShop } from '@/hooks'
import { showErrorAlert } from '@utils/alerts'
import { formatCurrency, getProductById } from '@utils/api'
import type { Product } from '@utils/api'
import './DetailModal.css'

interface LoadedDetailState {
    id: string | number
    product: Product | null
    error: string | null
}

export default function DetailModal() {
    const { detailProductId, closeProductDetail } = useShop()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [loadedDetail, setLoadedDetail] = useState<LoadedDetailState | null>(null)

    const isOpen = detailProductId !== null
    const isLoading = isOpen && loadedDetail?.id !== detailProductId
    const product = isOpen && loadedDetail?.id === detailProductId ? loadedDetail.product : null
    const error = isOpen && loadedDetail?.id === detailProductId ? loadedDetail.error : null

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        if (isOpen && !dialog.open) {
            dialog.showModal()
        } else if (!isOpen && dialog.open) {
            dialog.close()
        }
    }, [isOpen])

    useEffect(() => {
        if (detailProductId === null) return

        let isCurrent = true
        const currentId = detailProductId

        async function fetchDetail() {
            try {
                const fetchedProduct = await getProductById(currentId)
                if (isCurrent) {
                    setLoadedDetail({ id: currentId, product: fetchedProduct, error: null })
                }
            } catch (detailError) {
                console.error('No se pudo cargar el detalle:', detailError)
                if (isCurrent) {
                    const errorMessage = 'No se pudo cargar el detalle del producto.'
                    setLoadedDetail({
                        id: currentId,
                        product: null,
                        error: errorMessage
                    })
                    void showErrorAlert('Error al cargar detalle', errorMessage)
                }
            }
        }

        void fetchDetail()
        return () => {
            isCurrent = false
        }
    }, [detailProductId])

    return (
        <dialog
            ref={dialogRef}
            id="product-detail-modal"
            className="cart-modal"
            aria-labelledby="product-detail-title"
            onClose={closeProductDetail}
        >
            <div className="modal-dialog-content">
                <header className="modal-header">
                    <h2 id="product-detail-title">Detalle del producto</h2>
                    <button
                        type="button"
                        id="close-product-detail"
                        className="modal-close-btn"
                        aria-label="Cerrar detalle"
                        onClick={closeProductDetail}
                    >
                        &times;
                    </button>
                </header>
                <div id="product-detail-content" className="product-detail-content">
                    {isLoading && <p className="cart-empty">Cargando...</p>}
                    {!isLoading && error && <p className="status-error">{error}</p>}
                    {!isLoading && product && (
                        <>
                            <img src={product.imagen} alt={product.nombre} />
                            <h3>{product.nombre}</h3>
                            <p>{product.descripcion}</p>
                            <strong>{formatCurrency(product.precio)}</strong>
                        </>
                    )}
                </div>
            </div>
        </dialog>
    )
}
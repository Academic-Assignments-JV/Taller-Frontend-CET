import { useShop } from '@/hooks'
import { Button } from '@components/Button'
import { CATEGORY_LABELS, formatCurrency } from '@utils/api'
import type { Product } from '@utils/api'
import './Card.css'

interface CardProps {
    product: Product
}

export default function Card({ product }: CardProps) {
    const { addToCart, openProductDetail, selectProductForEdit, removeProduct } = useShop()

    return (
        <article className="menu-card" data-category={product.categoria}>
            <figure className="card-media">
                <span className="category-tag">
                    {CATEGORY_LABELS[product.categoria] || 'Especialidad'}
                </span>
                <img
                    src={product.imagen}
                    alt={product.nombre}
                    width="250"
                    height="190"
                    loading="lazy"
                />
            </figure>
            <div className="card-body">
                <header className="card-header">
                    <h3>{product.nombre}</h3>
                    <span className="price-pill">{formatCurrency(product.precio)}</span>
                </header>
                <p>{product.descripcion}</p>
                <div className="card-footer">
                    <Button
                        variant="secondary"
                        className="btn-detail"
                        onClick={() => openProductDetail(product.id)}
                    >
                        Ver detalle
                    </Button>
                    <Button variant="add-cart" onClick={() => addToCart(product)}>
                        Agregar
                    </Button>
                </div>
                <div className="admin-card-actions">
                    <button
                        type="button"
                        className="btn-edit-product"
                        onClick={() => selectProductForEdit(product)}
                    >
                        Editar
                    </button>
                    <button
                        type="button"
                        className="btn-delete-product"
                        onClick={() => void removeProduct(product.id)}
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </article>
    )
}
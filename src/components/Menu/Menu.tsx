import { useShop } from '@/hooks'
import { Card } from '@components/Card'
import { PRODUCT_FILTERS } from '@utils/api'
import './Menu.css'

export default function Menu() {
    const { products, selectedCategory, isLoading, error, setSelectedCategory } = useShop()

    return (
        <section id="menu">
            <h2>Nuestro Menú</h2>
            <div className="filter-bar" role="group" aria-label="Filtrar productos por categoría">
                {PRODUCT_FILTERS.map((category) => (
                    <button
                        key={category.id}
                        type="button"
                        className={`filter-btn${selectedCategory === category.id ? ' active' : ''}`}
                        aria-pressed={selectedCategory === category.id}
                        disabled={isLoading}
                        onClick={() => setSelectedCategory(category.id)}
                    >
                        {category.label}
                    </button>
                ))}
            </div>

            <div id="menu-grid" className="menu-grid" aria-live="polite">
                {isLoading && <p className="cart-empty">Cargando...</p>}
                {!isLoading && error && <p className="cart-empty status-error">{error}</p>}
                {!isLoading && !error && !products.length && (
                    <p className="cart-empty">No se encontraron productos en esta categoría.</p>
                )}
                {!isLoading &&
                    !error &&
                    products.map((product) => <Card key={product.id} product={product} />)}
            </div>
        </section>
    )
}
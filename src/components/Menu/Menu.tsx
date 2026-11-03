import { useShop } from '@/hooks'
import { Card } from '@components/Card'
import { PRODUCT_FILTERS } from '@utils/api'
import './Menu.css'

export default function Menu() {
    const {
        products,
        selectedCategory,
        searchQuery,
        isLoading,
        error,
        setSelectedCategory,
        setSearchQuery
    } = useShop()

    return (
        <section id="menu">
            <h2>Nuestro Menú</h2>
            <div className="menu-controls">
                <div className="search-bar">
                    <label htmlFor="menu-search-input" className="sr-only">
                        Buscar producto por nombre
                    </label>
                    <input
                        type="search"
                        id="menu-search-input"
                        className="search-input"
                        placeholder="Buscar producto por nombre (ej. Latte, Croissant...)"
                        value={searchQuery}
                        disabled={isLoading}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="search-clear-btn"
                            aria-label="Limpiar búsqueda"
                            onClick={() => setSearchQuery('')}
                        >
                            &times;
                        </button>
                    )}
                </div>

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
            </div>

            <div id="menu-grid" className="menu-grid" aria-live="polite">
                {isLoading && <p className="cart-empty">Cargando...</p>}
                {!isLoading && error && <p className="cart-empty status-error">{error}</p>}
                {!isLoading && !error && !products.length && (
                    <p className="cart-empty">
                        No se encontraron productos que coincidan con tu búsqueda o categoría.
                    </p>
                )}
                {!isLoading &&
                    !error &&
                    products.map((product) => <Card key={product.id} product={product} />)}
            </div>
        </section>
    )
}
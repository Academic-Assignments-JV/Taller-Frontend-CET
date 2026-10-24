import { Fragment, useMemo } from 'react'
import { useShop } from '@/hooks'
import { formatCurrency } from '@utils/api'
import type { Product } from '@utils/api'
import './Prices.css'

const PRICE_SECTIONS = [
    { id: 'hot-coffee', title: 'Cafés Calientes y Especialidades' },
    { id: 'cold-coffee', title: 'Bebidas Frías' },
    { id: 'food', title: 'Comidas y Desayunos' },
    { id: 'pastry', title: 'Repostería' }
] as const

export default function Prices() {
    const { allProducts, isLoading, error } = useShop()

    const groupedSections = useMemo(() => {
        const knownCategoryIds = new Set<string>(PRICE_SECTIONS.map((section) => section.id))
        const sections: Array<{ id: string; title: string; items: Product[] }> = PRICE_SECTIONS.map(
            (section) => ({
                id: section.id,
                title: section.title,
                items: allProducts.filter((product) => product.categoria === section.id)
            })
        ).filter((section) => section.items.length > 0)

        const otherItems = allProducts.filter((product) => !knownCategoryIds.has(product.categoria))
        if (otherItems.length > 0) {
            sections.push({
                id: 'other',
                title: 'Otras Especialidades',
                items: otherItems
            })
        }

        return sections
    }, [allProducts])

    return (
        <section id="precios">
            <h2>Lista de Precios</h2>
            <div className="table-container" aria-live="polite">
                {isLoading && !allProducts.length && <p className="cart-empty">Cargando lista de precios...</p>}
                {!isLoading && error && !allProducts.length && (
                    <p className="cart-empty status-error">{error}</p>
                )}
                {!isLoading && !error && !allProducts.length && (
                    <p className="cart-empty">No hay productos registrados en la lista de precios.</p>
                )}
                {allProducts.length > 0 && (
                    <table>
                        <caption>Carta completa de productos y precios de la cafetería</caption>
                        <thead>
                            <tr>
                                <th scope="col">Producto</th>
                                <th scope="col">Descripción</th>
                                <th scope="col">Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedSections.map((section) => (
                                <Fragment key={section.id}>
                                    <tr className="category-divider">
                                        <th colSpan={3} scope="colgroup">
                                            {section.title}
                                        </th>
                                    </tr>
                                    {section.items.map((product) => (
                                        <tr key={product.id}>
                                            <th scope="row">{product.nombre}</th>
                                            <td>{product.descripcion}</td>
                                            <td className="price-cell">
                                                {formatCurrency(product.precio)}
                                            </td>
                                        </tr>
                                    ))}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    )
}
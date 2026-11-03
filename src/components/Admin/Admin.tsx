import { useShop } from '@/hooks'
import { Button } from '@components/Button'
import { CATEGORY_LABELS, formatCurrency } from '@utils/api'
import ProductForm from './ProductForm'
import './Admin.css'

export default function Admin() {
    const {
        editingProduct,
        adminSectionRef,
        allProducts,
        selectProductForEdit,
        removeProduct,
        navigate
    } = useShop()

    return (
        <section id="administracion" ref={adminSectionRef}>
            <div className="admin-page-header">
                <h2>Administración de Productos</h2>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/', '#menu')}
                >
                    ← Volver al Catálogo
                </Button>
            </div>
            <p className="admin-subtitle">
                Agrega o edita productos en memoria. Los cambios se reflejan inmediatamente en el
                catálogo principal y se reinician al recargar el navegador.
            </p>
            <ProductForm key={editingProduct?.id ?? 'new'} editingProduct={editingProduct} />

            <div className="admin-catalog-summary">
                <h3>Productos actuales en memoria ({allProducts.length})</h3>
                <div className="table-container">
                    <table>
                        <caption>Listado de productos activos en la sesión</caption>
                        <thead>
                            <tr>
                                <th scope="col">Producto</th>
                                <th scope="col">Categoría</th>
                                <th scope="col">Precio</th>
                                <th scope="col">Stock</th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allProducts.map((product) => (
                                <tr key={product.id}>
                                    <th scope="row">{product.nombre}</th>
                                    <td>
                                        {CATEGORY_LABELS[product.categoria] || product.categoria}
                                    </td>
                                    <td>{formatCurrency(product.precio)}</td>
                                    <td>{product.stock}</td>
                                    <td>
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}

import { useShop } from '@/hooks'
import ProductForm from './ProductForm'
import './Admin.css'

export default function Admin() {
    const { editingProduct, adminSectionRef } = useShop()

    return (
        <section id="administracion" ref={adminSectionRef}>
            <h2>Administración de Productos</h2>
            <ProductForm key={editingProduct?.id ?? 'new'} editingProduct={editingProduct} />
        </section>
    )
}

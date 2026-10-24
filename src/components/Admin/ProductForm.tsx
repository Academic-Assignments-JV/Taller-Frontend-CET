import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useShop } from '@/hooks'
import { Button } from '@components/Button'
import { showErrorAlert, showSuccessAlert, showToast } from '@utils/alerts'
import { createProduct, updateProduct } from '@utils/api'
import type { Product, ProductInput } from '@utils/api'

interface ProductFormProps {
    editingProduct: Product | null
}

type ProductField = 'nombre' | 'categoria' | 'precio' | 'imagen' | 'descripcion'

const IMAGE_PATH_REGEX = /^(\.?\/|https?:\/\/|img\/).+/i

export default function ProductForm({ editingProduct }: ProductFormProps) {
    const { cancelProductEdit, refreshProducts } = useShop()

    const [nombre, setNombre] = useState(editingProduct?.nombre ?? '')
    const [categoria, setCategoria] = useState(editingProduct?.categoria ?? 'hot-coffee')
    const [precio, setPrecio] = useState(editingProduct ? String(editingProduct.precio) : '')
    const [imagen, setImagen] = useState(editingProduct?.imagen ?? '')
    const [descripcion, setDescripcion] = useState(editingProduct?.descripcion ?? '')
    const [touched, setTouched] = useState<Partial<Record<ProductField, boolean>>>({})
    const [submitAttempted, setSubmitAttempted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const nombreRef = useRef<HTMLInputElement>(null)
    const categoriaRef = useRef<HTMLSelectElement>(null)
    const precioRef = useRef<HTMLInputElement>(null)
    const imagenRef = useRef<HTMLInputElement>(null)
    const descripcionRef = useRef<HTMLTextAreaElement>(null)

    const trimmedNombre = nombre.trim()
    const trimmedPrecio = precio.trim()
    const parsedPrecio = Number(trimmedPrecio)
    const trimmedImagen = imagen.trim()
    const trimmedDescripcion = descripcion.trim()

    const hasMissingRequired =
        !trimmedNombre || !categoria || !trimmedPrecio || !trimmedImagen || !trimmedDescripcion

    const errors: Record<ProductField, string> = {
        nombre:
            trimmedNombre && trimmedNombre.length < 3
                ? 'El nombre debe tener al menos 3 caracteres.'
                : '',
        categoria: '',
        precio:
            trimmedPrecio && (Number.isNaN(parsedPrecio) || parsedPrecio <= 0)
                ? 'Ingresa un precio válido mayor a $0.'
                : '',
        imagen:
            trimmedImagen && !IMAGE_PATH_REGEX.test(trimmedImagen)
                ? 'Ingresa una ruta válida (ej. ./img/espresso.svg) o URL (https://...).'
                : '',
        descripcion:
            trimmedDescripcion && trimmedDescripcion.length < 10
                ? 'La descripción debe tener al menos 10 caracteres.'
                : ''
    }

    function markTouched(field: ProductField) {
        setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }))
    }

    function getFieldClass(field: ProductField, hasValue: boolean): string {
        if (!hasValue || !touched[field]) return ''
        return errors[field] ? 'input-invalid' : 'input-valid'
    }

    function isFieldValid(field: ProductField, hasValue: boolean): boolean {
        return Boolean(hasValue && touched[field] && !errors[field])
    }

    function focusField(field: ProductField) {
        const refs: Record<ProductField, HTMLElement | null> = {
            nombre: nombreRef.current,
            categoria: categoriaRef.current,
            precio: precioRef.current,
            imagen: imagenRef.current,
            descripcion: descripcionRef.current
        }
        refs[field]?.focus()
    }

    function resetFields() {
        setNombre('')
        setCategoria('hot-coffee')
        setPrecio('')
        setImagen('')
        setDescripcion('')
        setTouched({})
        setSubmitAttempted(false)
    }

    function handleCancel() {
        resetFields()
        cancelProductEdit()
        showToast('Edición cancelada', 'info')
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setSubmitAttempted(true)

        setTouched({
            nombre: Boolean(trimmedNombre),
            categoria: Boolean(categoria),
            precio: Boolean(trimmedPrecio),
            imagen: Boolean(trimmedImagen),
            descripcion: Boolean(trimmedDescripcion)
        })

        const firstIncompleteOrInvalid: ProductField | undefined =
            !trimmedNombre || errors.nombre
                ? 'nombre'
                : !categoria || errors.categoria
                  ? 'categoria'
                  : !trimmedPrecio || errors.precio
                    ? 'precio'
                    : !trimmedImagen || errors.imagen
                      ? 'imagen'
                      : !trimmedDescripcion || errors.descripcion
                        ? 'descripcion'
                        : undefined

        if (firstIncompleteOrInvalid) {
            focusField(firstIncompleteOrInvalid)
            showToast('Completa los campos obligatorios (*) correctamente', 'warning')
            return
        }

        const productInput: ProductInput = {
            nombre: trimmedNombre,
            categoria,
            precio: parsedPrecio,
            imagen: trimmedImagen,
            descripcion: trimmedDescripcion
        }

        setIsSubmitting(true)
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, productInput)
                cancelProductEdit()
                await refreshProducts()
                await showSuccessAlert(
                    'Producto actualizado',
                    `Los cambios en "${productInput.nombre}" se guardaron correctamente.`
                )
            } else {
                await createProduct(productInput)
                resetFields()
                await refreshProducts()
                await showSuccessAlert(
                    'Producto creado',
                    `"${productInput.nombre}" fue agregado al catálogo.`
                )
            }
        } catch (saveError) {
            console.error('No se pudo guardar el producto:', saveError)
            await showErrorAlert(
                'Error al guardar',
                'No se pudo guardar el producto en el servidor. Intenta nuevamente.'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            id="product-form"
            className="product-admin-form"
            noValidate
            onSubmit={(e) => void handleSubmit(e)}
        >
            <input type="hidden" id="product-id" value={editingProduct?.id ?? ''} />
            <div className="form-group">
                <label htmlFor="product-name">
                    <span>
                        Nombre<span className="required-mark">*</span>
                    </span>
                    {isFieldValid('nombre', Boolean(trimmedNombre)) && (
                        <span className="field-status-badge is-valid" aria-hidden="true">
                            ✓ Válido
                        </span>
                    )}
                </label>
                <input
                    ref={nombreRef}
                    type="text"
                    id="product-name"
                    name="nombre"
                    placeholder="Ej. Café Latte Vainilla"
                    minLength={3}
                    value={nombre}
                    className={getFieldClass('nombre', Boolean(trimmedNombre))}
                    aria-invalid={touched.nombre && Boolean(errors.nombre) ? 'true' : undefined}
                    aria-errormessage={
                        touched.nombre && errors.nombre ? 'product-name-error' : undefined
                    }
                    onChange={(e) => setNombre(e.target.value)}
                    onBlur={() => {
                        if (trimmedNombre) markTouched('nombre')
                    }}
                    disabled={isSubmitting}
                    required
                />
                {touched.nombre && errors.nombre && (
                    <div id="product-name-error" className="field-error-msg" role="alert">
                        <span aria-hidden="true">⚠</span> {errors.nombre}
                    </div>
                )}
            </div>
            <div className="form-group">
                <label htmlFor="product-category">
                    <span>
                        Categoría<span className="required-mark">*</span>
                    </span>
                    {isFieldValid('categoria', Boolean(categoria)) && (
                        <span className="field-status-badge is-valid" aria-hidden="true">
                            ✓ Válido
                        </span>
                    )}
                </label>
                <select
                    ref={categoriaRef}
                    id="product-category"
                    name="categoria"
                    value={categoria}
                    className={getFieldClass('categoria', Boolean(categoria))}
                    onChange={(e) => {
                        setCategoria(e.target.value)
                        markTouched('categoria')
                    }}
                    onBlur={() => markTouched('categoria')}
                    disabled={isSubmitting}
                    required
                >
                    <option value="hot-coffee">Cafés Calientes</option>
                    <option value="cold-coffee">Bebidas Frías</option>
                    <option value="food">Comidas y Desayunos</option>
                    <option value="pastry">Repostería</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="product-price">
                    <span>
                        Precio (COP)<span className="required-mark">*</span>
                    </span>
                    {isFieldValid('precio', Boolean(trimmedPrecio)) && (
                        <span className="field-status-badge is-valid" aria-hidden="true">
                            ✓ Válido
                        </span>
                    )}
                </label>
                <input
                    ref={precioRef}
                    type="number"
                    id="product-price"
                    name="precio"
                    min="1"
                    step="1"
                    placeholder="Ej. 6500"
                    value={precio}
                    className={getFieldClass('precio', Boolean(trimmedPrecio))}
                    aria-invalid={touched.precio && Boolean(errors.precio) ? 'true' : undefined}
                    aria-errormessage={
                        touched.precio && errors.precio ? 'product-price-error' : undefined
                    }
                    onChange={(e) => setPrecio(e.target.value)}
                    onBlur={() => {
                        if (trimmedPrecio) markTouched('precio')
                    }}
                    disabled={isSubmitting}
                    required
                />
                {touched.precio && errors.precio && (
                    <div id="product-price-error" className="field-error-msg" role="alert">
                        <span aria-hidden="true">⚠</span> {errors.precio}
                    </div>
                )}
            </div>
            <div className="form-group">
                <label htmlFor="product-image">
                    <span>
                        Imagen<span className="required-mark">*</span>
                    </span>
                    {isFieldValid('imagen', Boolean(trimmedImagen)) && (
                        <span className="field-status-badge is-valid" aria-hidden="true">
                            ✓ Válido
                        </span>
                    )}
                </label>
                <span id="product-image-hint" className="field-hint">
                    Ruta local (./img/...) o URL externa (https://...)
                </span>
                <input
                    ref={imagenRef}
                    type="text"
                    id="product-image"
                    name="imagen"
                    placeholder="./img/espresso.svg"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={imagen}
                    className={getFieldClass('imagen', Boolean(trimmedImagen))}
                    aria-describedby="product-image-hint"
                    aria-invalid={touched.imagen && Boolean(errors.imagen) ? 'true' : undefined}
                    aria-errormessage={
                        touched.imagen && errors.imagen ? 'product-image-error' : undefined
                    }
                    onChange={(e) => setImagen(e.target.value)}
                    onBlur={() => {
                        if (trimmedImagen) markTouched('imagen')
                    }}
                    disabled={isSubmitting}
                    required
                />
                {touched.imagen && errors.imagen && (
                    <div id="product-image-error" className="field-error-msg" role="alert">
                        <span aria-hidden="true">⚠</span> {errors.imagen}
                    </div>
                )}
            </div>
            <div className="form-group">
                <label htmlFor="product-description">
                    <span>
                        Descripción<span className="required-mark">*</span>
                    </span>
                    {isFieldValid('descripcion', Boolean(trimmedDescripcion)) && (
                        <span className="field-status-badge is-valid" aria-hidden="true">
                            ✓ Válido
                        </span>
                    )}
                </label>
                <textarea
                    ref={descripcionRef}
                    id="product-description"
                    name="descripcion"
                    rows={2}
                    minLength={10}
                    placeholder="Describe los ingredientes y notas del producto (mínimo 10 caracteres)..."
                    value={descripcion}
                    className={getFieldClass('descripcion', Boolean(trimmedDescripcion))}
                    aria-invalid={
                        touched.descripcion && Boolean(errors.descripcion) ? 'true' : undefined
                    }
                    aria-errormessage={
                        touched.descripcion && errors.descripcion
                            ? 'product-description-error'
                            : undefined
                    }
                    onChange={(e) => setDescripcion(e.target.value)}
                    onBlur={() => {
                        if (trimmedDescripcion) markTouched('descripcion')
                    }}
                    disabled={isSubmitting}
                    required
                />
                {touched.descripcion && errors.descripcion && (
                    <div id="product-description-error" className="field-error-msg" role="alert">
                        <span aria-hidden="true">⚠</span> {errors.descripcion}
                    </div>
                )}
            </div>
            {submitAttempted && hasMissingRequired && (
                <p className="form-required-notice" role="alert">
                    Completa todos los campos obligatorios marcados con (*) para continuar.
                </p>
            )}
            <div className="form-actions">
                <Button
                    type="submit"
                    variant="primary"
                    id="product-submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? 'Guardando...'
                        : editingProduct
                          ? 'Guardar cambios'
                          : 'Crear producto'}
                </Button>
                {editingProduct && (
                    <Button
                        type="button"
                        variant="secondary"
                        id="product-cancel"
                        disabled={isSubmitting}
                        onClick={handleCancel}
                    >
                        Cancelar edición
                    </Button>
                )}
            </div>
        </form>
    )
}

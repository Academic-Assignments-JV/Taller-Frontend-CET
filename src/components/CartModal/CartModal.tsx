import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useShop } from '@/hooks'
import { Button } from '@components/Button'
import { showErrorAlert, showSuccessAlert, showToast } from '@utils/alerts'
import { createOrder, formatCurrency } from '@utils/api'
import type { Order } from '@utils/api'
import './CartModal.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type CheckoutField = 'clientName' | 'clientEmail'

export default function CartModal() {
    const {
        cart,
        totalQuantity,
        totalPrice,
        isCartOpen,
        closeCart,
        changeCartQuantity,
        removeFromCart,
        clearCart,
        confirmAndClearCart
    } = useShop()

    const dialogRef = useRef<HTMLDialogElement>(null)
    const clientNameRef = useRef<HTMLInputElement>(null)
    const clientEmailRef = useRef<HTMLInputElement>(null)
    const [clientName, setClientName] = useState('')
    const [clientEmail, setClientEmail] = useState('')
    const [touched, setTouched] = useState<Partial<Record<CheckoutField, boolean>>>({})
    const [submitAttempted, setSubmitAttempted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const trimmedName = clientName.trim()
    const trimmedEmail = clientEmail.trim()

    const hasMissingRequired = !trimmedName || !trimmedEmail

    const errors: Record<CheckoutField, string> = {
        clientName:
            trimmedName && trimmedName.length < 3
                ? 'El nombre debe tener al menos 3 caracteres.'
                : '',
        clientEmail:
            trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)
                ? 'Ingresa un correo electrónico válido (ej. cliente@correo.com).'
                : ''
    }

    function markTouched(field: CheckoutField) {
        setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }))
    }

    function getFieldClass(field: CheckoutField, hasValue: boolean): string {
        if (!hasValue || !touched[field]) return ''
        return errors[field] ? 'input-invalid' : 'input-valid'
    }

    function isFieldValid(field: CheckoutField, hasValue: boolean): boolean {
        return Boolean(hasValue && touched[field] && !errors[field])
    }

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        if (isCartOpen && !dialog.open) {
            dialog.showModal()
        } else if (!isCartOpen && dialog.open) {
            dialog.close()
        }
    }, [isCartOpen])

    async function handleCheckoutSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!cart.length) return
        setSubmitAttempted(true)

        setTouched({
            clientName: Boolean(trimmedName),
            clientEmail: Boolean(trimmedEmail)
        })

        const firstIncompleteOrInvalid: CheckoutField | undefined =
            !trimmedName || errors.clientName
                ? 'clientName'
                : !trimmedEmail || errors.clientEmail
                  ? 'clientEmail'
                  : undefined

        if (firstIncompleteOrInvalid) {
            const targetInput =
                firstIncompleteOrInvalid === 'clientName'
                    ? clientNameRef.current
                    : clientEmailRef.current
            targetInput?.focus()
            showToast('Completa los campos obligatorios (*) correctamente', 'warning')
            return
        }

        setIsSubmitting(true)

        const order: Order = {
            cliente: trimmedName,
            email: trimmedEmail,
            items: cart.map((item) => ({
                id: item.product.id,
                nombre: item.product.nombre,
                cantidad: item.quantity,
                precio: item.product.precio
            })),
            total: totalPrice,
            fecha: new Date().toISOString()
        }

        try {
            const createdOrder = await createOrder(order)
            clearCart()
            setClientName('')
            setClientEmail('')
            setTouched({})
            setSubmitAttempted(false)
            dialogRef.current?.close()
            closeCart()
            await showSuccessAlert(
                '¡Pedido registrado!',
                `Tu compra se procesó correctamente. Código de pedido: #${createdOrder.id}`
            )
        } catch (checkoutError) {
            console.error('No se pudo finalizar la compra:', checkoutError)
            await showErrorAlert(
                'No se pudo registrar el pedido',
                'Ocurrió un inconveniente al procesar tu compra. Intenta nuevamente.'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <dialog
            ref={dialogRef}
            id="cart-modal"
            className="cart-modal"
            aria-labelledby="cart-modal-title"
            onClose={closeCart}
        >
            <div className="modal-dialog-content">
                <header className="modal-header">
                    <h2 id="cart-modal-title">Carrito de Compras</h2>
                    <button
                        type="button"
                        id="close-cart-btn"
                        className="modal-close-btn"
                        aria-label="Cerrar carrito de compras"
                        onClick={closeCart}
                    >
                        &times;
                    </button>
                </header>
                <div className="cart-container">
                    {cart.length === 0 ? (
                        <div id="cart-empty-message" className="cart-empty">
                            <p>
                                Tu carrito está vacío. Explora nuestro menú y agrega tus productos
                                favoritos.
                            </p>
                        </div>
                    ) : (
                        <div id="cart-content" className="cart-content">
                            <div className="table-container cart-table-container">
                                <table className="cart-table">
                                    <caption>Artículos seleccionados en tu pedido</caption>
                                    <thead>
                                        <tr>
                                            <th scope="col">Producto</th>
                                            <th scope="col">Precio Unitario</th>
                                            <th scope="col">Cantidad</th>
                                            <th scope="col">Subtotal</th>
                                            <th scope="col">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="cart-items-body">
                                        {cart.map((item) => (
                                            <tr key={item.product.id}>
                                                <th scope="row">{item.product.nombre}</th>
                                                <td>{formatCurrency(item.product.precio)}</td>
                                                <td>
                                                    <div className="cart-qty-controls">
                                                        <button
                                                            type="button"
                                                            className="btn-minus"
                                                            aria-label={`Disminuir cantidad de ${item.product.nombre}`}
                                                            onClick={() =>
                                                                changeCartQuantity(
                                                                    item.product.id,
                                                                    -1
                                                                )
                                                            }
                                                        >
                                                            -
                                                        </button>
                                                        <span className="qty-number">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="btn-plus"
                                                            aria-label={`Aumentar cantidad de ${item.product.nombre}`}
                                                            onClick={() =>
                                                                changeCartQuantity(
                                                                    item.product.id,
                                                                    1
                                                                )
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <strong>
                                                        {formatCurrency(
                                                            item.product.precio * item.quantity
                                                        )}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn-remove-item"
                                                        onClick={() =>
                                                            removeFromCart(item.product.id)
                                                        }
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="cart-summary">
                                <div className="summary-details">
                                    <p>
                                        Total de productos:{' '}
                                        <strong id="cart-total-qty">{totalQuantity}</strong>
                                    </p>
                                    <p>
                                        Total a pagar:{' '}
                                        <strong id="cart-total-price" className="price-highlight">
                                            {formatCurrency(totalPrice)}
                                        </strong>
                                    </p>
                                </div>
                                <div className="cart-actions">
                                    <Button
                                        variant="secondary-danger"
                                        id="btn-clear-cart"
                                        onClick={() => void confirmAndClearCart()}
                                    >
                                        Vaciar Carrito
                                    </Button>
                                </div>
                            </div>
                            <form
                                id="checkout-form"
                                className="checkout-form"
                                noValidate
                                onSubmit={(e) => void handleCheckoutSubmit(e)}
                            >
                                <h3>Datos del cliente</h3>
                                <div className="form-group">
                                    <label htmlFor="checkout-client">
                                        <span>
                                            Nombre<span className="required-mark">*</span>
                                        </span>
                                        {isFieldValid('clientName', Boolean(trimmedName)) && (
                                            <span
                                                className="field-status-badge is-valid"
                                                aria-hidden="true"
                                            >
                                                ✓ Válido
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        ref={clientNameRef}
                                        type="text"
                                        id="checkout-client"
                                        name="cliente"
                                        placeholder="Tu nombre completo"
                                        autoComplete="name"
                                        minLength={3}
                                        value={clientName}
                                        className={getFieldClass('clientName', Boolean(trimmedName))}
                                        aria-invalid={
                                            touched.clientName && Boolean(errors.clientName)
                                                ? 'true'
                                                : undefined
                                        }
                                        aria-errormessage={
                                            touched.clientName && errors.clientName
                                                ? 'checkout-client-error'
                                                : undefined
                                        }
                                        onChange={(e) => setClientName(e.target.value)}
                                        onBlur={() => {
                                            if (trimmedName) markTouched('clientName')
                                        }}
                                        disabled={isSubmitting}
                                        required
                                    />
                                    {touched.clientName && errors.clientName && (
                                        <div
                                            id="checkout-client-error"
                                            className="field-error-msg"
                                            role="alert"
                                        >
                                            <span aria-hidden="true">⚠</span> {errors.clientName}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="checkout-email">
                                        <span>
                                            Correo electrónico<span className="required-mark">*</span>
                                        </span>
                                        {isFieldValid('clientEmail', Boolean(trimmedEmail)) && (
                                            <span
                                                className="field-status-badge is-valid"
                                                aria-hidden="true"
                                            >
                                                ✓ Válido
                                            </span>
                                        )}
                                    </label>
                                    <span id="checkout-email-hint" className="field-hint">
                                        Enviaremos el resumen de tu pedido a este correo
                                    </span>
                                    <input
                                        ref={clientEmailRef}
                                        type="email"
                                        id="checkout-email"
                                        name="email"
                                        placeholder="ejemplo@correo.com"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        value={clientEmail}
                                        className={getFieldClass(
                                            'clientEmail',
                                            Boolean(trimmedEmail)
                                        )}
                                        aria-describedby="checkout-email-hint"
                                        aria-invalid={
                                            touched.clientEmail && Boolean(errors.clientEmail)
                                                ? 'true'
                                                : undefined
                                        }
                                        aria-errormessage={
                                            touched.clientEmail && errors.clientEmail
                                                ? 'checkout-email-error'
                                                : undefined
                                        }
                                        onChange={(e) => setClientEmail(e.target.value)}
                                        onBlur={() => {
                                            if (trimmedEmail) markTouched('clientEmail')
                                        }}
                                        disabled={isSubmitting}
                                        required
                                    />
                                    {touched.clientEmail && errors.clientEmail && (
                                        <div
                                            id="checkout-email-error"
                                            className="field-error-msg"
                                            role="alert"
                                        >
                                            <span aria-hidden="true">⚠</span> {errors.clientEmail}
                                        </div>
                                    )}
                                </div>
                                {submitAttempted && hasMissingRequired && (
                                    <p className="form-required-notice" role="alert">
                                        Completa todos los campos obligatorios marcados con (*) para
                                        continuar.
                                    </p>
                                )}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    id="btn-checkout"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Procesando compra...' : 'Finalizar compra'}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </dialog>
    )
}

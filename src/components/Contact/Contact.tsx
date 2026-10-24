import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@components/Button'
import { showErrorAlert, showSuccessAlert, showToast } from '@utils/alerts'
import { createContactMessage } from '@utils/api'
import './Contact.css'

const PHONE_REGEX = /^[0-9]{10}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ContactField = 'nombre' | 'correo' | 'numero' | 'mensaje'

export default function Contact() {
    const [nombre, setNombre] = useState('')
    const [correo, setCorreo] = useState('')
    const [numero, setNumero] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({})
    const [submitAttempted, setSubmitAttempted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const nombreRef = useRef<HTMLInputElement>(null)
    const correoRef = useRef<HTMLInputElement>(null)
    const numeroRef = useRef<HTMLInputElement>(null)
    const mensajeRef = useRef<HTMLTextAreaElement>(null)

    const trimmedNombre = nombre.trim()
    const trimmedCorreo = correo.trim()
    const trimmedNumero = numero.trim()
    const trimmedMensaje = mensaje.trim()

    const hasMissingRequired = !trimmedNombre || !trimmedCorreo || !trimmedMensaje

    const errors: Record<ContactField, string> = {
        nombre:
            trimmedNombre && trimmedNombre.length < 3
                ? 'Ingresa al menos 3 caracteres para tu nombre.'
                : '',
        correo:
            trimmedCorreo && !EMAIL_REGEX.test(trimmedCorreo)
                ? 'Ingresa un correo electrónico válido (ej. usuario@dominio.com).'
                : '',
        numero:
            trimmedNumero && !PHONE_REGEX.test(trimmedNumero)
                ? 'El teléfono debe contener exactamente 10 dígitos numéricos.'
                : '',
        mensaje:
            trimmedMensaje && trimmedMensaje.length < 10
                ? 'Escribe al menos 10 caracteres en tu mensaje.'
                : ''
    }

    function markTouched(field: ContactField) {
        setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }))
    }

    function getFieldClass(field: ContactField, hasValue: boolean): string {
        if (!hasValue || !touched[field]) return ''
        return errors[field] ? 'input-invalid' : 'input-valid'
    }

    function isFieldValid(field: ContactField, hasValue: boolean): boolean {
        return Boolean(hasValue && touched[field] && !errors[field])
    }

    function focusField(field: ContactField) {
        const refs: Record<ContactField, HTMLElement | null> = {
            nombre: nombreRef.current,
            correo: correoRef.current,
            numero: numeroRef.current,
            mensaje: mensajeRef.current
        }
        refs[field]?.focus()
    }

    function clearForm() {
        setNombre('')
        setCorreo('')
        setNumero('')
        setMensaje('')
        setTouched({})
        setSubmitAttempted(false)
    }

    function handleReset() {
        clearForm()
        showToast('Formulario restablecido', 'info')
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setSubmitAttempted(true)

        setTouched({
            nombre: Boolean(trimmedNombre),
            correo: Boolean(trimmedCorreo),
            numero: Boolean(trimmedNumero),
            mensaje: Boolean(trimmedMensaje)
        })

        const firstIncompleteOrInvalid: ContactField | undefined =
            !trimmedNombre || errors.nombre
                ? 'nombre'
                : !trimmedCorreo || errors.correo
                  ? 'correo'
                  : errors.numero
                    ? 'numero'
                    : !trimmedMensaje || errors.mensaje
                      ? 'mensaje'
                      : undefined

        if (firstIncompleteOrInvalid) {
            focusField(firstIncompleteOrInvalid)
            showToast('Completa los campos obligatorios (*) correctamente', 'warning')
            return
        }

        setIsSubmitting(true)
        try {
            const response = await createContactMessage({
                nombre: trimmedNombre,
                correo: trimmedCorreo,
                numero: trimmedNumero || undefined,
                mensaje: trimmedMensaje,
                fecha: new Date().toISOString()
            })
            clearForm()
            await showSuccessAlert(
                '¡Mensaje enviado!',
                `Gracias por escribirnos, ${trimmedNombre}. Hemos registrado tu mensaje (Ref. #${response.id}) y te contactaremos pronto.`
            )
        } catch (submitError) {
            console.error('No se pudo enviar el mensaje de contacto:', submitError)
            await showErrorAlert(
                'No se pudo enviar el mensaje',
                'Ocurrió un problema de conexión al enviar tu mensaje. Intenta nuevamente.'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <details>
            <summary>¿Prefieres que te contactemos?</summary>
            <form
                id="contact-form"
                action="/contacto"
                method="POST"
                noValidate
                onSubmit={(e) => void handleSubmit(e)}
                onReset={handleReset}
            >
                <div className="form-group">
                    <label htmlFor="nombre">
                        <span>
                            Nombre completo<span className="required-mark">*</span>
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
                        name="nombre"
                        id="nombre"
                        placeholder="Pepito Pérez"
                        autoComplete="name"
                        minLength={3}
                        value={nombre}
                        className={getFieldClass('nombre', Boolean(trimmedNombre))}
                        aria-invalid={touched.nombre && Boolean(errors.nombre) ? 'true' : undefined}
                        aria-errormessage={
                            touched.nombre && errors.nombre ? 'nombre-error' : undefined
                        }
                        onChange={(e) => setNombre(e.target.value)}
                        onBlur={() => {
                            if (trimmedNombre) markTouched('nombre')
                        }}
                        disabled={isSubmitting}
                        required
                    />
                    {touched.nombre && errors.nombre && (
                        <div id="nombre-error" className="field-error-msg" role="alert">
                            <span aria-hidden="true">⚠</span> {errors.nombre}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="correo">
                        <span>
                            Correo electrónico<span className="required-mark">*</span>
                        </span>
                        {isFieldValid('correo', Boolean(trimmedCorreo)) && (
                            <span className="field-status-badge is-valid" aria-hidden="true">
                                ✓ Válido
                            </span>
                        )}
                    </label>
                    <span id="correo-hint" className="field-hint">
                        Formato: ejemplo@correo.com
                    </span>
                    <input
                        ref={correoRef}
                        type="email"
                        name="correo"
                        id="correo"
                        placeholder="ejemplo@correo.com"
                        autoComplete="email"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        value={correo}
                        className={getFieldClass('correo', Boolean(trimmedCorreo))}
                        aria-describedby="correo-hint"
                        aria-invalid={touched.correo && Boolean(errors.correo) ? 'true' : undefined}
                        aria-errormessage={
                            touched.correo && errors.correo ? 'correo-error' : undefined
                        }
                        onChange={(e) => setCorreo(e.target.value)}
                        onBlur={() => {
                            if (trimmedCorreo) markTouched('correo')
                        }}
                        disabled={isSubmitting}
                        required
                    />
                    {touched.correo && errors.correo && (
                        <div id="correo-error" className="field-error-msg" role="alert">
                            <span aria-hidden="true">⚠</span> {errors.correo}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="numero">
                        <span>Teléfono (opcional)</span>
                        {isFieldValid('numero', Boolean(trimmedNumero)) && (
                            <span className="field-status-badge is-valid" aria-hidden="true">
                                ✓ Válido
                            </span>
                        )}
                    </label>
                    <span id="numero-hint" className="field-hint">
                        10 dígitos numéricos sin espacios
                    </span>
                    <input
                        ref={numeroRef}
                        type="tel"
                        name="numero"
                        id="numero"
                        autoComplete="tel"
                        inputMode="numeric"
                        pattern="^[0-9]{10}$"
                        minLength={10}
                        maxLength={10}
                        placeholder="3001234567"
                        value={numero}
                        className={getFieldClass('numero', Boolean(trimmedNumero))}
                        aria-describedby="numero-hint"
                        aria-invalid={touched.numero && Boolean(errors.numero) ? 'true' : undefined}
                        aria-errormessage={
                            touched.numero && errors.numero ? 'numero-error' : undefined
                        }
                        onChange={(e) => setNumero(e.target.value)}
                        onBlur={() => {
                            if (trimmedNumero) markTouched('numero')
                        }}
                        disabled={isSubmitting}
                    />
                    {touched.numero && errors.numero && (
                        <div id="numero-error" className="field-error-msg" role="alert">
                            <span aria-hidden="true">⚠</span> {errors.numero}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="mensaje">
                        <span>
                            Mensaje<span className="required-mark">*</span>
                        </span>
                        {isFieldValid('mensaje', Boolean(trimmedMensaje)) && (
                            <span className="field-status-badge is-valid" aria-hidden="true">
                                ✓ Válido
                            </span>
                        )}
                    </label>
                    <textarea
                        ref={mensajeRef}
                        name="mensaje"
                        id="mensaje"
                        rows={3}
                        minLength={10}
                        placeholder="Cuéntanos en qué podemos ayudarte (mínimo 10 caracteres)..."
                        value={mensaje}
                        className={getFieldClass('mensaje', Boolean(trimmedMensaje))}
                        aria-invalid={
                            touched.mensaje && Boolean(errors.mensaje) ? 'true' : undefined
                        }
                        aria-errormessage={
                            touched.mensaje && errors.mensaje ? 'mensaje-error' : undefined
                        }
                        onChange={(e) => setMensaje(e.target.value)}
                        onBlur={() => {
                            if (trimmedMensaje) markTouched('mensaje')
                        }}
                        disabled={isSubmitting}
                        required
                    />
                    {touched.mensaje && errors.mensaje && (
                        <div id="mensaje-error" className="field-error-msg" role="alert">
                            <span aria-hidden="true">⚠</span> {errors.mensaje}
                        </div>
                    )}
                </div>

                {submitAttempted && hasMissingRequired && (
                    <p className="form-required-notice" role="alert">
                        Completa todos los campos obligatorios marcados con (*) para continuar.
                    </p>
                )}

                <div className="form-actions">
                    <Button type="submit" variant="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Enviando...' : 'Enviar'}
                    </Button>
                    <Button type="reset" variant="reset" disabled={isSubmitting}>
                        Restablecer
                    </Button>
                </div>
            </form>
        </details>
    )
}

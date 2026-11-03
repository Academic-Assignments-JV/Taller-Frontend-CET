import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useShop } from '@/hooks'
import { Button } from '@components/Button'
import './LoginModal.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LoginField = 'correo' | 'password'

export default function LoginModal() {
    const { isLoginOpen, closeLogin, login } = useShop()

    const dialogRef = useRef<HTMLDialogElement>(null)
    const correoRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)

    const [correo, setCorreo] = useState('')
    const [password, setPassword] = useState('')
    const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>({})
    const [authError, setAuthError] = useState<string | null>(null)

    const trimmedCorreo = correo.trim()

    const errors: Record<LoginField, string> = {
        correo:
            trimmedCorreo && !EMAIL_REGEX.test(trimmedCorreo)
                ? 'Ingresa un correo electrónico válido.'
                : '',
        password:
            password && password.length < 4
                ? 'La contraseña debe tener al menos 4 caracteres.'
                : ''
    }

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        if (isLoginOpen && !dialog.open) {
            dialog.showModal()
        } else if (!isLoginOpen && dialog.open) {
            dialog.close()
        }
    }, [isLoginOpen])

    function markTouched(field: LoginField) {
        setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }))
    }

    function getFieldClass(field: LoginField, hasValue: boolean): string {
        if (!hasValue || !touched[field]) return ''
        return errors[field] ? 'input-invalid' : 'input-valid'
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setAuthError(null)

        setTouched({
            correo: true,
            password: true
        })

        if (!trimmedCorreo || errors.correo) {
            correoRef.current?.focus()
            return
        }

        if (!password || errors.password) {
            passwordRef.current?.focus()
            return
        }

        const success = login(trimmedCorreo, password)
        if (!success) {
            setAuthError('Correo o contraseña incorrectos.')
            return
        }

        setCorreo('')
        setPassword('')
        setTouched({})
        setAuthError(null)
    }

    return (
        <dialog
            ref={dialogRef}
            id="login-modal"
            className="cart-modal login-modal"
            aria-labelledby="login-modal-title"
            onClose={closeLogin}
        >
            <div className="modal-dialog-content">
                <header className="modal-header">
                    <h2 id="login-modal-title">Iniciar Sesión</h2>
                    <button
                        type="button"
                        id="close-login-btn"
                        className="modal-close-btn"
                        aria-label="Cerrar ventana de inicio de sesión"
                        onClick={closeLogin}
                    >
                        &times;
                    </button>
                </header>

                <form
                    id="login-form"
                    className="login-form"
                    noValidate
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label htmlFor="login-email">
                            <span>
                                Correo electrónico<span className="required-mark">*</span>
                            </span>
                        </label>
                        <input
                            ref={correoRef}
                            type="email"
                            id="login-email"
                            name="correo"
                            placeholder="correo@ejemplo.com"
                            autoComplete="email"
                            value={correo}
                            className={getFieldClass('correo', Boolean(trimmedCorreo))}
                            aria-invalid={
                                touched.correo && Boolean(errors.correo) ? 'true' : undefined
                            }
                            onChange={(e) => {
                                setCorreo(e.target.value)
                                setAuthError(null)
                            }}
                            onBlur={() => {
                                if (trimmedCorreo) markTouched('correo')
                            }}
                            required
                        />
                        {touched.correo && errors.correo && (
                            <div className="field-error-msg" role="alert">
                                <span aria-hidden="true">⚠</span> {errors.correo}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">
                            <span>
                                Contraseña<span className="required-mark">*</span>
                            </span>
                        </label>
                        <input
                            ref={passwordRef}
                            type="password"
                            id="login-password"
                            name="password"
                            placeholder="Ingresa tu contraseña"
                            autoComplete="current-password"
                            value={password}
                            className={getFieldClass('password', Boolean(password))}
                            aria-invalid={
                                touched.password && Boolean(errors.password) ? 'true' : undefined
                            }
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setAuthError(null)
                            }}
                            onBlur={() => {
                                if (password) markTouched('password')
                            }}
                            required
                        />
                        {touched.password && errors.password && (
                            <div className="field-error-msg" role="alert">
                                <span aria-hidden="true">⚠</span> {errors.password}
                            </div>
                        )}
                    </div>

                    {authError && (
                        <div className="field-error-msg" role="alert">
                            <span aria-hidden="true">⚠</span> {authError}
                        </div>
                    )}

                    <div className="form-actions">
                        <Button type="submit" variant="primary" id="login-submit-btn">
                            Ingresar
                        </Button>
                    </div>
                </form>
            </div>
        </dialog>
    )
}

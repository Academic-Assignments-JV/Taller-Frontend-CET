import Swal from 'sweetalert2'
import type { SweetAlertIcon } from 'sweetalert2'

/**
 * Returns the currently open <dialog> element if one is in the browser's #top-layer,
 * or document.body otherwise, ensuring SweetAlert2 popups always render above open modals.
 */
function getActiveTarget(): HTMLElement {
    return document.querySelector<HTMLElement>('dialog[open]') ?? document.body
}

const SWAL_BODY_CLASSES = [
    'swal2-shown',
    'swal2-height-auto',
    'swal2-no-backdrop',
    'swal2-toast-shown',
    'swal2-iosfix'
] as const

/**
 * Guarantees that all SweetAlert2 scroll-locking classes, inline styles, and aria-hidden
 * attributes are completely removed from <html>, <body>, and #root once a modal closes.
 */
export function ensureScrollRestored(): void {
    document.documentElement.classList.remove(...SWAL_BODY_CLASSES)
    document.body.classList.remove(...SWAL_BODY_CLASSES)
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    document.body.style.top = ''
    document.getElementById('root')?.removeAttribute('aria-hidden')
}

/**
 * Disabling hideClass animations (`popup: ''`) forces SweetAlert2 to run `removePopupAndResetState`
 * synchronously when the user closes the modal, preventing race conditions with React state updates,
 * native <dialog>.close(), or consecutive alerts/toasts.
 */
const BASE_MODAL_OPTIONS = {
    confirmButtonColor: '#c68642',
    cancelButtonColor: '#64607d',
    background: '#ffffff',
    color: '#232135',
    heightAuto: false,
    scrollbarPadding: false,
    returnFocus: false,
    hideClass: {
        popup: '',
        backdrop: '',
        icon: ''
    }
} as const

export function showToast(title: string, icon: SweetAlertIcon = 'success'): void {
    void Swal.fire({
        toast: true,
        position: 'top-end',
        icon,
        title,
        showConfirmButton: false,
        showCloseButton: true,
        closeButtonAriaLabel: 'Cerrar notificación',
        timer: 2800,
        timerProgressBar: true,
        background: BASE_MODAL_OPTIONS.background,
        color: BASE_MODAL_OPTIONS.color,
        hideClass: BASE_MODAL_OPTIONS.hideClass,
        target: getActiveTarget(),
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        },
        didDestroy: () => {
            ensureScrollRestored()
        }
    })
}

export async function showSuccessAlert(title: string, text?: string): Promise<void> {
    try {
        await Swal.fire({
            icon: 'success',
            title,
            text,
            confirmButtonText: 'Aceptar',
            ...BASE_MODAL_OPTIONS,
            target: getActiveTarget()
        })
    } finally {
        ensureScrollRestored()
    }
}

export async function showErrorAlert(title: string, text?: string): Promise<void> {
    try {
        await Swal.fire({
            icon: 'error',
            title,
            text,
            confirmButtonText: 'Entendido',
            ...BASE_MODAL_OPTIONS,
            target: getActiveTarget()
        })
    } finally {
        ensureScrollRestored()
    }
}

export async function showConfirmDialog(
    title: string,
    text: string,
    confirmButtonText: string = 'Sí, continuar'
): Promise<boolean> {
    try {
        const result = await Swal.fire({
            icon: 'warning',
            title,
            text,
            showCancelButton: true,
            confirmButtonText,
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            ...BASE_MODAL_OPTIONS,
            target: getActiveTarget()
        })
        return Boolean(result.isConfirmed)
    } finally {
        ensureScrollRestored()
    }
}

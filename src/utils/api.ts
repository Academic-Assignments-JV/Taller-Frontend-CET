/**
 * Functions that communicate with the MockAPI REST service.
 */

const API_URL = import.meta.env.VITE_API_URL;

export interface Product {
    id: string | number;
    nombre: string;
    categoria: string;
    precio: number;
    imagen: string;
    descripcion: string;
}

export type ProductInput = Omit<Product, 'id'>;

export interface OrderItem {
    id: string | number;
    nombre: string;
    cantidad: number;
    precio: number;
}

export interface Order {
    cliente: string;
    email: string;
    items: OrderItem[];
    total: number;
    fecha: string;
}

export interface CreatedOrder extends Order {
    id: string | number;
}

export interface ContactMessage {
    nombre: string;
    correo: string;
    numero?: string;
    mensaje: string;
    fecha: string;
}

export interface CreatedContactMessage extends ContactMessage {
    id: string | number;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export const PRODUCT_FILTERS = [
    { id: 'all', label: 'Todos' },
    { id: 'hot-coffee', label: 'Cafés Calientes' },
    { id: 'cold-coffee', label: 'Bebidas Frías' },
    { id: 'food', label: 'Comidas y Desayunos' },
    { id: 'pastry', label: 'Repostería' }
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
    'hot-coffee': 'Café Caliente',
    'cold-coffee': 'Bebida Fría',
    food: 'Comida',
    pastry: 'Repostería'
};

export function formatCurrency(amount: number): string {
    return '$' + Number(amount).toLocaleString('es-CO');
}

interface ApiProduct extends Omit<Product, 'precio'> {
    precio: string | number;
}

async function requestJson(url: string, options: RequestInit = {}): Promise<unknown> {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}.`);
    }
    return response.status === 204 ? null : response.json();
}

function normalizeProduct(product: ApiProduct): Product {
    return {
        ...product,
        precio: Number(product.precio)
    };
}

export async function getProducts(category: string = 'all'): Promise<Product[]> {
    const query = category !== 'all' ? `?categoria=${encodeURIComponent(category)}` : '';
    const data = await requestJson(`${API_URL}/productos${query}`);
    if (!Array.isArray(data)) {
        throw new Error('La respuesta de productos no tiene un formato válido.');
    }
    return data.map((product) => normalizeProduct(product as ApiProduct));
}

export async function getProductById(id: string | number): Promise<Product> {
    const data = await requestJson(`${API_URL}/productos/${encodeURIComponent(id)}`);
    return normalizeProduct(data as ApiProduct);
}

export async function createProduct(product: ProductInput): Promise<Product> {
    const data = await requestJson(`${API_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });
    return normalizeProduct(data as ApiProduct);
}

export async function updateProduct(id: string | number, product: ProductInput): Promise<Product> {
    const data = await requestJson(`${API_URL}/productos/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });
    return normalizeProduct(data as ApiProduct);
}

export async function deleteProduct(id: string | number): Promise<void> {
    await requestJson(`${API_URL}/productos/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function createOrder(order: Order): Promise<CreatedOrder> {
    const data = await requestJson(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    });
    return data as CreatedOrder;
}

const CONTACT_API_URL = 'https://jsonplaceholder.typicode.com/posts';
const CONTACT_STORAGE_KEY = 'javis_coffee_contactos';

export async function createContactMessage(
    message: ContactMessage
): Promise<CreatedContactMessage> {
    const data = (await requestJson(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
    })) as { id?: string | number };

    const createdMessage: CreatedContactMessage = {
        ...message,
        id: data?.id ?? Date.now()
    };

    try {
        const storedRaw = window.localStorage.getItem(CONTACT_STORAGE_KEY);
        const existingMessages: CreatedContactMessage[] = storedRaw ? JSON.parse(storedRaw) : [];
        window.localStorage.setItem(
            CONTACT_STORAGE_KEY,
            JSON.stringify([...existingMessages, createdMessage])
        );
    } catch {
        // Ignore localStorage quota or private browsing restrictions
    }

    return createdMessage;
}


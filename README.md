# Javi's Coffee — Aplicacion Web en React con Vite

**Entregable Academico:** Taller 3 — Migracion del Proyecto a React con Vite  
**Curso:** CET - TIC Desarrollo Web Front-End (HTML, CSS y JavaScript)  
**Docente:** Jhonatan Alarcon  

---

## 1. Descripcion General

**Javi's Coffee** es una aplicacion web de comercio electronico y gestion de catalogo para una cafeteria de especialidad. Este proyecto corresponde a la migracion integral de la version desarrollada previamente en JavaScript vanilla hacia una arquitectura declarativa construida con **React** y **Vite**, manteniendo la identidad visual, la estructura semantica HTML5, la accesibilidad y el diseno adaptable (responsive).

La interfaz se construye integramente a partir del estado y de los datos, aplicando los principios fundamentales de React: composicion mediante componentes funcionales con responsabilidad unica, flujos de datos unidireccionales mediante propiedades (`props`) y contexto (`Context API`), formularios controlados con validacion interactiva en la interfaz y consumo asincrono de servicios REST.

---

## 2. Objetivos del Taller Cumplidos

1. **Configuracion con Vite y React:** Proyecto inicializado sobre Vite con soporte de modulos ES, recarga en caliente (HMR), tipado estatico con TypeScript y verificacion estatica con ESLint.
2. **Migracion Visual y Semantica:** Conservacion de todas las secciones originales (`header`, `nav`, `main`, `section`, `article`, `figure`, `aside`, `footer`, `dialog`, `details`), adaptando los atributos al estandar JSX (`className`, `htmlFor`, `autoComplete`, `minLength`, entre otros) y eliminando la manipulacion imperativa del DOM en favor de referencias declarativas (`useRef`).
3. **Arquitectura de Componentes:** Division de la interfaz en componentes funcionales independientes, nombrados en `PascalCase`, con un unico componente por archivo.
4. **Formularios Controlados y Validacion en Interfaz:** Sincronizacion de cada control de formulario mediante `useState` y `onChange`, interceptacion de envio con `onSubmit` y `event.preventDefault()`, validacion interactiva en tiempo real (campos obligatorios, formato de correo electronico, telefono de 10 digitos, valores numericos mayores a cero y longitudes minimas) y retroalimentacion visual directamente en el formulario sin recurrir a `alert()` nativo.
5. **Renderizado Dinamico de Datos:** Carga del catalogo de productos desde el servicio REST en MockAPI y datos locales estructurados en `src/data/gallery.json`. Renderizado declarativo con `.map()` y asignacion de `key` unica basada en el identificador de cada entidad tanto en la grilla del menu (`Menu`), como en la tabla completa de precios agrupada por categorias (`Prices`) y en la galeria (`Gallery`).
6. **Buenas Practicas de React:** Uso exclusivo de componentes funcionales y hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useContext`, `useRef`), actualizaciones de estado inmutables, separacion entre estado compartido y estado local, y codigo libre de advertencias o errores de linter.

---

## 3. Tecnologias y Herramientas

| Categoria | Tecnologia | Uso en el Proyecto |
| :--- | :--- | :--- |
| **Libreria UI** | React 19 | Renderizado declarativo, componentes funcionales y gestion de estado con Hooks. |
| **Lenguaje** | TypeScript 6 | Tipado estatico de entidades, contratos de API, propiedades de componentes y eventos. |
| **Empaquetador** | Vite 8 | Servidor de desarrollo con HMR y empaquetado optimizado para produccion. |
| **Estilos** | CSS3 Nativo | Variables CSS (Design Tokens), CSS Grid, Flexbox, `@supports (appearance: base-select)` y diseno responsive. |
| **Notificaciones** | SweetAlert2 | Confirmaciones modales de acciones destructivas, notificaciones de exito/error de red y toasts con cierre manual. |
| **Calidad de Codigo** | ESLint 10 | Analisis estatico con reglas para React Hooks, React Refresh y TypeScript. |

---

## 4. Estructura del Proyecto

```text
mi-app-react/
├── public/
│   ├── favicon.ico
│   └── img/                        # Recursos graficos vectoriales (SVG) del catalogo y galeria
├── src/
│   ├── components/                 # Componentes funcionales de la interfaz (un componente por archivo)
│   │   ├── About/                  # Seccion informativa e historia de la cafeteria
│   │   ├── Admin/                  # Seccion de administracion CRUD (Admin.tsx y ProductForm.tsx)
│   │   ├── Button/                 # Componente reutilizable de boton con variantes visuales
│   │   ├── Card/                   # Tarjeta individual de producto en el catalogo
│   │   ├── CartModal/              # Modal del carrito de compras y formulario de checkout
│   │   ├── Contact/                # Formulario controlado de contacto en el pie de pagina
│   │   ├── DetailModal/            # Modal de visualizacion detallada de un producto
│   │   ├── Footer/                 # Pie de pagina con ubicacion, horarios y contacto
│   │   ├── Gallery/                # Galeria fotografica renderizada desde JSON
│   │   ├── Header/                 # Barra de navegacion superior e indicador del carrito
│   │   ├── Hero/                   # Banner principal de bienvenida y llamados a la accion
│   │   ├── Menu/                   # Filtros por categoria y grilla dinamica de productos
│   │   └── Prices/                 # Tabla semantica de precios agrupada dinamicamente por categoria
│   ├── data/
│   │   └── gallery.json            # Datos estructurados de la galeria visual
│   ├── hooks/
│   │   ├── ShopProvider.tsx        # Proveedor de contexto para catalogo, CRUD, carrito y modales
│   │   ├── useShop.ts              # Hook personalizado y definicion del contrato de contexto
│   │   └── index.ts                # Punto de exportacion de hooks
│   ├── pages/
│   │   └── Landing.tsx             # Composicion de la pagina principal de la aplicacion
│   ├── utils/
│   │   ├── alerts.ts               # Adaptador de alertas modales y toasts (SweetAlert2)
│   │   └── api.ts                  # Cliente HTTP (Fetch API), tipos de dominio y formateadores
│   ├── App.css                     # Estilos transversales (modales, tablas, estados de formularios)
│   ├── App.tsx                     # Componente raiz de la aplicacion
│   ├── index.css                   # Tokens de diseno (:root), reset global y tipografia
│   └── main.tsx                    # Punto de montaje de React en el DOM
├── .env.example                    # Plantilla de variables de entorno (VITE_API_URL)
├── eslint.config.js                # Configuracion de ESLint
├── index.html                      # Documento HTML base
├── package.json                    # Dependencias y scripts de ejecucion
├── tsconfig.json                   # Configuracion raiz de TypeScript
└── vite.config.ts                  # Configuracion de Vite y alias de importacion (@, @components, @utils)
```

---

## 5. Arquitectura de Componentes y Estado

### 5.1 Catalogo de Componentes

| Componente | Archivo | Responsabilidad |
| :--- | :--- | :--- |
| `Header` | `src/components/Header/Header.tsx` | Renderiza la identidad de marca, los enlaces de navegacion con estado activo y el boton de apertura del carrito con contador dinamico. |
| `Hero` | `src/components/Hero/Hero.tsx` | Presenta la propuesta de valor de la cafeteria, distintivos de calidad y accesos directos al menu y lista de precios. |
| `Menu` | `src/components/Menu/Menu.tsx` | Renderiza la barra de filtros por categoria, gestiona los estados de carga/error/vacio y proyecta el listado de productos mediante `Card`. |
| `Card` | `src/components/Card/Card.tsx` | Muestra la informacion de un producto individual recibido por `props` y expone acciones para ver detalle, agregar al carrito, editar o eliminar. |
| `Admin` | `src/components/Admin/Admin.tsx` | Contenedor de la seccion de administracion del catalogo con referencia de desplazamiento (`adminSectionRef`). |
| `ProductForm` | `src/components/Admin/ProductForm.tsx` | Formulario controlado para crear o actualizar productos en el servidor, con validacion interactiva de campos. |
| `Prices` | `src/components/Prices/Prices.tsx` | Agrupa dinamicamente todos los productos del catalogo por categoria y construye la tabla semantica de precios. |
| `Gallery` | `src/components/Gallery/Gallery.tsx` | Importa `src/data/gallery.json` y renderiza las tarjetas visuales con `.map()`. |
| `About` | `src/components/About/About.tsx` | Muestra la resena historica de la cafeteria y la ficha tecnica del proyecto academico. |
| `Footer` | `src/components/Footer/Footer.tsx` | Estructura la direccion fisica, los horarios de atencion (`dl`, `dt`, `dd`, `time`) e integra el componente `Contact`. |
| `Contact` | `src/components/Contact/Contact.tsx` | Formulario controlado de contacto con validacion de nombre, correo electronico, telefono opcional y mensaje. |
| `CartModal` | `src/components/CartModal/CartModal.tsx` | Dialogo modal nativo (`<dialog>`) que administra los articulos del carrito, cantidades, subtotales y el formulario controlado de compra. |
| `DetailModal` | `src/components/DetailModal/DetailModal.tsx` | Dialogo modal que consulta y presenta la informacion detallada de un producto especifico por su `id`. |
| `Button` | `src/components/Button/Button.tsx` | Componente atomico reutilizable que estandariza las variantes de botones (`primary`, `secondary`, `secondary-danger`, `add-cart`, `submit`, `reset`). |

### 5.2 Distribucion del Estado

- **Estado Compartido (`ShopProvider`):** Centraliza unicamente la informacion que debe sincronizarse entre multiples secciones:
  - `allProducts`: Catalogo completo sincronizado con MockAPI (utilizado por `Prices` para mostrar la carta completa en todo momento).
  - `products` y `selectedCategory`: Productos filtrados para la seccion `Menu`.
  - `cart`, `totalQuantity` y `totalPrice`: Estado inmutable del carrito compartido entre `Header`, `Card` y `CartModal`.
  - `editingProduct`: Producto seleccionado desde `Card` para ser editado en `ProductForm`.
  - `detailProductId`: Identificador del producto activo en `DetailModal`.
- **Estado Local:** Los valores de los campos, banderas de interaccion (`touched`), intentos de envio (`submitAttempted`) y estados de carga de envio (`isSubmitting`) residen exclusivamente dentro de cada formulario (`Contact`, `CartModal` y `ProductForm`).

---

## 6. Validacion de Formularios y Experiencia de Usuario

Los tres formularios de la aplicacion (`Contact`, `CartModal` y `ProductForm`) implementan un flujo de validacion no intrusivo:

1. **Estado por Defecto en Campos Vacios:** Los campos vacios conservan su apariencia neutra por defecto, evitando mostrar bordes rojos prematuros al cargar la pagina o tras limpiar el formulario despues de un envio exitoso.
2. **Retroalimentacion Interactiva por Campo:**
   - Cuando un campo contiene informacion que incumple las reglas de negocio (por ejemplo, correo sin formato valido, telefono con longitud distinta de 10 digitos numericos, precio menor o igual a 0, ruta de imagen invalida o textos demasiado cortos), se aplica la clase `.input-invalid`, se sincroniza `aria-invalid="true"` y se despliega debajo del control el mensaje explicativo especifico.
   - Cuando el valor ingresado cumple todas las restricciones, el campo recibe la clase `.input-valid` y muestra el indicador de validez en su etiqueta.
3. **Proteccion en el Envio (`onSubmit`):** Si el usuario intenta enviar el formulario con campos obligatorios vacios o valores invalidos, se detiene el envio en el propio formulario (sin abrir modales de alerta bloqueantes), se despliega un aviso inline dentro del formulario indicando que deben completarse los campos requeridos y se mueve el foco automaticamente al primer control pendiente mediante `useRef`.
4. **Notificaciones Tipo Toast:** Las notificaciones breves incluyen boton de cierre manual (`showCloseButton: true`) y pausan su temporizador cuando el usuario posiciona el cursor sobre ellas.

---

## 7. Integracion con Servicios REST

La capa de comunicacion HTTP se encuentra encapsulada en `src/utils/api.ts`:

- **Catalogo de Productos (`${VITE_API_URL}/productos`):**
  - `GET /productos` y `GET /productos?categoria={id}`: Consulta completa y filtrada del catalogo.
  - `GET /productos/{id}`: Consulta individual para el modal de detalle.
  - `POST /productos`: Creacion de nuevos productos desde el panel de administracion.
  - `PUT /productos/{id}`: Actualizacion de productos existentes.
  - `DELETE /productos/{id}`: Eliminacion de productos previa confirmacion del usuario.
- **Pedidos (`${VITE_API_URL}/pedidos`):**
  - `POST /pedidos`: Registro de ordenes de compra generadas desde el carrito.
- **Mensajes de Contacto:**
  - `POST https://jsonplaceholder.typicode.com/posts`: Envio del formulario de contacto con respaldo local en `localStorage` bajo la clave `javis_coffee_contactos`.

---

## 8. Requisitos Previos e Instalacion

### 8.1 Requisitos del Sistema
- **Node.js:** Version 20.x o superior.
- **Gestor de paquetes:** `npm` o `pnpm`.

### 8.2 Variables de Entorno
El proyecto requiere configurar la variable `VITE_API_URL` en un archivo `.env` local en la raiz del repositorio. Puedes crear el archivo a partir de la plantilla incluida (`.env.example`):

```bash
cp .env.example .env
```

Contenido de `.env`:

```env
VITE_API_URL=https://<tu-proyecto>.mockapi.io/api/v1
```

### 8.3 Pasos de Ejecucion

1. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo local con recarga en caliente:
   ```bash
   npm run dev
   ```

3. Verificar las reglas de calidad de codigo con ESLint:
   ```bash
   npm run lint
   ```

4. Generar la compilacion optimizada para produccion (incluye verificacion de tipos con TypeScript):
   ```bash
   npm run build
   ```

5. Previsualizar localmente la version compilada de produccion:
   ```bash
   npm run preview
   ```

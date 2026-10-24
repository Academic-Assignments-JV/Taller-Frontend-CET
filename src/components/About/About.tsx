import './About.css'

export default function About() {
    return (
        <section id="nosotros">
            <h2>Sobre Nosotros</h2>
            <div className="about-grid">
                <article className="about-story">
                    <h3>Nuestra Historia y Filosofía</h3>
                    <p>
                        Javi's Coffee nació como un espacio para honrar el café de origen. Trabajamos directamente
                        con caficultores colombianos que preservan métodos de cultivo sostenibles y recolección manual.
                    </p>
                    <p>
                        Cada taza representa un viaje sensorial: desde la calibración milimétrica de los molinos
                        hasta la vaporización sedosa de la leche. Creemos que una cafetería debe ser tanto un refugio
                        cálido como un punto de encuentro para amantes del buen café.
                    </p>
                    <p>
                        Te invitamos a visitarnos, probar nuestras preparaciones y disfrutar de un momento de pausa
                        en medio de la rutina diaria.
                    </p>
                </article>

                <aside className="academic-spec" aria-label="Información académica del proyecto">
                    <h3>PROYECTO WEB</h3>
                    <h4>Taller de Desarrollo Web Front-End</h4>
                    <p>
                        Diseño e implementación semántica para un sitio web de cafetería local, realizado bajo los lineamientos
                        del curso CET - TIC Desarrollo Web Front-End (HTML, CSS y JavaScript) impartido por el docente
                        <strong>Jhonatan Alarcon</strong>.
                    </p>
                    <h4>Especificaciones Técnicas Cumplidas</h4>
                    <ul>
                        <li>Header con navegación principal, enlace de marca y botón SVG para carrito modal.</li>
                        <li>Carga dinámica de productos desde una API REST con fetch, async/await y manejo de errores.</li>
                        <li>Filtro remoto de productos por categoría y opción Todos.</li>
                        <li>Carrito de compras en ventana modal accesible, sin ocupar espacio en el layout general.</li>
                        <li>Formulario de contacto con captura de evento submit, preventDefault y log en consola.</li>
                        <li>Lista de precios con tabla semántica accesible (caption, scope col/row/colgroup).</li>
                        <li>Galería fotográfica y visual representativa de la cafetería.</li>
                        <li>Footer semántico con ubicación, horarios y formulario con validación accesible.</li>
                    </ul>
                </aside>
            </div>
        </section>
    )
}
import { Contact } from '@/components/Contact'
import './Footer.css'

export default function Footer() {
    return (
        <footer id="contacto">
            <div className="footer-content">
                <section id="ubicacion">
                    <h2>Ubicación</h2>
                    <address>
                        P. Sherman, Calle Wallaby, 42<br />
                        Sídney, Distrito Centro<br />
                        Referencia: Frente a la plaza principal
                    </address>
                </section>

                <section id="contacto-info">
                    <h2>Contáctanos</h2>
                    <address>
                        Teléfono: <a href="tel:+576001233210">+57 600 123 3210</a><br />
                        Correo: <a href="mailto:contact@cafeteria.com">contact@cafeteria.com</a>
                    </address>
                    <Contact />
                </section>

                <section id="horarios">
                    <h2>Horarios de Atención</h2>
                    <dl>
                        <dt>Lunes a Viernes</dt>
                        <dd>
                            <time dateTime="07:00">07:00</time> - <time dateTime="18:00">18:00</time>
                        </dd>
                        <dt>Sábados y Domingos</dt>
                        <dd>
                            <time dateTime="08:00">08:00</time> - <time dateTime="13:00">13:00</time>
                        </dd>
                        <dt>Festivos</dt>
                        <dd>Sin atención</dd>
                    </dl>
                </section>
            </div>

            <small>
                &copy; 2026 Cafetería de Javi. Todos los derechos reservados.
            </small>
        </footer>
    )
}
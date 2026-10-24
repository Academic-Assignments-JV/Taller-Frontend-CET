import './Hero.css'

const HERO_PILLARS = [
    '100% Grano Arábica de Origen',
    'Tueste Semanal Controlado',
    'Bebidas Frías y Repostería',
    'Opciones Veganas y Sin Gluten'
] as const

export default function Hero() {
    return (
        <section id="inicio" className="hero">
            <h2>Café de Especialidad y Experiencias Artesanales</h2>
            <p className="hero-subtitle">
                En la cafetería de Javi seleccionamos granos de origen único cosechados en alturas privilegiadas,
                tostados con precisión en pequeños lotes y preparados con dedicación para entregarte una taza excepcional.
            </p>
            <div className="hero-pillars">
                {HERO_PILLARS.map((pillar) => (
                    <span key={pillar} className="pillar-badge">{pillar}</span>
                ))}
            </div>
            <div className="hero-actions">
                <a href="#menu" className="btn btn-primary">Explorar Menú</a>
                <a href="#precios" className="btn btn-secondary">Consultar Precios</a>
            </div>
        </section>
    )
}

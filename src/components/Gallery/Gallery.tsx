import galleryItems from '@/data/gallery.json'
import './Gallery.css'

export default function Gallery() {
    return (
        <section id="galeria">
            <h2>Galería de la Cafetería</h2>
            <div className="gallery-grid">
                {galleryItems.map((item) => (
                    <figure key={item.id} className="gallery-card">
                        <img
                            src={item.src}
                            alt={item.alt}
                            width={item.width}
                            height={item.height}
                            loading="lazy"
                        />
                        <figcaption>{item.caption}</figcaption>
                    </figure>
                ))}
            </div>
        </section>
    )
}
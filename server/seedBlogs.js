import { Blog } from './models/index.js';
import { v4 as uuidv4 } from 'uuid';

const seedBlogs = async () => {
    try {
        console.log('🌱 Seeding Blogs...');
        const blogs = [
            {
                id: uuidv4(),
                title: "Comment choisir sa montre connectée en 2026 ?",
                slug: "comment-choisir-sa-montre-connectee-2026",
                summary: "Découvrez les critères essentiels pour ne pas vous tromper : autonomie, capteurs de santé et compatibilité.",
                content: `
                    <h2>Le guide ultime des Smartwatches</h2>
                    <p>En 2026, la montre connectée n'est plus un simple gadget, c'est un véritable compagnon de santé. Mais avec la multitude de modèles sur Vtout, comment choisir ?</p>
                    <h3>1. L'autonomie avant tout</h3>
                    <p>Rien n'est plus frustrant qu'une montre qui s'éteint en pleine journée. Recherchez les modèles avec au moins 5 jours d'autonomie.</p>
                    <h3>2. Les capteurs de santé</h3>
                    <p>ECG, taux d'oxygène, suivi du sommeil... Ces fonctions sont devenues la norme pour un suivi proactif de votre bien-être.</p>
                    <p>Retrouvez notre sélection exclusive dans la section électronique !</p>
                `,
                image_url: "https://images.unsplash.com/photo-1544117518-30dd5978bbbe?q=80&w=2000&auto=format&fit=crop",
                category: "Électronique",
                tags: "tech, smartwatch, guide",
                is_published: true,
                published_at: new Date()
            },
            {
                id: uuidv4(),
                title: "5 tendances mode incontournables à Cotonou",
                slug: "5-tendances-mode-cotonou-2026",
                summary: "Le mélange parfait entre tradition et modernité. Voici ce que tout le monde porte cette saison.",
                content: `
                    <h2>Le style Vtout cette saison</h2>
                    <p>Cotonou vibre au rythme d'une mode audacieuse cette année. Voici le top 5 des pièces à avoir dans son dressing.</p>
                    <ul>
                        <li><strong>Le pagne revisité :</strong> Des coupes modernes pour un look chic au bureau.</li>
                        <li><strong>Les sneakers blanches :</strong> L'indispensable du confort urbain.</li>
                        <li><strong>Les accessoires en raphia :</strong> Naturels et élégants.</li>
                    </ul>
                `,
                image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
                category: "Mode",
                tags: "mode, cotonou, style",
                is_published: true,
                published_at: new Date()
            },
            {
                id: uuidv4(),
                title: "Secret d'un intérieur moderne et épuré",
                slug: "secret-interieur-moderne-epure",
                summary: "Comment transformer votre salon sans vous ruiner. Nos astuces déco minimalistes.",
                content: `
                    <h2>Moins, c'est mieux</h2>
                    <p>Le minimalisme n'est pas seulement une tendance, c'est un mode de vie. Pour votre maison, misez sur la lumière et les matériaux naturels.</p>
                `,
                image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop",
                category: "Maison",
                tags: "déco, maison, minimalisme",
                is_published: true,
                published_at: new Date()
            },
            {
                id: uuidv4(),
                title: "Les bienfaits de la cuisine locale béninoise",
                slug: "bienfaits-cuisine-locale-beninoise",
                summary: "Pourquoi manger local est meilleur pour votre santé et votre portefeuille.",
                content: `
                    <h2>Savourer le Bénin</h2>
                    <p>La cuisine béninoise regorge de super-aliments. Du fonio au manioc, découvrez comment manger sainement avec nos produits locaux.</p>
                `,
                image_url: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=2070&auto=format&fit=crop",
                category: "Lifestyle",
                tags: "cuisine, santé, bénin",
                is_published: true,
                published_at: new Date()
            }
        ];

        for (const blog of blogs) {
            await Blog.findOrCreate({
                where: { slug: blog.slug },
                defaults: blog
            });
        }
        console.log('✅ Blogs seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding blogs:', error);
    }
};

export default seedBlogs;

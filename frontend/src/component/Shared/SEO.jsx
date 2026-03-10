import React from "react";
import { Helmet } from "react-helmet-async";

export default function SEO({
    title = "Vtout - Tout ce dont vous avez besoin",
    description = "Découvrez Vtout, la boutique en ligne où l'on vend tout type de produit. Qualité, diversité et prix compétitifs au Bénin.",
    image = "/og-image.jpg",
    url = window.location.href,
    type = "website"
}) {
    const siteTitle = title.includes("Vtout") ? title : `${title} | Vtout`;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
}

import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    name?: string;
    type?: string;
}

export function SEO({
    title = "Yashoda bhavan|Best Girls Hostel in Lakhey Hazaribagh, Jharkhand | Best room for girls ",
    description = "Yashoda bhavan offers the best girls hostel and PG accommodation in Lakhey, Hazaribagh. Safe, secure, and affordable student living with premium amenities.",
    keywords = "girls hostel, ladies pg, student accommodation, lakhey hazaribagh, best girls hostel jharkhand, yashoda bhavan, safe girls hostel",
    name = "Yashoda bhavan",
    type = "website"
}: SEOProps) {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />
            <meta name='keywords' content={keywords} />

            {/* Open Graph tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content={name} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
}

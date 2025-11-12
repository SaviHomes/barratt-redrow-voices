interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: object;
}

const SEOHead = ({ 
  title, 
  description, 
  keywords = "Redrow defects, Redrow complaints, Redrow build quality, property defects", 
  canonicalUrl,
  ogImage = "/redrow-exposed-og.jpg",
  structuredData 
}: SEOHeadProps) => {
  const fullTitle = title.includes("Redrow") ? title : `${title} | Redrow Exposed`;
  const currentUrl = canonicalUrl || window.location.href;
  
  // Handle both full URLs and relative paths for ogImage
  const fullOgImage = ogImage?.startsWith('http') 
    ? ogImage 
    : `${window.location.origin}${ogImage}`;

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="Redrow Exposed" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullOgImage} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="author" content="Redrow Exposed" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="language" content="en-GB" />
      <meta name="geo.region" content="GB" />
      <meta name="geo.placename" content="United Kingdom" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </>
  );
};

export default SEOHead;
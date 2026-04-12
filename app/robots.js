export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/portal-leher/',
          '/portal-member/',
          '/api/',
          '/login-leher',
          '/login-member',
        ],
      },
    ],
    sitemap: 'https://leher-adventure.org/sitemap.xml',
  };
}

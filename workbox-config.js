module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{js,html,json,png,ico,ttf}',
  ],
  swDest: 'dist/sw.js',
  // Don't cache too aggressively - only precache the app shell
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  runtimeCaching: [
    {
      // Cache page navigations (HTML) with a Network First strategy
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 20,
        },
      },
    },
    {
      // Cache JS/CSS assets with Stale While Revalidate
      urlPattern: ({ request }) =>
        request.destination === 'script' || request.destination === 'style',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'assets',
        expiration: {
          maxEntries: 50,
        },
      },
    },
    {
      // Cache images
      urlPattern: ({ request }) => request.destination === 'image',
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
};

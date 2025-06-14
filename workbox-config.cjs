module.exports = {
	globDirectory: 'dist',
	globPatterns: [
	  '*.{html,js,css,ico,png}',
	  'assets/**/*',
	  'images/**/*',
	  'manifest.json',
	  'favicon.png'
	],
	swDest: 'dist/sw.js',
	sourcemap: false,
	mode: 'production',
	inlineWorkboxRuntime: true,
	skipWaiting: true,
	clientsClaim: true,
	cleanupOutdatedCaches: true,
	navigateFallback: '/index.html',
	navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
	runtimeCaching: [
	  {
		urlPattern: ({request}) => request.mode === 'navigate',
		handler: 'NetworkFirst',
		options: {
		  cacheName: 'pages-cache',
		  networkTimeoutSeconds: 3,
		  cacheableResponse: {
			statuses: [0, 200]
		  },
		  matchOptions: {
			ignoreSearch: true
		  }
		}
	  },
	  {
		urlPattern: ({request}) => 
		  request.destination === 'style' ||
		  request.destination === 'script' ||
		  request.destination === 'worker',
		handler: 'CacheFirst',
		options: {
		  cacheName: 'assets-cache',
		  cacheableResponse: {
			statuses: [0, 200]
		  },
		  expiration: {
			maxEntries: 60,
			maxAgeSeconds: 30 * 24 * 60 * 60
		  }
		}
	  },
	  {
	urlPattern: ({request}) => 
	  request.destination === 'image' ||
	  request.url.includes('/images/') ||
	  request.url.includes('favicon.png'),
	handler: 'StaleWhileRevalidate',
	options: {
	  cacheName: 'images-cache',
	  cacheableResponse: {
		statuses: [0, 200]
	  },
	  expiration: {
		maxEntries: 100,
		maxAgeSeconds: 30 * 24 * 60 * 60
	  },
	  plugins: [
		{
		  cacheKeyWillBeUsed: async ({request}) => {
			return `${request.url}?offline=${!navigator.onLine}`;
		  }
		}
	  ]
	}
  },
	  {
		urlPattern: ({url}) => url.origin === 'https://story-api.dicoding.dev',
		handler: 'NetworkFirst',
		options: {
		  cacheName: 'api-cache',
		  networkTimeoutSeconds: 5,
		  cacheableResponse: {
			statuses: [0, 200]
		  },
		  expiration: {
			maxEntries: 50,
			maxAgeSeconds: 24 * 60 * 60
		  },
		  matchOptions: {
			ignoreSearch: true
		  }
		}
	  },
	  {
		urlPattern: ({url}) => 
		  url.origin === 'https://tile.openstreetmap.org' || 
		  url.origin === 'https://unpkg.com',
		handler: 'CacheFirst',
		options: {
		  cacheName: 'external-resources',
		  cacheableResponse: {
			statuses: [0, 200]
		  },
		  expiration: {
			maxEntries: 1000,
			maxAgeSeconds: 30 * 24 * 60 * 60
		  }
		}
	  }
	]
};
  
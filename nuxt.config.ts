export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  typescript: { strict: true },
  app: {
    head: {
      title: 'math snake',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap' }
      ],
      script: [{
        // set theme before first paint -> no flash
        innerHTML: "(function(){var t;try{t=localStorage.getItem('mathsnake:theme')}catch(e){}if(t!=='dark'&&t!=='light'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t})()",
        tagPosition: 'head'
      }]
    }
  }
})

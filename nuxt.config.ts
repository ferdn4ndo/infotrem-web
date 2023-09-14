import colors from 'vuetify/lib/util/colors'
import { defineNuxtConfig } from 'nuxt/config'
import { aliases, fa } from 'vuetify/iconsets/fa'
import { mdi } from 'vuetify/iconsets/mdi'

export default defineNuxtConfig({

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  app: {
    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
      titleTemplate: '%s - InfoTrem',
      title: 'App',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { hid: 'description', name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'msapplication-TileColor', content: '#e6e6e6' },
        { name: 'msapplication-TileImage', content: '/ms-icon-144x144.png' },
        { name: 'theme-color', content: '#e6e6e6' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '57x57', href: '/apple-icon-57x57.png' },
        { rel: 'apple-touch-icon', sizes: '60x60', href: '/apple-icon-60x60.png' },
        { rel: 'apple-touch-icon', sizes: '72x72', href: '/apple-icon-72x72.png' },
        { rel: 'apple-touch-icon', sizes: '76x76', href: '/apple-icon-76x76.png' },
        { rel: 'apple-touch-icon', sizes: '114x114', href: '/apple-icon-114x114.png' },
        { rel: 'apple-touch-icon', sizes: '120x120', href: '/apple-icon-120x120.png' },
        { rel: 'apple-touch-icon', sizes: '144x144', href: '/apple-icon-144x144.png' },
        { rel: 'apple-touch-icon', sizes: '152x152', href: '/apple-icon-152x152.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-icon-180x180.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-icon-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/manifest.json' },
      ],
    },
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'vuetify/lib/styles/main.sass',
    '@fortawesome/fontawesome-svg-core/styles.css',
    '@fortawesome/fontawesome-free/css/all.css',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    // { src: '~/plugins/axios-acessor.ts' },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    // https://www.npmjs.com/package/@nuxtjs/fontawesome
    ['@nuxtjs/fontawesome', {
      icons: {
        solid: true,
        // here you can include other icons you need
        brands: [
          'faYoutube',
          'faVimeo',
          'faVimeoV'
        ]
      }
    }],
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    // '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    // '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/content
    '@nuxt/content',
    // https://nuxt.com/modules/nuxt-vuetify
    ['@invictus.codes/nuxt-vuetify', {
      icons: {
        iconfont: 'faSvg'
      }
    }],
  ],

  // Content module configuration: https://go.nuxtjs.dev/config-content
  content: {},

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    /* vuetify options */
    vuetifyOptions: {
      defaultAssets: {icons: 'fa'},
      customVariables: ['~/assets/variables.scss'],
      theme: {
        defaultTheme: 'dark',
        themes: {
          dark: {
            primary: colors.blue.darken2,
            accent: colors.grey.darken3,
            secondary: colors.amber.darken3,
            info: colors.teal.lighten1,
            warning: colors.amber.base,
            error: colors.deepOrange.accent4,
            success: colors.green.accent3,
          },
        },
      },
      // icons: {
      //   defaultSet: 'fa',
      //   aliases,
      //   sets: {
      //     fa,
      //     mdi,
      //   },
      // },
    },

    moduleOptions: {
      /* nuxt-vuetify module options */
      treeshaking: true,
      useIconCDN: true,

      /* vite-plugin-vuetify options */
      styles: 'sass',
      autoImport: true,
      useVuetifyLabs: true,
    }
  },

  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },

  // FontAwesome configuration:
  fontawesome: {
    component: 'fa',
    suffix: true,
    icons: {
      solid: true
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: ['vuetify'],
  },

  devtools: {
    enabled: true,
  },
})

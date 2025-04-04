import js from '@eslint/js'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import {
  defineConfigWithVueTs,
  vueTsConfigs
} from '@vue/eslint-config-typescript'
import pluginCypress from 'eslint-plugin-cypress'
import pluginVue from 'eslint-plugin-vue'

export default defineConfigWithVueTs(
  js.configs.recommended,
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'],
    extends: [pluginCypress.configs.recommended]
  },
  skipFormatting
)

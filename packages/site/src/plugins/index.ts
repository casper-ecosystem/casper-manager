/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import type { App } from 'vue';

import router from '../router';
import pinia from '../store';
import vuetify from './vuetify';
import { loadFonts } from './webfontloader';

// Types

/**
 * Register plugins.
 * @param app - Vue application.
 */
export function registerPlugins(app: App) {
  loadFonts();
  app.use(vuetify).use(router).use(pinia);
}

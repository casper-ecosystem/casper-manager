/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

/* eslint-disable no-restricted-globals */
/* eslint-disable import/no-nodejs-modules */

// Components
import { Buffer } from 'buffer';
import { createApp } from 'vue';

import App from './App.vue';

// Composables
// Plugins
import { registerPlugins } from '@/plugins';

globalThis.Buffer = Buffer;

const app = createApp(App);

registerPlugins(app);

app.mount('#app');

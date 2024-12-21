/**
 * plugins/webfontloader.ts
 *
 * webfontloader documentation: https://github.com/typekit/webfontloader
 */

import webfontloader from 'webfontloader';

/**
 * Load fonts.
 */
export function loadFonts() {
  webfontloader.load({
    google: {
      families: ['Roboto:100,300,400,500,700,900&display=swap'],
    },
  });
}

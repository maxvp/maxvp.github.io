import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://maxvphillips.com',
  compressHTML: true,

  build: {
    inlineStylesheets: 'auto',
  },

  integrations: [mdx(), sitemap()],
});
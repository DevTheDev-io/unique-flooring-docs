import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Unique Flooring API',
  tagline: 'GraphQL API for product catalog integration',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://devthedev-io.github.io',
  baseUrl: '/unique-flooring-docs/',

  organizationName: 'DevTheDev-io',
  projectName: 'unique-flooring-docs',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Unique Flooring API',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/DevTheDev-io/unique-flooring-docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'API',
          items: [
            {label: 'GraphQL Endpoint', href: 'https://services.uniqueflooring.co.za/graphql'},
            {label: 'Download Schema (SDL)', href: 'https://services.uniqueflooring.co.za/graphql?sdl'},
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'Hot Chocolate Docs', href: 'https://chillicream.com/docs/hotchocolate/v16'},
            {label: 'Nitro (Schema Explorer)', href: 'https://nitro.chillicream.com'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Unique Flooring. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['graphql'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

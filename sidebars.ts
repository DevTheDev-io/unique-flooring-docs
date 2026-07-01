import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  apiSidebar: [
    'intro',
    'getting-started',
    'integration-guide',
    {
      type: 'category',
      label: 'Querying Products',
      items: ['querying/flooring', 'querying/wall-cladding', 'querying/decking', 'querying/product-spec'],
    },
    'filtering',
    'errors',
    'auth',
  ],
};

export default sidebars;

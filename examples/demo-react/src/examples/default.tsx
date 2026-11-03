/* eslint-disable react/react-in-jsx-scope */
// Fork-only demo setup: the recorder has no network, so this example answers
// every query with a few fixed hits instead of calling Algolia.
import { DocSearch } from '@docsearch/react';
import type { DocSearchTransformClient } from '@docsearch/react';
import type { JSX } from 'react';

import type { DemoTheme } from '../App';
import { API_KEY, APP_ID, SEARCH_INDEX_NAME } from '../constants';

type Level = 'lvl0' | 'lvl1' | 'lvl2' | 'lvl3' | 'lvl4' | 'lvl5' | 'lvl6';
const LEVELS: Level[] = ['lvl0', 'lvl1', 'lvl2', 'lvl3', 'lvl4', 'lvl5', 'lvl6'];

const PAGES: Array<{ id: string; lvl0: string; lvl1: string; path: string }> = [
  { id: 'intro', lvl0: 'Getting started', lvl1: 'What is DocSearch?', path: '/docs/what-is-docsearch' },
  { id: 'install', lvl0: 'Getting started', lvl1: 'Installation', path: '/docs/docsearch' },
  { id: 'styling', lvl0: 'Getting started', lvl1: 'Styling', path: '/docs/styling' },
  { id: 'api', lvl0: 'Reference', lvl1: 'API reference', path: '/docs/api' },
  { id: 'migrate', lvl0: 'Reference', lvl1: 'Migrating from v4', path: '/docs/migrating-from-v4' },
];

function attribute(value: string | null): {
  value: string;
  matchLevel: 'none';
  matchedWords: string[];
} {
  return { value: value ?? '', matchLevel: 'none', matchedWords: [] };
}

function createHit(page: (typeof PAGES)[number], query: string): unknown {
  const hierarchy: Record<Level, string | null> = {
    lvl0: page.lvl0,
    lvl1: page.lvl1,
    lvl2: null,
    lvl3: null,
    lvl4: null,
    lvl5: null,
    lvl6: null,
  };
  const highlighted = Object.fromEntries(
    LEVELS.map((level) => [level, attribute(hierarchy[level])])
  );

  return {
    objectID: page.id,
    content: null,
    query,
    url: page.path,
    url_without_anchor: page.path,
    type: 'lvl1',
    anchor: null,
    hierarchy,
    _highlightResult: {
      content: attribute(null),
      hierarchy: highlighted,
      hierarchy_camel: [highlighted],
    },
    _snippetResult: {
      content: { value: '', matchLevel: 'none' },
      hierarchy: highlighted,
      hierarchy_camel: [highlighted],
    },
  };
}

function offlineSearchClient(
  client: DocSearchTransformClient
): DocSearchTransformClient {
  const search = (async (params: {
    requests: Array<{ indexName: string; query?: string }>;
  }) => ({
    results: params.requests.map((request) => {
      const query = request.query ?? '';
      const hits = query ? PAGES.map((page) => createHit(page, query)) : [];

      return {
        hits,
        nbHits: hits.length,
        index: request.indexName,
        query,
        params: '',
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        exhaustiveNbHits: true,
        processingTimeMS: 1,
      };
    }),
  })) as unknown as DocSearchTransformClient['search'];

  return { ...client, search };
}

export default function DefaultExperience({
  theme,
}: {
  theme: DemoTheme;
}): JSX.Element {
  return (
    <DocSearch
      indices={[SEARCH_INDEX_NAME]}
      appId={APP_ID}
      apiKey={API_KEY}
      theme={theme}
      transformSearchClient={offlineSearchClient}
    />
  );
}

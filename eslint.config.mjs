import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import nodeDependencies from 'eslint-plugin-node-dependencies';
import packageJson from 'eslint-plugin-package-json';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import vuoto from 'eslint-plugin-vuoto';
import globals from 'globals';
import * as jsoncParser from 'jsonc-eslint-parser';
import tseslint from 'typescript-eslint';
import js from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import eslintReact from '@eslint-react/eslint-plugin';

export default defineConfig([
  globalIgnores([
    // Node / JS / TS build & lock files
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/out/**',
    '**/out-tsc/**',
    '**/coverage/**',
    '**/.astro/**',
    '**/.next/**',
    '**/.nuxt/**',
    '**/.svelte-kit/**',
    '**/.turbo/**',
    '**/.pnpm/**',
    '**/.npm/**',
    '**/.yarn/**',
    '**/.pnp/**',
    '**/package-lock.json',
    '**/pnpm-lock.yaml',
    '**/yarn.lock',
    '**/bun.lockb',

    // Python environments and cache
    '**/__pycache__/**',
    '**/*.pyc',
    '**/*.pyo',
    '**/.mypy_cache/**',
    '**/.pytest_cache/**',
    '**/.tox/**',
    '**/.ruff_cache/**',
    '**/.venv/**',
    '**/venv/**',
    '**/env/**',
    '**/.ipynb_checkpoints/**',

    // Rust build artifacts
    '**/target/**',
    '**/.cargo/**',
    '**/Cargo.lock',

    // Go dependencies and cache
    '**/go.sum',
    '**/go.work',
    '**/go.work.sum',
    '**/vendor/**',
    '**/.gopath/**',
    '**/.cache/go-build/**',

    // Miscellaneous project artifacts
    '**/*LICENSE*',
    '**/*.log',
    '**/.cache/**',
    '**/.temp/**',
    '**/.tmp/**',
    '**/.DS_Store',
    '**/.idea/**',
    '**/.vscode/**',
    '**/.nx/**',
    '**/.cspell/**',
    '**/.cursor/**',
    '**/.agents/**',
    '**/.claude/**',
    '**/.devin/**',
    '**/.history/**',
    '**/.terraform/**',
    '**/.devcontainer/**',
    '**/.direnv/**',
    '**/.editorconfig',
    '**/.eslintcache',
    '**/.babelrc',
    '**/.prettier*',
    '**/.sass-cache/**',
    '**/.gradle/**',
    '**/.docker/**',
    '**/.kube/**',
    '**/.git/**',
    '**/.svn/**',
    '**/.hg/**',
    '**/.gemini/**',
    '**/.codacy/**',
    '.github/instructions/**',

    // Windows system artifacts
    '**/*:Zone.Identifier',
    '**/Thumbs.db',
    '**/desktop.ini',
    '**/$RECYCLE.BIN/**',
    '**/System Volume Information/**',
    '**/pagefile.sys',
    '**/swapfile.sys',
    '**/hiberfil.sys',

    // Other unsupported files
    '**/*.hbs',
  ]),

  // --- Common for JS/TS/JSX/TSX ---
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    plugins: {
      jsdoc,
      import: importPlugin,
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSort,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      unicorn.configs.recommended,
    ],
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Enforce structured and grouped imports using simple-import-sort
      'sort-imports': 'off',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // dotenv & dotenvx packages
            ['^@dotenvx/dotenvx', '^dotenv'],

            // Side-effect imports (e.g. polyfills)
            [String.raw`^\u0000`],

            // Env imports for React Native, Expo, etc.
            ['^@env'],

            // Node.js built-in modules
            [
              '^assert',
              '^buffer',
              '^child_process',
              '^cluster',
              '^console',
              '^constants',
              '^crypto',
              '^dgram',
              '^dns',
              '^domain',
              '^events',
              '^fs',
              '^http',
              '^https',
              '^inspector',
              '^module',
              '^net',
              '^os',
              '^path',
              '^perf_hooks',
              '^process',
              '^punycode',
              '^querystring',
              '^readline',
              '^repl',
              '^stream',
              '^string_decoder',
              '^timers',
              '^tls',
              '^tty',
              '^url',
              '^util',
              '^v8',
              '^vm',
              '^zlib',
            ],

            // Node.js built-in modules #2
            ['^node:'],

            // Node.js backend frameworks
            [
              '^@fastify',
              '^@hapi/hapi',
              '^@koa/koa',
              '^@nestjs',
              '^express',
              '^fastify',
              '^hapi',
              '^koa',
              '^loopback',
              '^nest',
              '^sails',
            ],

            // Node.js backend middlewares & utilities
            [
              '^body-parser',
              '^connect-redis',
              '^cookie-parser',
              '^cors',
              '^express-rate-limit',
              '^express-session',
              '^helmet',
              '^morgan',
              '^passport',
              '^pino-',
              '^redis',
              '^winston',
            ],

            // UI Frameworks (React, Vue, Svelte, etc.)
            ['^@angular', '^react', '^solid-js', '^svelte', '^vue'],

            // React specific packages
            [
              '^@tanstack/router',
              '^react-dom',
              '^react-helmet',
              '^react-intl',
              '^react-router',
              '^react-router-dom',
            ],

            // Full-stack/SSR frameworks (Next.js, Remix, etc.)
            ['^@nuxt/kit', '^@remix-run', '^@sveltejs/kit', '^gatsby', '^next'],

            // React Native & Expo
            [
              '^@expo',
              String.raw`^@expo\/`,
              '^@react-native',
              '^expo',
              '^expo-',
              '^react-native',
              '^react-navigation',
            ],

            // State management libraries
            [
              '^@reduxjs/toolkit',
              '^jotai',
              '^mobx',
              '^recoil',
              '^redux',
              '^valtio',
              '^zustand',
            ],

            // Data-fetching libraries
            [
              '^@apollo/client',
              '^@tanstack/react-query',
              '^axios',
              '^graphql',
              '^swr',
            ],

            // UI libraries & design systems
            [
              '^@chakra-ui',
              '^@headlessui/react',
              '^@lottiefiles',
              '^@material-ui',
              '^@mui',
              '^@nextui-org/react',
              '^@radix-ui',
              '^@pittorica/pitto',
              '^radix-ui',
              '^antd',
              '^framer-motion',
              '^native-base',
              '^react-native-paper',
              '^shadcn-ui',
              '^tailwindcss',
            ],

            // CSS-in-JS & utility libraries
            [
              '^@emotion',
              '^class-variance-authority',
              '^clsx',
              '^lucide-react',
              '^styled-components',
              '^tailwind-merge',
              '^twin.macro',
              '^tw-animate-css',
            ],

            // Common icon packages
            [
              String.raw`^@expo\/vector-icons`,
              '^@fortawesome',
              '^@tabler/icons-react',
              '^lucide',
              '^react-feather',
              '^react-icons',
              '^react-native-feather',
              '^react-native-vector-icons',
            ],

            // Testing libraries and utilities
            [
              '^@testing-library',
              '^cypress',
              '^jest',
              '^playwright',
              '^vitest',
            ],

            // Generic third-party packages (npm scope and plain)
            ['^[a-z]', String.raw`^@\w`],

            // Monorepo/workspace scoped packages
            ['@org/', '^@my-org/', '^@workspace/', '^@repo/'],

            // Asset imports (images, fonts, etc.)
            [
              String.raw`^.+\.(avi|mkv|mov|mp4|webm)$`,
              String.raw`^.+\.(mp3|ogg|wav|weba)$`,
              String.raw`^.+\.(gif|jpe?g|png|svg|webp)$`,
              String.raw`^.+\.lottie$`,
              String.raw`^.+\.(eot|otf|ttf|woff|woff2)$`,
            ],

            // JSON files
            [String.raw`^.+\.json$`],

            // Stylesheets (css, scss, less, etc.)
            [String.raw`^.+\.less$`, String.raw`^.+\.s?css$`],

            // Relative imports (parent, sibling, current)
            [String.raw`^\.?\.\/`],
          ],
        },
      ],

      'unicorn/no-null': 'off',
      'unicorn/name-replacements': 'off',
      'unicorn/prevent-abbreviations': 'off',
    },
  },

  // --- Node.js Specifics (TS/JS files) ---
  {
    files: ['**/*.{ts,js,mts,mjs,cts,cjs}'],
    ignores: ['**/*.{tsx,jsx}'],
    extends: [
      nodeDependencies.configs['flat/recommended'],
      jsdoc.configs['flat/contents-typescript-flavor'],
      jsdoc.configs['flat/logical-typescript-flavor'],
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
          },
        },
      ],
      'jsdoc/require-description': 'warn',
    },
  },

  // --- React Specifics (TSX/JSX files) ---
  {
    files: ['**/*.{tsx,jsx}'],
    extends: [eslintReact.configs['recommended-typescript']],
    languageOptions: {
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2022 },
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Filename case OFF for React components
      'unicorn/filename-case': 'off',
      // JSDoc OFF for React components
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-description': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/check-tag-names': 'off',
    },
  },

  // --- CommonJS Overrides ---
  {
    files: ['**/*.{cjs,cts}'],
    languageOptions: { globals: { ...globals.commonjs } },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'unicorn/prefer-module': 'off',
    },
  },

  // JSON files
  {
    files: ['**/*.json'],
    plugins: { json: json },
    language: 'json/json',
    extends: ['json/recommended'],
    languageOptions: { parser: jsoncParser },
    rules: {
      'prettier/prettier': 'off',
    },
  },
  {
    files: ['**/*.json5'],
    plugins: { json: json },
    language: 'json/json5',
    extends: ['json/recommended'],
    languageOptions: { parser: jsoncParser },
  },
  {
    files: ['**/*.jsonc', '**/tsconfig*.json', '**/.vscode/**/*.json'],
    plugins: { json: json },
    language: 'json/jsonc',
    extends: ['json/recommended'],
    languageOptions: { parser: jsoncParser },
  },
  {
    files: ['**/package.json'],
    plugins: { json: json, 'package-json': packageJson },
    language: 'json/json',
    extends: [packageJson.configs.recommended],
    languageOptions: { parser: jsoncParser },
    rules: {
      'package-json/order-properties': 'error',
      'package-json/sort-collections': 'error',
      'package-json/require-description': 'error',
      'package-json/require-bugs': 'error',
      'package-json/require-keywords': 'error',
      'package-json/require-name': 'error',
      'package-json/require-version': 'error',
      'package-json/valid-description': 'error',
      'package-json/valid-license': 'error',
      'package-json/valid-name': 'error',
      'package-json/valid-version': 'error',
      'prettier/prettier': 'off',
    },
  },

  // Markdown files
  {
    files: ['**/*.md'],

    plugins: { markdown: markdown },
    language: 'markdown/gfm',
    extends: ['markdown/recommended'],
    rules: {
      'markdown/no-missing-label-refs': [
        'error',
        {
          allowLabels: ['!NOTE', '!TIP', '!IMPORTANT', '!WARNING', '!CAUTION'],
        },
      ],
    },
  },

  // whitespace fixes
  {
    plugins: {
      vuoto,
    },
  },
  vuoto.configs.all,

  prettierRecommended,
]);

import type { SnapConfig } from '@metamask/snaps-cli';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

/* eslint-disable n/no-process-env */

dotenv.config();

const config: SnapConfig = {
  bundler: 'webpack',
  input: resolve(__dirname, 'src/index.tsx'),
  server: {
    port: 8000,
  },
  polyfills: {
    buffer: true,
    crypto: true,
  },
  environment: {
    REFERER: process.env.REFERER,
  },
};

export default config;

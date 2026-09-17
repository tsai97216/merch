import app from './index';
import { deleteR2Asset, getR2Asset, putR2Asset } from './r2-assets';

interface Env {
  ALLOWED_ORIGIN: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
  GITHUB_TOKEN: string;
  ADMIN_SECRET: string;
  MERCH_ASSETS: R2Bucket;
}

type AssetRequest = { path?: unknown; content?: unknown };

const WORKER_VERSION = '1.109.820';
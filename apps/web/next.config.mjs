import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Se despliega como servidor Node propio (sharp, subidas grandes, IA de fondos): NO es hosting estático.
  output: 'standalone',
  outputFileTracingRoot: root,
  transpilePackages: ['@nalv/shared'],
  serverExternalPackages: ['sharp', '@prisma/client'],
  experimental: { serverActions: { bodySizeLimit: '25mb' } },
};
export default nextConfig;

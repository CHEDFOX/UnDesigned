// Finds and loads brands from products/<id>/ (folders starting with "_" are templates).

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export function listBrands(root) {
  const dir = join(root, 'products');
  return readdirSync(dir)
    .filter((id) => !id.startsWith('_') && !id.startsWith('.') && existsSync(join(dir, id, 'brand.json')))
    .sort();
}

export function loadBrand(root, id) {
  const dir = join(root, 'products', id);
  if (!existsSync(join(dir, 'brand.json'))) throw new Error(`No brand "${id}". Brands: ${listBrands(root).join(', ')}`);
  const config = JSON.parse(readFileSync(join(dir, 'brand.json'), 'utf8'));
  for (const key of ['name', 'prefix', 'approach']) if (!config[key]) throw new Error(`products/${id}/brand.json is missing "${key}"`);
  return { id, dir, config };
}

/** The brand a file belongs to, from its path (products/<id>/...), or null. */
export function brandOfPath(root, file) {
  const parts = relative(root, file).split(sep);
  return parts[0] === 'products' && parts[1] && !parts[1].startsWith('_') ? parts[1] : null;
}

/** All *.copy.json files under a directory. */
export function copyFiles(p, out = []) {
  if (!existsSync(p)) return out;
  if (statSync(p).isDirectory()) {
    for (const f of readdirSync(p)) if (!f.startsWith('.') && f !== 'node_modules') copyFiles(join(p, f), out);
  } else if (p.endsWith('.copy.json')) out.push(p);
  return out;
}

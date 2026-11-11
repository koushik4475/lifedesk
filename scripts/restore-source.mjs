import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const chunks = ['00', '01', '02', '03', '04', '05', '06'];
const encoded = chunks.map((part) =>
  readFileSync(resolve(root, '.source', 'chunk' + part + '.txt'), 'utf8').trim()
).join('');
const archive = gunzipSync(Buffer.from(encoded, 'base64'));

function readField(buffer, start, length) {
  const value = buffer.subarray(start, start + length).toString('utf8');
  const nul = value.indexOf(String.fromCharCode(0));
  return nul < 0 ? value : value.slice(0, nul);
}

let offset = 0;
let restored = 0;
while (offset + 512 <= archive.length) {
  const header = archive.subarray(offset, offset + 512);
  if (header.every((byte) => byte === 0)) break;

  const name = readField(header, 0, 100);
  const prefix = readField(header, 345, 155);
  let relativePath = prefix ? prefix + '/' + name : name;
  if (relativePath.startsWith('./')) relativePath = relativePath.slice(2);
  const sizeText = readField(header, 124, 12).trim();
  const size = sizeText ? Number.parseInt(sizeText, 8) : 0;
  const type = header[156] === 0 ? '0' : String.fromCharCode(header[156]);
  const destination = resolve(root, relativePath);

  if (destination !== root && !destination.startsWith(root + sep)) {
    throw new Error('Refusing unsafe source archive path: ' + relativePath);
  }
  if (!Number.isSafeInteger(size) || size < 0 || offset + 512 + size > archive.length) {
    throw new Error('Invalid source archive entry: ' + relativePath);
  }

  if (type === '5' || relativePath.endsWith('/')) {
    mkdirSync(destination, { recursive: true });
  } else if (type === '0') {
    // Preserve this bootstrap workflow until it has completed the verified source commit.
    if (relativePath !== '.github/workflows/ci.yml') {
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, archive.subarray(offset + 512, offset + 512 + size));
      restored += 1;
    }
  } else {
    throw new Error('Unsupported source archive entry type ' + type + ' at ' + relativePath);
  }
  offset += 512 + Math.ceil(size / 512) * 512;
}

const appPath = resolve(root, 'src/App.tsx');
if (!restored || !readFileSync(appPath, 'utf8').includes('function App')) {
  throw new Error('LifeDesk sources were not restored correctly.');
}
console.log('Restored ' + restored + ' LifeDesk source files from the source bundle.');

import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(resolve(__dirname, '../public/icon-source.svg'))
const iconsDir = resolve(__dirname, '../public/icons')

const icons = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'icon-512-maskable.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180, dest: resolve(__dirname, '../public') },
]

for (const icon of icons) {
  const dest = icon.dest ?? iconsDir
  await sharp(src)
    .resize(icon.size, icon.size)
    .png()
    .toFile(`${dest}/${icon.file}`)
  console.log(`✓ ${icon.file}`)
}

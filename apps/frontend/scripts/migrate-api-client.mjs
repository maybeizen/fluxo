import fs from 'fs'
import path from 'path'

const root = 'src/lib'

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    return entries.flatMap((e) => {
        const p = path.join(dir, e.name)
        return e.isDirectory() ? walk(p) : p.endsWith('.ts') && p !== 'src/lib/api-client.ts' ? [p] : []
    })
}

for (const file of walk(root)) {
    let content = fs.readFileSync(file, 'utf8')
    if (!content.includes('axios') && !content.includes('NEXT_PUBLIC_API_URL') && !content.includes('API_URL')) {
        continue
    }

    content = content.replace(/import axios from 'axios'\n/g, "import { apiClient } from '@/lib/api-client'\n")
    content = content.replace(
        /const API_URL =\s*\n?\s*process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:5001\/api\/v1'\n\n?/g,
        ''
    )
    content = content.replace(/\baxios\./g, 'apiClient.')
    content = content.replace(/\$\{API_URL\}/g, '')
    content = content.replace(
        /,\s*\{\s*withCredentials:\s*true\s*\}/g,
        ''
    )
    content = content.replace(
        /apiClient\.(get|post|patch|delete|put)\(([^,\n]+),\s*\{\s*withCredentials:\s*true,\s*/g,
        'apiClient.$1($2, {'
    )
    content = content.replace(
        /`\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g,
        '`'
    )

    fs.writeFileSync(file, content)
    console.log('migrated', file)
}

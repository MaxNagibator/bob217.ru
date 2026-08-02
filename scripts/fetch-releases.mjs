import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const OWNER = 'MaxNagibator'
const OUT = fileURLToPath(new URL('../src/assets/data/releases.json', import.meta.url))

const QUERY = `query($login: String!, $cursor: String) {
  user(login: $login) {
    repositories(first: 50, isFork: false, after: $cursor, orderBy: {field: PUSHED_AT, direction: DESC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        name
        url
        primaryLanguage { name }
        releases(first: 40, orderBy: {field: CREATED_AT, direction: DESC}) {
          totalCount
          nodes {
            tagName
            name
            url
            publishedAt
            isPrerelease
            isDraft
            author { login }
            releaseAssets(first: 30) {
              nodes { name size downloadCount }
            }
          }
        }
      }
    }
  }
}`

const token = () => {
  const fromEnv = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  if (fromEnv) return fromEnv
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim()
  } catch {
    return null
  }
}

const query = async (auth, cursor) => {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { login: OWNER, cursor } }),
  })
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}`)
  const body = await res.json()
  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join('; '))
  return body.data.user.repositories
}

const toRelease = (node) => ({
  tag: node.tagName,
  title: node.name || node.tagName,
  url: node.url,
  at: node.publishedAt,
  pre: node.isPrerelease,
  author: node.author?.login ?? OWNER,
  assets: node.releaseAssets.nodes.map((a) => ({
    name: a.name,
    size: a.size,
    downloads: a.downloadCount,
  })),
})

const toRepo = (node) => {
  const releases = node.releases.nodes.filter((r) => !r.isDraft && r.publishedAt).map(toRelease)
  return {
    name: node.name,
    url: node.url,
    lang: node.primaryLanguage?.name ?? '',
    total: node.releases.totalCount,
    releases,
  }
}

const main = async () => {
  const auth = token()
  if (!auth) {
    console.warn('fetch-releases: нет GITHUB_TOKEN и gh auth token – снапшот оставлен как есть')
    return
  }

  const nodes = []
  for (let cursor = null; ; ) {
    const page = await query(auth, cursor)
    nodes.push(...page.nodes)
    if (!page.pageInfo.hasNextPage) break
    cursor = page.pageInfo.endCursor
  }

  const repos = nodes
    .map(toRepo)
    .filter((r) => r.releases.length)
    .sort((a, b) => (b.releases[0]?.at ?? '').localeCompare(a.releases[0]?.at ?? ''))

  const snapshot = {
    generatedAt: new Date().toISOString(),
    repos,
  }

  writeFileSync(OUT, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')

  const releases = repos.reduce((sum, r) => sum + r.releases.length, 0)
  console.log(`fetch-releases: ${repos.length} проектов, ${releases} релизов -> ${OUT}`)
}

main().catch((e) => {
  console.warn(`fetch-releases: ${e.message} – снапшот оставлен как есть`)
})

export interface ReleaseAsset {
  name: string
  size: number
  downloads: number
}

export interface Release {
  tag: string
  title: string
  url: string
  at: string
  pre: boolean
  author: string
  assets: readonly ReleaseAsset[]
}

export interface ReleaseRepo {
  name: string
  url: string
  lang: string
  total: number
  releases: readonly Release[]
}

export interface ReleasesSnapshot {
  generatedAt: string
  repos: readonly ReleaseRepo[]
}

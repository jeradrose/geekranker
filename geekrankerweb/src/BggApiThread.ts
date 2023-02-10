export interface BggThreadResult {
  thread: BggThread,
}

export interface BggThread {
  subject: string,
  articles: BggThreadArticles[],
}

export interface BggThreadArticles {
  article: BggThreadArticle[],
}

export interface BggThreadArticle {
  body: string[],
}

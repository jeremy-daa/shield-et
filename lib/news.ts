import { articles as decoyArticles } from "../content/news/decoy";

export interface NewsArticle {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  image_url: string;
  published_at: string;
  source: string;
  categories: string[];
}

const getDecoyNews = (): NewsArticle[] => {
    return decoyArticles.map(article => ({
        uuid: `decoy-${article.id}`,
        title: article.title,
        description: article.summary,
        snippet: article.summary,
        url: article.url,
        image_url: article.image,
        published_at: new Date().toISOString(), // Fresh date
        source: article.source,
        categories: ['general']
    }));
};

export const getNews = async (customParams = {}): Promise<NewsArticle[]> => {
  const apiKey = process.env.NEWS_DATA_IO_API_KEY;
  if (!apiKey) {
      console.warn("[NewsData.io] API Key missing. Using fallback.");
      return getDecoyNews();
  }

  const endpoint = 'https://newsdata.io/api/1/news';
  
  const params = {
    apikey: apiKey,
    q: 'Ethiopia OR Africa', // Focus on region
    language: 'en',      // English content
    ...customParams
  };

  const queryString = new URLSearchParams(params).toString();

  try {
    const res = await fetch(`${endpoint}?${queryString}`, {
      next: { 
        revalidate: 7200 // 2 hours cache
      } 
    });

    if (!res.ok) {
        console.warn(`[NewsData.io] Failed to fetch: ${res.status} ${res.statusText}. Using fallback.`);
        return getDecoyNews();
    }

    const json = await res.json();
    if (!json.results || json.results.length === 0) {
        console.warn(`[NewsData.io] No data returned. Using fallback.`);
        return getDecoyNews();
    }

    // Map NewsData.io format to our internal NewsArticle format
    const articles: NewsArticle[] = json.results.map((item: any) => ({
        uuid: item.article_id || Math.random().toString(36),
        title: item.title,
        description: item.description || item.content?.substring(0, 150) + '...',
        snippet: item.description || '',
        url: item.link,
        image_url: item.image_url, 
        published_at: item.pubDate,
        source: item.source_id || 'News',
        categories: item.category || []
    }));

    return articles;

  } catch (error) {
    console.error('[NewsData.io] Error:', error);
    return getDecoyNews(); 
  }
};

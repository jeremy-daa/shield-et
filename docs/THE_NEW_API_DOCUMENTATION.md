# TheNewsAPI Integration Documentation

**Base URL:** `https://api.thenewsapi.com/v1`  
**Plan:** Free Tier  
**Rate Limit:** 100 requests / day  
**Volume Limit:** 3 articles / request

---

## 1. Authentication
Authentication is handled via a static API token included as a query parameter in every request.

* **Parameter:** `api_token`
* **Security Note:** Never expose this token on the client side. Proxy all requests through your Next.js server (e.g., `getServerSideProps` or Route Handlers).

---

## 2. Endpoints

### A. Top Stories (Recommended for Home Page)
Returns the current trending news. This is the most "convincing" endpoint for a camouflage homepage.

`GET /news/top`

### B. All News (Search & Discovery)
Returns the full database of articles. Use this if you need to filter by specific keywords or dates.

`GET /news/all`

---

## 3. Query Parameters

These parameters customize the news feed. You can combine them to target specific audiences (e.g., "Sports in Ethiopia" or "Tech in the US").

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `api_token` | `string` | **Yes** | Your unique API key. |
| `locale` | `string` | No | The 2-letter country code (ISO 3166-1). <br> **Examples:** `et` (Ethiopia), `us` (USA), `gb` (UK), `in` (India). |
| `language` | `string` | No | The 2-letter language code. <br> **Examples:** `en`, `es`, `fr`. |
| `categories` | `string` | No | Comma-separated list of topics. <br> **Options:** `general`, `science`, `sports`, `business`, `health`, `entertainment`, `tech`, `politics`, `food`, `travel`. |
| `search` | `string` | No | specific keywords to filter by. |
| `limit` | `int` | No | Number of articles to return. **Max: 3** (Free Plan). |
| `page` | `int` | No | Pagination cursor (1, 2, 3...). |

---

## 4. Next.js Integration Example

Use this configuration to fetch data server-side. This includes revalidation to prevent hitting your 100-request daily limit.

```javascript
// lib/news.js or app/api/news/route.js

export const getNews = async (customParams = {}) => {
  const endpoint = '[https://api.thenewsapi.com/v1/news/top](https://api.thenewsapi.com/v1/news/top)';
  
  const params = {
    api_token: process.env.NEWS_API_KEY,
    locale: 'et',       // Default to Ethiopia context
    language: 'en',     // Default language
    limit: 3,           // Max allowed by Free tier
    ...customParams
  };

  const queryString = new URLSearchParams(params).toString();

  try {
    const res = await fetch(`${endpoint}?${queryString}`, {
      // Cache Strategy: Revalidate every 2 hours (7200s)
      // 24 hours / 2 hours = 12 requests per day (well within 100 limit)
      next: { 
        revalidate: 7200 
      } 
    });

    if (!res.ok) throw new Error('News fetch failed');

    return await res.json();
  } catch (error) {
    console.error('News API Error:', error);
    return null; 
  }
};
5. Response Structure
The API returns a JSON object with a meta field for pagination and a data array containing the articles.

JSON
{
  "meta": {
    "found": 3502,
    "returned": 3,
    "limit": 3,
    "page": 1
  },
  "data": [
    {
      "uuid": "8a342b...",
      "title": "Example News Headline",
      "description": "Brief summary of the article content...",
      "keywords": "tech, ai, startup",
      "snippet": "Full snippet of the text...",
      "url": "[https://original-source.com/article](https://original-source.com/article)",
      "image_url": "[https://original-source.com/image.jpg](https://original-source.com/image.jpg)",
      "language": "en",
      "published_at": "2024-05-20T14:30:00.000000Z",
      "source": "TechCrunch",
      "categories": [
        "tech",
        "business"
      ],
      "relevance_score": null
    }
  ]
}
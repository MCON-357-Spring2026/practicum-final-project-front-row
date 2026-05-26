/**
 * This file searches Unsplash for stock photos (chapter covers, scrapbook backgrounds).
 * Set UNSPLASH_ACCESS_KEY in the environment.
 */

const UNSPLASH_SEARCH_URL = 'https://api.unsplash.com/search/photos';

function ensureUnsplashConfigured() {
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    const error = new Error('Unsplash is not configured');
    error.status = 503;
    throw error;
  }
}

/**
 * Returns a small list of photo results for a search query.
 */
export async function searchPhotos(query) {
  ensureUnsplashConfigured();

  if (!query?.trim()) {
    const error = new Error('query is required');
    error.status = 400;
    throw error;
  }

  const url = new URL(UNSPLASH_SEARCH_URL);
  url.searchParams.set('query', query.trim());
  url.searchParams.set('per_page', '12');

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
    },
  });

  if (!response.ok) {
    const error = new Error('Unsplash request failed');
    error.status = 502;
    throw error;
  }

  const data = await response.json();

  return {
    results: data.results.map((photo) => ({
      id: photo.id,
      description: photo.description || photo.alt_description,
      url: photo.urls.small,
      fullUrl: photo.urls.regular,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
    })),
  };
}

const API_BASE = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_BASE_URL;

const ENDPOINTS = {
  STORIES: `${API_BASE}/v1/stories`,
};

export async function getStories() {
  const token = localStorage.getItem('token');
  console.log('Attempting to get stories (from api.js) with endpoint:', ENDPOINTS.STORIES);
  const response = await fetch(ENDPOINTS.STORIES, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    console.error('Failed to get stories (from api.js):', result);
    throw new Error(result.message);
  }
  console.log('Successfully fetched stories (from api.js).');
  return result.listStory;
}

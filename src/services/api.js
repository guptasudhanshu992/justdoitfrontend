/**
 * API Service for JustDoit Blog
 * Handles all communication with the FastAPI backend
 */

//const API_BASE_URL = 'http://localhost:8000/api/v1/api';

//export const API_BASE_URL = 'https://api.priceactionrepository.com/api/v1/api';
//export const API_BASE_DOMAIN = 'https://api.priceactionrepository.com';

export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1/api';
export const API_BASE_DOMAIN = 'http://127.0.0.1:8000';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle no content response (DELETE)
    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================================================
// BLOG POSTS API
// ============================================================================

export const blogsApi = {
  /**
   * Get all blog posts
   * @param {Object} params - Query parameters
   * @param {number} params.skip - Number of posts to skip
   * @param {number} params.limit - Number of posts to return
   * @param {boolean} params.published_only - Return only published posts
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.published_only) queryParams.append('published_only', params.published_only);
    
    const queryString = queryParams.toString();
    return fetchApi(`/blogs${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get a single blog post by ID
   * @param {number} id - Blog post ID
   */
  getById: async (id) => {
    return fetchApi(`/blogs/${id}`);
  },

  /**
   * Get a single blog post by slug
   * @param {string} slug - Blog post slug
   */
  getBySlug: async (slug) => {
    return fetchApi(`/blogs/slug/${slug}`);
  },

  /**
   * Create a new blog post
   * @param {Object} blogData - Blog post data
   */
  create: async (blogData) => {
    return fetchApi('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  },

  /**
   * Update an existing blog post
   * @param {number} id - Blog post ID
   * @param {Object} blogData - Updated blog post data
   */
  update: async (id, blogData) => {
    return fetchApi(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  },

  /**
   * Delete a blog post
   * @param {number} id - Blog post ID
   */
  delete: async (id) => {
    return fetchApi(`/blogs/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// CATEGORIES API
// ============================================================================

export const categoriesApi = {
  /**
   * Get all categories
   * @param {Object} params - Query parameters
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString();
    return fetchApi(`/categories${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get a single category by ID
   * @param {number} id - Category ID
   */
  getById: async (id) => {
    return fetchApi(`/categories/${id}`);
  },

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   */
  create: async (categoryData) => {
    return fetchApi('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  /**
   * Update an existing category
   * @param {number} id - Category ID
   * @param {Object} categoryData - Updated category data
   */
  update: async (id, categoryData) => {
    return fetchApi(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  /**
   * Delete a category
   * @param {number} id - Category ID
   */
  delete: async (id) => {
    return fetchApi(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// TAGS API
// ============================================================================

export const tagsApi = {
  /**
   * Get all tags
   * @param {Object} params - Query parameters
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString();
    return fetchApi(`/tags${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get a single tag by ID
   * @param {number} id - Tag ID
   */
  getById: async (id) => {
    return fetchApi(`/tags/${id}`);
  },

  /**
   * Create a new tag
   * @param {Object} tagData - Tag data
   */
  create: async (tagData) => {
    return fetchApi('/tags', {
      method: 'POST',
      body: JSON.stringify(tagData),
    });
  },

  /**
   * Update an existing tag
   * @param {number} id - Tag ID
   * @param {Object} tagData - Updated tag data
   */
  update: async (id, tagData) => {
    return fetchApi(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tagData),
    });
  },

  /**
   * Delete a tag
   * @param {number} id - Tag ID
   */
  delete: async (id) => {
    return fetchApi(`/tags/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// MEDIA API
// ============================================================================

export const mediaApi = {
  /**
   * Get all media files
   * @param {Object} params - Query parameters
   * @param {string} params.folder - Filter by folder (images, videos)
   * @param {number} params.limit - Maximum number of items to return
   * @param {string} params.continuation_token - Token for pagination
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.folder) queryParams.append('folder', params.folder);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.continuation_token) queryParams.append('continuation_token', params.continuation_token);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_DOMAIN}/api/v1/api/media/list${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch media');
    }
    
    return data;
  },

  /**
   * Upload an image
   * @param {File} file - The file to upload
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = `${API_BASE_DOMAIN}/api/v1/api/media/upload/image`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to upload image');
    }
    
    return data;
  },

  /**
   * Upload a video
   * @param {File} file - The file to upload
   */
  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = `${API_BASE_DOMAIN}/api/v1/api/media/upload/video`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to upload video');
    }
    
    return data;
  },

  /**
   * Upload any allowed file
   * @param {File} file - The file to upload
   */
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = `${API_BASE_DOMAIN}/api/v1/api/media/upload/file`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to upload file');
    }
    
    return data;
  },

  /**
   * Delete a media file
   * @param {string} key - The object key to delete
   */
  delete: async (key) => {
    const url = `${API_BASE_DOMAIN}/api/v1/api/media/${encodeURIComponent(key)}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete media');
    }
    
    return data;
  },
};

// Export all APIs
export default {
  blogs: blogsApi,
  categories: categoriesApi,
  tags: tagsApi,
  media: mediaApi,
};

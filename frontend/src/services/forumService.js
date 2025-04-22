// frontend/src/services/forumService.js
import api from './api';

export const fetchPosts = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  return await api.get(`/forum?${params.toString()}`);
};

export const fetchPostById = async (id) => {
    return await api.get(`/forum/${id}`);
  };
  
export const createPost = async (postData) => {
return await api.post('/forum', postData);
};

export const addComment = async (postId, comment) => {
return await api.post(`/forum/${postId}/comments`, { content: comment });
};

export const likePost = async (postId) => {
return await api.put(`/forum/${postId}/like`);
};
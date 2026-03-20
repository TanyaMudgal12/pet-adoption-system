import API from './axios'

// ─── Auth ───────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data)
export const loginUser = (data) => API.post('/auth/login', data)
export const getMe = () => API.get('/auth/me')
export const updateProfile = (data) => API.put('/auth/me', data)
export const getNotifications = () => API.get('/auth/notifications')
export const markNotificationsRead = () => API.put('/auth/notifications/read')

// ─── Pets ────────────────────────────────────────────
export const getPets = (params) => API.get('/pets', { params })
export const getPetById = (id) => API.get(`/pets/${id}`)
export const getAllPetsAdmin = (params) => API.get('/pets/admin/all', { params })

export const createPet = (formData) =>
  API.post('/pets', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const updatePet = (id, formData) =>
  API.put(`/pets/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const deletePet = (id) => API.delete(`/pets/${id}`)

// ─── Adoptions ───────────────────────────────────────
export const applyForAdoption = (data) => API.post('/adoptions', data)
export const getMyAdoptions = () => API.get('/adoptions/my')
export const getAllAdoptions = (params) => API.get('/adoptions', { params })
export const getAdoptionById = (id) => API.get(`/adoptions/${id}`)
export const reviewAdoption = (id, data) => API.put(`/adoptions/${id}/review`, data)
export const deleteAdoption = (id) => API.delete(`/adoptions/${id}`)
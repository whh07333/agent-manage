import axios from '../utils/axios';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '../types/projects';

export const getProjects = async (params?: { page?: number; page_size?: number }) => {
  return await axios.get<{ list: Project[]; total: number }>('/projects', { params });
};

export const getProject = async (id: string) => {
  return await axios.get<Project>(`/projects/${id}`);
};

export const createProject = async (data: CreateProjectRequest) => {
  return await axios.post<Project>('/projects', data);
};

export const updateProject = async (id: string, data: UpdateProjectRequest) => {
  return await axios.put<Project>(`/projects/${id}`, data);
};

export const deleteProject = async (id: string) => {
  return await axios.delete(`/projects/${id}`);
};

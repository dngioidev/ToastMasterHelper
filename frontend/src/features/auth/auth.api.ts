import { api } from '../../lib/api';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  data: {
    access_token: string;
    username: string;
  };
}

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', payload);
  return response.data;
}

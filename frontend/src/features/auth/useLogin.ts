import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './auth.store';
import { loginApi, LoginPayload } from './auth.api';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginApi(payload),
    onSuccess: (response) => {
      setAuth(response.data.access_token, response.data.username);
      navigate('/');
    },
  });
}

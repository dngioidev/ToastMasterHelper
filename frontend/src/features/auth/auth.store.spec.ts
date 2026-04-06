import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, username: null });
  });

  it('should have null token initially', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.token).toBeNull();
  });

  it('should set auth on setAuth call', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setAuth('test-token', 'admin');
    });
    expect(result.current.token).toBe('test-token');
    expect(result.current.username).toBe('admin');
  });

  it('should clear auth on logout', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setAuth('test-token', 'admin');
    });
    act(() => {
      result.current.logout();
    });
    expect(result.current.token).toBeNull();
    expect(result.current.username).toBeNull();
  });
});

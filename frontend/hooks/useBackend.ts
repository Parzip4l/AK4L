import { useAuth } from '../contexts/AuthContext';
import backend from '~backend/client';

export function useBackend() {
  const { token } = useAuth();
  
  // For now, return the backend client directly
  // Authentication will be handled via auth middleware in the backend
  return backend;
}

import axios from 'axios';
import { envs } from '../../config/envs.js';

const normalizeBaseUrl = (baseUrl) => {
  if (!baseUrl) return '';
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const normalizePath = (path) => {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
};

export const hasPermission = async ({ authorizationHeader, resource, method }) => {
  const baseUrl = normalizeBaseUrl(envs.SECURITY_BASE_URL);
  const path = normalizePath(envs.SECURITY_HAS_PERMISSION_PATH || '/api/seguridad/auth/hasPermission');

  if (!baseUrl) {
    const err = new Error('SECURITY_BASE_URL no está configurado');
    err.code = 'SECURITY_NOT_CONFIGURED';
    throw err;
  }

  const url = `${baseUrl}${path}`;

  return axios.post(
    url,
    { resource, method },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorizationHeader,
      },
      validateStatus: () => true,
    }
  );
};

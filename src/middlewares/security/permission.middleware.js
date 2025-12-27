import { hasPermission } from '../../services/security/security.service.js';
import { HttpError } from '../../utils/httpError.js';

const getAuthorizationHeader = (req) => {
  const header = req.headers?.authorization;
  if (!header || typeof header !== 'string') return null;
  return header;
};

export const requirePermission = (resource, method) => {
  if (!resource || !method) {
    throw new Error('requirePermission(resource, method) requiere ambos parámetros');
  }

  return async (req, res, next) => {
    try {
      const authorizationHeader = getAuthorizationHeader(req);
      if (!authorizationHeader || !authorizationHeader.toLowerCase().startsWith('bearer ')) {
        return next(new HttpError(401, 'Token de sesión requerido'));
      }

      const response = await hasPermission({ authorizationHeader, resource, method });

      if (response.status === 200 && response.data?.hasPermission === true) {
        return next();
      }

      if (response.status === 200 && response.data?.hasPermission === false) {
        return next(new HttpError(403, 'No tiene permisos para realizar esta acción'));
      }

      if (response.status === 401) {
        return next(new HttpError(401, 'Token inválido o expirado'));
      }

      if (response.status === 403) {
        return next(new HttpError(403, 'No tiene permisos para realizar esta acción'));
      }

      return next(
        new HttpError(503, 'No se pudo validar permisos con el módulo de seguridad', {
          upstreamStatus: response.status,
        })
      );
    } catch (err) {
      if (err?.code === 'SECURITY_NOT_CONFIGURED') {
        return next(new HttpError(500, err.message));
      }

      return next(new HttpError(503, 'Error consultando módulo de seguridad'));
    }
  };
};

<!-- @format -->

# Middleware de Seguridad: `requirePermission`

Este middleware se encarga de proteger los endpoints del Módulo de Cocina validando los permisos del usuario contra el Módulo de Seguridad.

## ¿Cómo funciona?

1. Intercepta el request y busca el token `Bearer` en el header `Authorization`.
2. Consulta al Módulo de Seguridad (`POST /api/seguridad/auth/hasPermission`) enviando el token, el `resource` y el `method` requeridos.
3. Si el usuario tiene permiso, permite el paso (`next()`).
4. Si no tiene permiso o el token es inválido, responde con error `403` o `401`.

## Configuración Previa

Asegúrate de tener las siguientes variables en tu archivo `.env`:

```bash
# URL base donde corre el módulo de seguridad
SECURITY_BASE_URL=http://localhost:4000

# (Opcional) Path para validar permisos, por defecto es este:
SECURITY_HAS_PERMISSION_PATH=/api/seguridad/auth/hasPermission
```

## Cómo usarlo

Importa el middleware en tus archivos de rutas y aplícalo antes del controlador que deseas proteger.

```javascript
import { Router } from 'express';
import { requirePermission } from '../../middlewares/security/permission.middleware.js';
import * as myController from '../../controllers/my.controller.js';

const router = Router();

// Ejemplo: Proteger la creación de una receta
router.post(
	'/recipes',
	requirePermission('Recipe_cocina', 'Create'), // <--- AQUÍ
	myController.createRecipe
);

// Ejemplo: Proteger la lectura de inventario
router.get(
	'/inventory',
	requirePermission('InventoryItem_cocina', 'Read'),
	myController.listItems
);
```

## Recursos y Métodos Disponibles

Debes usar **exactamente** los nombres de recursos definidos para el módulo de Cocina.

### Métodos

-   `Create`
-   `Read`
-   `Update`
-   `Delete`
-   `All` (Permite todo)

### Recursos (Tablas)

| Recurso (String exacto)    | Tabla que protege             |
| -------------------------- | ----------------------------- |
| `KitchenCategory_cocina`   | Categorías de cocina          |
| `KitchenProduct_cocina`    | Productos de cocina (Platos)  |
| `Recipe_cocina`            | Recetas                       |
| `InventoryItem_cocina`     | Ítems de inventario           |
| `InventoryLog_cocina`      | Logs de inventario            |
| `KitchenAsset_cocina`      | Activos (equipos, utensilios) |
| `AssetLog_cocina`          | Logs de activos               |
| `KitchenStaff_cocina`      | Personal de cocina            |
| `StaffShift_cocina`        | Turnos de personal            |
| `KdsProducionQueue_cocina` | Cola de producción KDS        |

## Respuestas de Error

El middleware puede interrumpir el request con los siguientes errores (formato estándar `HttpError`):

-   **401 Unauthorized**: No se envió token o el token es inválido/expirado.
-   **403 Forbidden**: El usuario no tiene el permiso requerido.
-   **503 Service Unavailable**: No se pudo conectar con el Módulo de Seguridad.
-   **500 Internal Server Error**: Error de configuración (ej. falta `SECURITY_BASE_URL`).

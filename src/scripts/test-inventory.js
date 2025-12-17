import '../config/envs.js';
import { prisma } from '../db/client.js';
import * as service from '../services/kitchen/inventory.service.js';

(async () => {
  try {
    console.log('Creando ítem de prueba...');
    const created = await service.createItem({
      name: 'Carne de Res Molida',
      type: 'INGREDIENT',
      unit: 'KG',
      minStockAlert: 5
    });
    console.log('Creado:', created);

    console.log('\nListando ítems...');
    const items = await service.findItems({});
    console.log('Items:', items);
  } catch (err) {
    console.error('Error script:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
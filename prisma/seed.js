import { prisma } from '../src/db/client.js';
import { randomUUID } from 'crypto';

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Clean up database (Order matters due to foreign keys)
  // We ignore User and Post as requested, but we clean the others to ensure a fresh start
  await prisma.assetLog.deleteMany();
  await prisma.kdsProductionQueue.deleteMany();
  await prisma.staffShift.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.inventoryLog.deleteMany();
  
  await prisma.kitchenProduct.deleteMany();
  await prisma.kitchenCategory.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.kitchenAsset.deleteMany();
  await prisma.kitchenStaff.deleteMany();

  console.log('🧹 Database cleaned (excluding Users/Posts)');

  // ==========================================
  // 2. INVENTORY ITEMS (Insumos)
  // ==========================================
  const inventoryItemsData = [
    { name: 'Carne de Res Premium', type: 'INGREDIENT', unitMeasure: 'KG', currentStock: 50, averageCost: 15.50, minStockAlert: 10 },
    { name: 'Pan de Hamburguesa Artesanal', type: 'INGREDIENT', unitMeasure: 'UNIDAD', currentStock: 200, averageCost: 0.80, minStockAlert: 50 },
    { name: 'Queso Cheddar', type: 'INGREDIENT', unitMeasure: 'KG', currentStock: 20, averageCost: 12.00, minStockAlert: 5 },
    { name: 'Tomate Fresco', type: 'INGREDIENT', unitMeasure: 'KG', currentStock: 30, averageCost: 3.50, minStockAlert: 5 },
    { name: 'Lechuga Orgánica', type: 'INGREDIENT', unitMeasure: 'UNIDAD', currentStock: 40, averageCost: 1.50, minStockAlert: 10 },
    { name: 'Salsa Secreta', type: 'INGREDIENT', unitMeasure: 'LITRO', currentStock: 10, averageCost: 8.00, minStockAlert: 2 },
    { name: 'Papas Nativas', type: 'INGREDIENT', unitMeasure: 'KG', currentStock: 100, averageCost: 2.00, minStockAlert: 20 },
    { name: 'Aceite Vegetal', type: 'INGREDIENT', unitMeasure: 'LITRO', currentStock: 50, averageCost: 6.00, minStockAlert: 10 },
    { name: 'Harina de Trigo', type: 'INGREDIENT', unitMeasure: 'KG', currentStock: 60, averageCost: 2.50, minStockAlert: 10 },
    { name: 'Mozzarella', type: 'INGREDIENT', unitMeasure: 'KG', currentStock: 25, averageCost: 14.00, minStockAlert: 5 },
    { name: 'Pepperoni', type: 'INGREDIENT', unitMeasure: 'KG', currentStock: 15, averageCost: 18.00, minStockAlert: 3 },
    { name: 'Caja Hamburguesa Eco', type: 'PACKAGING', unitMeasure: 'UNIDAD', currentStock: 500, averageCost: 0.50, minStockAlert: 100 },
    { name: 'Caja Pizza Grande', type: 'PACKAGING', unitMeasure: 'UNIDAD', currentStock: 300, averageCost: 1.20, minStockAlert: 50 },
    { name: 'Servilletas', type: 'PACKAGING', unitMeasure: 'PAQUETE', currentStock: 100, averageCost: 2.00, minStockAlert: 20 },
  ];

  const inventoryItems = {};
  for (const item of inventoryItemsData) {
    const created = await prisma.inventoryItem.create({ data: item });
    inventoryItems[item.name] = created;
  }
  console.log(`✅ Created ${inventoryItemsData.length} Inventory Items`);

  // ==========================================
  // 3. KITCHEN CATEGORIES
  // ==========================================
  const categoriesData = [
    { name: 'Hamburguesas', isActive: true },
    { name: 'Pizzas', isActive: true },
    { name: 'Acompañamientos', isActive: true },
    { name: 'Bebidas', isActive: true },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.kitchenCategory.create({ data: cat });
    categories[cat.name] = created;
  }
  console.log(`✅ Created ${categoriesData.length} Categories`);

  // ==========================================
  // 4. KITCHEN PRODUCTS
  // ==========================================
  const productsData = [
    { 
      name: 'Hamburguesa Royal', 
      description: 'Carne, queso, huevo y papas al hilo.', 
      basePrice: 25.00, 
      categoryId: categories['Hamburguesas'].id,
      imageUrl: 'https://example.com/royal.jpg'
    },
    { 
      name: 'Hamburguesa Clásica', 
      description: 'Carne, lechuga, tomate y queso.', 
      basePrice: 18.00, 
      categoryId: categories['Hamburguesas'].id,
      imageUrl: 'https://example.com/clasica.jpg'
    },
    { 
      name: 'Pizza Pepperoni', 
      description: 'Salsa de tomate, mozzarella y pepperoni.', 
      basePrice: 35.00, 
      categoryId: categories['Pizzas'].id,
      imageUrl: 'https://example.com/pepperoni.jpg'
    },
    { 
      name: 'Papas Fritas', 
      description: 'Porción de papas nativas fritas.', 
      basePrice: 12.00, 
      categoryId: categories['Acompañamientos'].id,
      imageUrl: 'https://example.com/fries.jpg'
    },
  ];

  const products = {};
  for (const prod of productsData) {
    const created = await prisma.kitchenProduct.create({ data: prod });
    products[prod.name] = created;
  }
  console.log(`✅ Created ${productsData.length} Products`);

  // ==========================================
  // 5. RECIPES (Recetas)
  // ==========================================
  // Linking Products to Inventory Items
  const recipesData = [
    // Hamburguesa Royal
    { productId: products['Hamburguesa Royal'].id, inventoryItemId: inventoryItems['Carne de Res Premium'].id, quantityRequired: 0.15, applyOn: 'ALL' }, // 150g carne
    { productId: products['Hamburguesa Royal'].id, inventoryItemId: inventoryItems['Pan de Hamburguesa Artesanal'].id, quantityRequired: 1, applyOn: 'ALL' },
    { productId: products['Hamburguesa Royal'].id, inventoryItemId: inventoryItems['Queso Cheddar'].id, quantityRequired: 0.03, applyOn: 'ALL' },
    { productId: products['Hamburguesa Royal'].id, inventoryItemId: inventoryItems['Caja Hamburguesa Eco'].id, quantityRequired: 1, applyOn: 'DELIVERY' }, // Solo delivery/takeout
    
    // Hamburguesa Clásica
    { productId: products['Hamburguesa Clásica'].id, inventoryItemId: inventoryItems['Carne de Res Premium'].id, quantityRequired: 0.12, applyOn: 'ALL' },
    { productId: products['Hamburguesa Clásica'].id, inventoryItemId: inventoryItems['Pan de Hamburguesa Artesanal'].id, quantityRequired: 1, applyOn: 'ALL' },
    { productId: products['Hamburguesa Clásica'].id, inventoryItemId: inventoryItems['Tomate Fresco'].id, quantityRequired: 0.05, applyOn: 'ALL' },
    { productId: products['Hamburguesa Clásica'].id, inventoryItemId: inventoryItems['Lechuga Orgánica'].id, quantityRequired: 1, applyOn: 'ALL' }, // 1 hoja

    // Pizza Pepperoni
    { productId: products['Pizza Pepperoni'].id, inventoryItemId: inventoryItems['Harina de Trigo'].id, quantityRequired: 0.30, applyOn: 'ALL' },
    { productId: products['Pizza Pepperoni'].id, inventoryItemId: inventoryItems['Mozzarella'].id, quantityRequired: 0.20, applyOn: 'ALL' },
    { productId: products['Pizza Pepperoni'].id, inventoryItemId: inventoryItems['Pepperoni'].id, quantityRequired: 0.10, applyOn: 'ALL' },
    { productId: products['Pizza Pepperoni'].id, inventoryItemId: inventoryItems['Caja Pizza Grande'].id, quantityRequired: 1, applyOn: 'DELIVERY' },

    // Papas Fritas
    { productId: products['Papas Fritas'].id, inventoryItemId: inventoryItems['Papas Nativas'].id, quantityRequired: 0.40, applyOn: 'ALL' },
    { productId: products['Papas Fritas'].id, inventoryItemId: inventoryItems['Aceite Vegetal'].id, quantityRequired: 0.05, applyOn: 'ALL' },
  ];

  for (const recipe of recipesData) {
    await prisma.recipe.create({ data: recipe });
  }
  console.log(`✅ Created ${recipesData.length} Recipe entries`);

  // ==========================================
  // 6. KITCHEN STAFF
  // ==========================================
  const staffData = [
    { userId: randomUUID(), workerCode: 'CHEF01', role: 'HEAD_CHEF', isActive: true },
    { userId: randomUUID(), workerCode: 'COOK01', role: 'CHEF', isActive: true },
    { userId: randomUUID(), workerCode: 'WAIT01', role: 'WAITER', isActive: true },
  ];

  const staffMembers = {};
  for (const staff of staffData) {
    const created = await prisma.kitchenStaff.create({ data: staff });
    staffMembers[staff.role] = created; // Simplified mapping by role for demo
    // Store specific ones if needed
    if (staff.workerCode === 'CHEF01') staffMembers['HEAD'] = created;
    if (staff.workerCode === 'COOK01') staffMembers['COOK'] = created;
    if (staff.workerCode === 'WAIT01') staffMembers['WAITER'] = created;
  }
  console.log(`✅ Created ${staffData.length} Staff members`);

  // ==========================================
  // 7. STAFF SHIFTS
  // ==========================================
  const shiftsData = [
    { staffId: staffMembers['HEAD'].id, shiftStart: new Date(new Date().setHours(8, 0, 0, 0)), isPresent: true },
    { staffId: staffMembers['COOK'].id, shiftStart: new Date(new Date().setHours(9, 0, 0, 0)), isPresent: true },
    { staffId: staffMembers['WAITER'].id, shiftStart: new Date(new Date().setHours(11, 0, 0, 0)), isPresent: true },
  ];

  for (const shift of shiftsData) {
    await prisma.staffShift.create({ data: shift });
  }
  console.log(`✅ Created ${shiftsData.length} Staff Shifts`);

  // ==========================================
  // 8. KITCHEN ASSETS
  // ==========================================
  const assetsData = [
    { name: 'Horno Industrial', totalQuantity: 2, status: 'OPERATIONAL', notes: 'Revisión mensual pendiente' },
    { name: 'Licuadora de Alta Potencia', totalQuantity: 3, status: 'OPERATIONAL' },
    { name: 'Juego de Cuchillos Chef', totalQuantity: 5, status: 'OPERATIONAL' },
    { name: 'Mesa de Trabajo Inox', totalQuantity: 4, status: 'OPERATIONAL' },
    { name: 'Freidora Doble', totalQuantity: 1, status: 'UNDER_MAINTENANCE', notes: 'Falla en termostato' },
  ];

  const assets = {};
  for (const asset of assetsData) {
    const created = await prisma.kitchenAsset.create({ data: asset });
    assets[asset.name] = created;
  }
  console.log(`✅ Created ${assetsData.length} Kitchen Assets`);

  // ==========================================
  // 9. ASSET LOGS
  // ==========================================
  const assetLogsData = [
    { assetId: assets['Freidora Doble'].id, quantityChange: 0, reason: 'Reporte de falla en termostato', reportedBy: staffMembers['HEAD'].id },
    { assetId: assets['Juego de Cuchillos Chef'].id, quantityChange: -1, reason: 'Cuchillo perdido durante turno noche', reportedBy: staffMembers['COOK'].id },
  ];

  for (const log of assetLogsData) {
    await prisma.assetLog.create({ data: log });
  }
  console.log(`✅ Created ${assetLogsData.length} Asset Logs`);

  // ==========================================
  // 10. KDS PRODUCTION QUEUE (Pedidos en cocina)
  // ==========================================
  const kdsData = [
    {
      externalOrderId: 'ORD-1001',
      sourceModule: 'AC_MODULE',
      displayLabel: '#1001',
      customerName: 'Juan Pérez',
      serviceMode: 'DINE_IN',
      productId: products['Hamburguesa Royal'].id,
      quantity: 1,
      preparationNotes: 'Sin cebolla',
      status: 'COOKING',
      priorityLevel: 2,
      assignedChefId: staffMembers['COOK'].id,
      startedAt: new Date()
    },
    {
      externalOrderId: 'ORD-1001',
      sourceModule: 'AC_MODULE',
      displayLabel: '#1001',
      customerName: 'Juan Pérez',
      serviceMode: 'DINE_IN',
      productId: products['Papas Fritas'].id,
      quantity: 1,
      status: 'READY',
      priorityLevel: 2,
      assignedChefId: staffMembers['COOK'].id,
      startedAt: new Date(Date.now() - 1000 * 60 * 10), // 10 mins ago
      finishedAt: new Date()
    },
    {
      externalOrderId: 'ORD-1002',
      sourceModule: 'DP_MODULE',
      displayLabel: '#1002',
      customerName: 'Maria Garcia',
      serviceMode: 'DELIVERY',
      productId: products['Pizza Pepperoni'].id,
      quantity: 2,
      status: 'PENDING',
      priorityLevel: 1
    }
  ];

  for (const kds of kdsData) {
    await prisma.kdsProductionQueue.create({ data: kds });
  }
  console.log(`✅ Created ${kdsData.length} KDS Items`);

  // ==========================================
  // 11. INVENTORY LOGS (Movimientos)
  // ==========================================
  const inventoryLogsData = [
    { itemId: inventoryItems['Carne de Res Premium'].id, movementType: 'PURCHASE', quantityChange: 50, costAtTime: 15.00, reason: 'Compra semanal' },
    { itemId: inventoryItems['Pan de Hamburguesa Artesanal'].id, movementType: 'PURCHASE', quantityChange: 200, costAtTime: 0.80, reason: 'Compra semanal' },
    { itemId: inventoryItems['Tomate Fresco'].id, movementType: 'WASTE', quantityChange: -2, costAtTime: 3.50, reason: 'Tomates en mal estado' },
  ];

  for (const log of inventoryLogsData) {
    await prisma.inventoryLog.create({ data: log });
  }
  console.log(`✅ Created ${inventoryLogsData.length} Inventory Logs`);

  console.log('🏁 Seeding finished successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

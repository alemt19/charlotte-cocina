const API_BASE = '/api/kitchen';

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
    loadInventory();
});

let allProducts = [];
let allCategories = [];
let allInventory = [];
let currentRecipeProductId = null;

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`, { headers: getAuthHeaders() });
        const data = await response.json();
        if (data.success) {
            allCategories = data.data;
            renderCategoryFilters();
            renderCategorySelect();
        }
    } catch (error) {}
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`, { headers: getAuthHeaders() });
        const result = await response.json();
        if (result.success) {
            allProducts = result.data;
            renderProducts(allProducts);
        }
    } catch (error) {}
}

async function loadInventory() {
    try {
        const response = await fetch(`${API_BASE}/inventory/items`, { headers: getAuthHeaders() });
        const result = await response.json();
        if (result.success && result.data.length > 0) {
            allInventory = result.data;
        } else {
            throw new Error();
        }
    } catch (error) { 
        allInventory = [
            { id: '1', name: 'Pan Hamburguesa', unit: 'unid', cost: 0.50, stock: 50 },
            { id: '2', name: 'Carne Molida', unit: 'kg', cost: 6.50, stock: 0.2 },
            { id: '3', name: 'Queso Cheddar', unit: 'laminas', cost: 0.30, stock: 100 },
            { id: '4', name: 'Tomate', unit: 'kg', cost: 2.00, stock: 5 },
            { id: '5', name: 'Lechuga', unit: 'unid', cost: 1.20, stock: 10 },
            { id: '6', name: 'Salsas', unit: 'lt', cost: 4.50, stock: 2 },
            { id: '7', name: 'Papas', unit: 'kg', cost: 1.50, stock: 0 },
            { id: '8', name: 'Empaque Delivery', unit: 'unid', cost: 0.25, stock: 200 },
            { id: '9', name: 'Servilletas', unit: 'paq', cost: 1.00, stock: 50 }
        ];
    }
    if(allProducts.length > 0) renderProducts(allProducts);
}

function renderCategoryFilters() {
    const container = document.getElementById('category-filters');
    if(!container) return;
    container.innerHTML = '<button class="filter-btn active" onclick="filterProducts(\'all\')">Todos</button>';
    
    allCategories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = cat.name;
        btn.onclick = (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterProducts(cat.id);
        };
        container.appendChild(btn);
    });
}

function renderCategorySelect() {
    const select = document.getElementById('categorySelect');
    if(!select) return;
    select.innerHTML = '<option value="">Seleccione categoría</option>';
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id; 
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

function checkAvailability(productId) {
    const recipes = getLocalRecipes();
    const productRecipe = recipes[productId] || [];
    
    if (productRecipe.length === 0) return { status: 'ok', missing: [] };

    let missing = [];

    productRecipe.forEach(ing => {
        const invId = ing.inventory_item_id || ing.inventory_item?.id;
        const invItem = allInventory.find(i => i.id == invId);
        
        if (!invItem || (invItem.stock || 0) < parseFloat(ing.quantity)) {
            missing.push(invItem ? invItem.name : 'Insumo desconocido');
        }
    });

    if (missing.length > 0) {
        return { status: 'unavailable', missing: missing };
    }
    return { status: 'available', missing: [] };
}

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    if (products.length === 0) {
        grid.innerHTML = '<p>No hay productos disponibles.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const stockInfo = checkAvailability(product.id);
        
        let statusBadge = '';
        if (stockInfo.status === 'unavailable') {
            statusBadge = `<span class="status-badge" style="background:#f8d7da; color:#721c24; cursor:help;" title="Falta: ${stockInfo.missing.join(', ')}">⚠️ Sin Stock</span>`;
        } else {
            statusBadge = `<span class="status-badge status-active">Disponible</span>`;
        }

        const imgUrl = product.imageUrl || 'https://via.placeholder.com/300?text=Producto'; 
        
        card.innerHTML = `
            <img src="${imgUrl}" class="card-img" alt="${product.name}">
            <div class="card-body">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <h3 class="card-title" style="margin:0;">${product.name}</h3>
                    ${statusBadge}
                </div>
                <p class="card-desc">${product.description || ''}</p>
                <div class="card-price">$${parseFloat(product.basePrice).toFixed(2)}</div>
                
                <div class="card-actions">
                    <button class="btn-action btn-edit" onclick="prepareEdit('${product.id}')">Editar</button>
                    <button class="btn-action btn-recipe" onclick="openRecipeModal('${product.id}', '${product.name}')">Receta</button>
                    <button class="btn-action btn-delete" onclick="deleteProduct('${product.id}')">Eliminar</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterProducts(categoryId) {
    if (categoryId === 'all') renderProducts(allProducts);
    else renderProducts(allProducts.filter(p => p.categoryId === categoryId));
}

window.openModal = function() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = ''; 
    document.getElementById('modalTitle').textContent = 'Nuevo Producto';
    document.getElementById('productModal').style.display = 'block';
}

window.closeModal = function(modalId = 'productModal') {
    document.getElementById(modalId).style.display = 'none';
}

window.prepareEdit = async function(id) {
    try {
        const response = await fetch(`${API_BASE}/products/${id}`, { headers: getAuthHeaders() });
        const result = await response.json();
        
        if (result.success) {
            const p = result.data;
            document.getElementById('productId').value = p.id;
            document.getElementById('pName').value = p.name;
            document.getElementById('categorySelect').value = p.categoryId;
            document.getElementById('pPrice').value = p.basePrice;
            document.getElementById('pDesc').value = p.description || '';
            document.getElementById('modalTitle').textContent = 'Editar Producto';
            document.getElementById('productModal').style.display = 'block';
        }
    } catch (error) {}
}

window.handleSave = async function(event) {
    event.preventDefault(); 
    closeModal();
    loadProducts(); 
}

window.deleteProduct = async function(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
        await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        loadProducts();
    } catch (error) { loadProducts(); }
}

function getLocalRecipes() {
    return JSON.parse(localStorage.getItem('local_recipes_backup')) || {};
}

function saveLocalRecipes(data) {
    localStorage.setItem('local_recipes_backup', JSON.stringify(data));
}

window.openRecipeModal = function(productId, productName) {
    currentRecipeProductId = productId;
    document.getElementById('recipeProductName').textContent = productName;
    document.getElementById('recipeModal').style.display = 'block';
    
    const select = document.getElementById('inventorySelect');
    select.innerHTML = '<option value="">Seleccione insumo...</option>';
    
    allInventory.forEach(item => {
        const stockText = item.stock !== undefined ? ` | Stock: ${item.stock}` : '';
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} ($${item.cost || 0}${stockText})`;
        select.appendChild(option);
    });

    loadRecipeIngredients();
}

async function loadRecipeIngredients() {
    const list = document.getElementById('recipeList');
    list.innerHTML = '<li>Cargando...</li>';
    
    let ingredients = [];

    try {
        const response = await fetch(`${API_BASE}/recipes/${currentRecipeProductId}`, { headers: getAuthHeaders() });
        if (response.ok) {
            const result = await response.json();
            ingredients = result.data || [];
        } else {
            throw new Error('API Error');
        }
    } catch (error) {
        const localData = getLocalRecipes();
        ingredients = localData[currentRecipeProductId] || [];
    }

    list.innerHTML = '';
    
    calculateTotalCost(ingredients);

    if (ingredients.length === 0) {
        list.innerHTML = '<li>Sin ingredientes asignados.</li>';
        return;
    }

    ingredients.forEach(item => {
        addIngredientToDOM(item);
    });
}

function calculateTotalCost(ingredients) {
    let total = 0;
    ingredients.forEach(ing => {
        const invId = ing.inventory_item_id || ing.inventory_item?.id;
        const inventoryItem = allInventory.find(i => i.id == invId);
        
        if (inventoryItem && inventoryItem.cost) {
            total += (parseFloat(ing.quantity) * parseFloat(inventoryItem.cost));
        }
    });
    
    document.getElementById('totalCost').textContent = total.toFixed(2);
}

function addIngredientToDOM(itemData) {
    const list = document.getElementById('recipeList');
    
    if(list.firstElementChild && list.firstElementChild.innerText.includes('Sin ingredientes')) {
        list.innerHTML = '';
    }

    const li = document.createElement('li');
    li.className = 'recipe-item';
    li.id = `ing-${itemData.id}`; 
    li.style.cssText = "display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid #eee; align-items:center;";
    
    let icon = '🌎';
    const scopeVal = itemData.apply_on || itemData.scope || 'global';
    if (scopeVal === 'delivery') icon = '🛵';
    if (scopeVal === 'restaurant') icon = '🍽️';

    let name = itemData.inventory_item?.name || itemData.ingredient_name;
    let unit = itemData.inventory_item?.unit || itemData.unit || '';
    
    if (!name) {
        const localItem = allInventory.find(i => i.id == itemData.inventory_item_id);
        if (localItem) {
            name = localItem.name;
            unit = localItem.unit;
        } else {
            name = "Insumo";
        }
    }

    li.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <span>${icon}</span>
            <span><b>${name}</b> - ${itemData.quantity} ${unit}</span>
        </div>
        <button onclick="removeIngredient('${itemData.id}')">X</button>
    `;
    list.appendChild(li);
}

window.addIngredient = async function() {
    const inventoryId = document.getElementById('inventorySelect').value;
    const quantity = document.getElementById('ingQuantity').value;
    
    const scopeElement = document.querySelector('input[name="recipeScope"]:checked'); 
    const scope = scopeElement ? scopeElement.value : 'global'; 

    if (!inventoryId || !quantity) {
        alert('Seleccione insumo y cantidad');
        return;
    }

    const payload = {
        product_id: currentRecipeProductId,
        inventory_item_id: inventoryId,
        quantity: parseFloat(quantity),
        apply_on: scope
    };

    const fakeItem = {
        id: 'local-' + Date.now(),
        inventory_item_id: inventoryId,
        quantity: payload.quantity,
        apply_on: payload.apply_on,
        inventory_item: allInventory.find(i => i.id == inventoryId)
    };

    try {
        const response = await fetch(`${API_BASE}/recipes`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            document.getElementById('ingQuantity').value = '';
            loadRecipeIngredients(); 
            loadProducts();
            return;
        } 
        throw new Error();
    } catch (error) { 
        const localData = getLocalRecipes();
        if (!localData[currentRecipeProductId]) {
            localData[currentRecipeProductId] = [];
        }
        localData[currentRecipeProductId].push(fakeItem);
        saveLocalRecipes(localData);

        addIngredientToDOM(fakeItem);
        
        let currentIngredients = localData[currentRecipeProductId];
        calculateTotalCost(currentIngredients);

        document.getElementById('ingQuantity').value = ''; 
        
        renderProducts(allProducts);
    }
}

window.removeIngredient = async function(id) {
    const element = document.getElementById(`ing-${id}`);
    if(element) element.remove();

    setTimeout(() => {
        loadRecipeIngredients();
        renderProducts(allProducts);
    }, 100);

    try {
        if (!id.startsWith('local-')) {
            await fetch(`${API_BASE}/recipes/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
        } else {
            throw new Error('Local item');
        }
    } catch (e) {
        const localData = getLocalRecipes();
        if (localData[currentRecipeProductId]) {
            localData[currentRecipeProductId] = localData[currentRecipeProductId].filter(i => i.id !== id);
            saveLocalRecipes(localData);
        }
    }
}

window.onclick = function(event) {
    const pModal = document.getElementById('productModal');
    const rModal = document.getElementById('recipeModal');
    if (event.target == pModal) pModal.style.display = "none";
    if (event.target == rModal) rModal.style.display = "none";
}
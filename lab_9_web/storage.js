const STORAGE_KEY = 'foodConstructOrder';


function saveOrderToStorage(selectedDishes) {
    const orderData = {};
    
    if (selectedDishes.soup && selectedDishes.soup.id) {
        orderData.soup_id = selectedDishes.soup.id;
    }
    if (selectedDishes.dishes && selectedDishes.dishes.id) {
        orderData.main_course_id = selectedDishes.dishes.id;
    }
    if (selectedDishes.salats && selectedDishes.salats.id) {
        orderData.salad_id = selectedDishes.salats.id;
    }
    if (selectedDishes.drinks && selectedDishes.drinks.id) {
        orderData.drink_id = selectedDishes.drinks.id;
    }
    if (selectedDishes.deserts && selectedDishes.deserts.id) {
        orderData.dessert_id = selectedDishes.deserts.id;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orderData));
}

// Загрузка заказа из localStorage
function loadOrderFromStorage() {  // Убрать export
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    if (!savedOrder) return {};
    
    try {
        return JSON.parse(savedOrder);
    } catch (e) {
        console.error('Ошибка при загрузке данных из localStorage:', e);
        return {};
    }
}

// Очистка заказа из localStorage
function clearOrderFromStorage() {  // Убрать export
    localStorage.removeItem(STORAGE_KEY);
}

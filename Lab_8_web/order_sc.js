// Объект для хранения выбранных блюд
let selectedDishes = {
    soup: null,
    dishes: null,
    salats: null, 
    drinks: null,
    deserts: null
};

// Функция для поиска блюда по keyword
function findDishByKeyword(keyword) {
    if (!dish_arr || dish_arr.length === 0) {
        console.warn('Массив dish_arr пустой или не загружен');
        return null;
    }
    
    return dish_arr.find(dish => dish.keyword === keyword);
}

// Функция для обработки клика по карточке блюда
function handleDishClick(event) {
    // Находим ближайшую карточку с data-атрибутом
    const dishCard = event.target.closest('[dish_arr]');
    
    if (!dishCard) return;
    
    const dishKeyword = dishCard.getAttribute('dish_arr');
    const dish = findDishByKeyword(dishKeyword);
    
    if (dish) {
        // Убираем подсветку со всех карточек этой категории
        removeSelectionFromCategory(dish.category);
        
        // Добавляем класс selected выбранной карточке
        dishCard.classList.add('selected');
        
        // Сохраняем выбранное блюдо
        let categoryKey;
        switch(dish.category) {
            case 'soup': categoryKey = 'soup'; break;
            case 'dish': categoryKey = 'dishes'; break;
            case 'salats': categoryKey = 'salats'; break;
            case 'drinks': categoryKey = 'drinks'; break;
            case 'deserts': categoryKey = 'deserts'; break;
        }
        
        selectedDishes[categoryKey] = dish;
        
        // Сохраняем в localStorage
        if (typeof saveOrderToStorage !== 'undefined') {
            saveOrderToStorage(selectedDishes);
        } else if (typeof window.saveOrderToStorage !== 'undefined') {
            window.saveOrderToStorage(selectedDishes);
        }

        // Обновляем панель оформления
        updateCheckoutPanel();
    }
}

// Функция для снятия подсветки со всех карточек категории
function removeSelectionFromCategory(category) {
    const allCards = document.querySelectorAll('.dish_card');
    allCards.forEach(card => {
        const cardKeyword = card.getAttribute('dish_arr');
        const cardDish = findDishByKeyword(cardKeyword);
        if (cardDish) {
            // Определяем категорию для сравнения
            let cardCategory;
            switch(cardDish.category) {
                case 'soup': cardCategory = 'soup'; break;
                case 'dish': cardCategory = 'dish'; break;
                case 'salats': cardCategory = 'salats'; break;
                case 'drinks': cardCategory = 'drinks'; break;
                case 'deserts': cardCategory = 'deserts'; break;
            }
            
            if (cardCategory === category) {
                card.classList.remove('selected');
            }
        }
    });
}

// Функция для подсчета общей стоимости заказа
function calculateTotalPrice() {
    let total = 0;
    for (const category in selectedDishes) {
        if (selectedDishes[category]) {
            total += selectedDishes[category].price;
        }
    }
    return total;
}

// Функция для полного сброса заказа
function resetOrder() {
    // Сбрасываем выбранные блюда
    selectedDishes = {
        soup: null,
        dishes: null,
        salats: null,
        drinks: null,
        deserts: null
    };
    
    // Убираем подсветку со всех карточек
    const allCards = document.querySelectorAll('.dish_card');
    allCards.forEach(card => {
        card.classList.remove('selected');
    });

    // Очищаем localStorage
    if (typeof clearOrderFromStorage !== 'undefined') {
        clearOrderFromStorage();
    } else if (typeof window.clearOrderFromStorage !== 'undefined') {
        window.clearOrderFromStorage();
    }

    // Обновляем панель оформления
    updateCheckoutPanel();
}

const validCombos = [
    { name: 'Комбо 1', categories: ['soup', 'dish', 'salat', 'drink'] },
    { name: 'Комбо 2', categories: ['soup', 'dish', 'drink'] },
    { name: 'Комбо 3', categories: ['soup', 'salat', 'drink'] },
    { name: 'Комбо 4', categories: ['dish', 'salat', 'drink'] },
    { name: 'Комбо 5', categories: ['dish', 'drink'] }
];

// Функция для получения текущего выбора категорий (без десерта)
function getSelectedCategories() {
    const categories = [];
    if (selectedDishes.soup) categories.push('soup');
    if (selectedDishes.dishes) categories.push('dish');
    if (selectedDishes.salats) categories.push('salat');
    if (selectedDishes.drinks) categories.push('drink');
    return categories.sort();
}

// Функция для проверки, соответствует ли выбор одному из комбо
function checkCombo(selectedCategories) {
    return validCombos.some(combo => {
        if (combo.categories.length !== selectedCategories.length) return false;
        return combo.categories.every(cat => selectedCategories.includes(cat));
    });
}

// Функция для подсветки выбранных блюд
function highlightSelectedDishes() {
    const allCards = document.querySelectorAll('.dish_card');
    
    // Сначала убираем все подсветки
    allCards.forEach(card => card.classList.remove('selected'));

    // Подсвечиваем сохраненные блюда
    allCards.forEach(card => {
        const dishKeyword = card.getAttribute('dish_arr');
        const dish = findDishByKeyword(dishKeyword);
        
        if (dish) {
            let isSelected = false;
            
            // Проверяем каждый вид блюд
            if (selectedDishes.soup && selectedDishes.soup.keyword === dishKeyword) isSelected = true;
            if (selectedDishes.dishes && selectedDishes.dishes.keyword === dishKeyword) isSelected = true;
            if (selectedDishes.salats && selectedDishes.salats.keyword === dishKeyword) isSelected = true;
            if (selectedDishes.drinks && selectedDishes.drinks.keyword === dishKeyword) isSelected = true;
            if (selectedDishes.deserts && selectedDishes.deserts.keyword === dishKeyword) isSelected = true;
            
            if (isSelected) {
                card.classList.add('selected');
            }
        }
    });
}

// Функция для обновления панели оформления
function updateCheckoutPanel() {
    const panel = document.getElementById('checkout-panel');
    const totalSpan = document.getElementById('checkout-total');
    const checkoutLink = document.getElementById('checkout-link');
    
    // Если элементов нет - выходим
    if (!panel || !totalSpan || !checkoutLink) {
        console.log('Элементы панели не найдены');
        return;
    }
    
    const totalPrice = calculateTotalPrice();
    const selectedCategories = getSelectedCategories();
    const isValidCombo = checkCombo(selectedCategories);
    
    // Обновляем данные
    totalSpan.textContent = totalPrice;
    
    // Показываем/скрываем панель
    if (totalPrice > 0) {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
    
    // Активируем/деактивируем ссылку
    if (isValidCombo) {
        checkoutLink.classList.remove('disabled');
        checkoutLink.style.pointerEvents = 'auto';
        checkoutLink.style.opacity = '1';
    } else {
        checkoutLink.classList.add('disabled');
        checkoutLink.style.pointerEvents = 'none';
        checkoutLink.style.opacity = '0.5';
    }
}

function loadSavedOrder() {
    const savedOrder = typeof loadOrderFromStorage !== 'undefined' 
        ? loadOrderFromStorage() 
        : (typeof window.loadOrderFromStorage !== 'undefined' 
            ? window.loadOrderFromStorage() 
            : {});
    
    // Если нет сохраненного заказа, выходим
    if (!savedOrder || Object.keys(savedOrder).length === 0) return;
    
    // Находим блюда по сохраненным ID
    if (savedOrder.soup_id) {
        const soupDish = dish_arr.find(dish => dish.id === savedOrder.soup_id);
        if (soupDish) selectedDishes.soup = soupDish;
    }
    if (savedOrder.main_course_id) {
        const mainDish = dish_arr.find(dish => dish.id === savedOrder.main_course_id);
        if (mainDish) selectedDishes.dishes = mainDish;
    }
    if (savedOrder.salad_id) {
        const saladDish = dish_arr.find(dish => dish.id === savedOrder.salad_id);
        if (saladDish) selectedDishes.salats = saladDish;
    }
    if (savedOrder.drink_id) {
        const drinkDish = dish_arr.find(dish => dish.id === savedOrder.drink_id);
        if (drinkDish) selectedDishes.drinks = drinkDish;
    }
    if (savedOrder.dessert_id) {
        const dessertDish = dish_arr.find(dish => dish.id === savedOrder.dessert_id);
        if (dessertDish) selectedDishes.deserts = dessertDish;
    }
    
    // Подсвечиваем выбранные блюда
    highlightSelectedDishes();
    
    // Обновляем панель
    updateCheckoutPanel();
}

// Функция для инициализации обработчиков событий
function initOrderHandlers() {
    // Добавляем обработчик клика на все карточки блюд
    document.addEventListener('click', function(event) {
        if (event.target.closest('.dish_card')) {
            handleDishClick(event);
        }
    });
    
    // Загружаем сохраненный заказ при инициализации
    loadSavedOrder();
    
    // Обновляем первоначальное отображение панели
    updateCheckoutPanel();
}

// Запускаем когда DOM загружен
document.addEventListener('DOMContentLoaded', function() {
    // Ждем загрузки данных перед инициализацией обработчиков заказа
    if (dish_arr.length === 0) {
        loadDishes().then(initOrderHandlers);
    } else {
        initOrderHandlers();
    }
});
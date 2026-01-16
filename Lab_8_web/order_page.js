let selectedDishes = {
    soup: null,
    dishes: null,
    salats: null,
    drinks: null,
    deserts: null
};

const API_URL = 'https://edu.std-900.ist.mospolytech.ru';
const API_KEY = '62cf6ca7-05c7-4c73-8643-37b6b0145e03';

if (typeof loadOrderFromStorage === 'undefined') {
    console.error('Функции из storage.js не загружены!');
    
    // Создаем заглушки для предотвращения ошибок
    window.loadOrderFromStorage = function() {
        console.warn('loadOrderFromStorage не доступна, возвращаю пустой объект');
        return {};
    };
    
    window.clearOrderFromStorage = function() {
        console.warn('clearOrderFromStorage не доступна');
    };
}

// Функция для отображения блюд в заказе
function displayOrderItems() {
    const container = document.getElementById('order-items');
    const dynamicOrder = document.getElementById('dynamic-order');
    
    // Проверяем, есть ли выбранные блюда
    const hasSelectedDishes = Object.values(selectedDishes).some(dish => dish !== null);
    
    if (!hasSelectedDishes) {
        container.innerHTML = '<p class="empty-order">Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу <a href="lanch.html">Собрать ланч</a>.</p>';
        dynamicOrder.innerHTML = '<p>Ничего не выбрано</p>';
        return;
    }
    
    // Отображаем блюда в виде карточек
    let itemsHTML = '';
    let orderHTML = '';
    let totalPrice = 0;
    
    const categoryNames = {
        soup: 'Суп',
        dishes: 'Главное блюдо',
        salats: 'Салат или стартер',
        drinks: 'Напиток',
        deserts: 'Десерт'
    };
    
    for (const category in selectedDishes) {
        const dish = selectedDishes[category];
        if (dish) {
            itemsHTML += createDishCard(dish, category);
            orderHTML += `<p><strong>${categoryNames[category]}:</strong> ${dish.name} — ${dish.price} руб.</p>`;
            totalPrice += dish.price;
        } else {
            const notSelectedText = getNotSelectedText(categoryNames[category]);
            orderHTML += `<p><strong>${categoryNames[category]}:</strong> ${notSelectedText}</p>`;
        }
    }
    
    orderHTML += `<hr><p><strong>Стоимость заказа:</strong> ${totalPrice} руб.</p>`;
    
    container.innerHTML = itemsHTML;
    dynamicOrder.innerHTML = orderHTML;
}

// Функция для создания карточки блюда
function createDishCard(dish, category) {
    return `
        <div class="dish_card" data-keyword="${dish.keyword}">
            <img src="${dish.image}" alt="${dish.name}">
            <p>${dish.price} руб.</p>
            <p>${dish.name}</p>
            <button class="remove-button" data-category="${category}" data-id="${dish.id}">Удалить</button>
        </div>
    `;
}

// Функция для получения текста "не выбрано"
function getNotSelectedText(categoryName) {
    switch(categoryName) {
        case 'Суп': return 'Суп не выбран';
        case 'Главное блюдо': return 'Главное блюдо не выбрано';
        case 'Салат или стартер': return 'Салат или стартер не выбран';
        case 'Напиток': return 'Напиток не выбран';
        case 'Десерт': return 'Десерт не выбран';
        default: return 'Блюдо не выбрано';
    }
}

// Функция для удаления блюда из заказа
function removeDishFromOrder(category) {
    const savedOrder = window.loadOrderFromStorage ? window.loadOrderFromStorage() : {};
    
    if (savedOrder) {
        // Удаляем блюдо из savedOrder
        switch(category) {
            case 'soup': delete savedOrder.soup_id; break;
            case 'dishes': delete savedOrder.main_course_id; break;
            case 'salats': delete savedOrder.salad_id; break;
            case 'drinks': delete savedOrder.drink_id; break;
            case 'deserts': delete savedOrder.dessert_id; break;
        }
        
        // Сохраняем обновленный заказ
        localStorage.setItem('foodConstructOrder', JSON.stringify(savedOrder));
    }
    
    // Обновляем selectedDishes
    selectedDishes[category] = null;
    
    // Обновляем отображение
    displayOrderItems();
}

const validCombos = [
    { name: 'Комбо 1', categories: ['soup', 'dish', 'salat', 'drink'] },
    { name: 'Комбо 2', categories: ['soup', 'dish', 'drink'] },
    { name: 'Комбо 3', categories: ['soup', 'salat', 'drink'] },
    { name: 'Комбо 4', categories: ['dish', 'salat', 'drink'] },
    { name: 'Комбо 5', categories: ['dish', 'drink'] }
];

// Объект с данными для уведомлений
const notifications = {
    1: {
        text: "Ничего не выбрано. Выберите блюда для заказа"
    },
    2: {
        text: "Выберите напиток"
    },
    3: {
        text: "Выберите главное блюдо/салат/стартер"
    },
    4: {
        text: "Выберите суп или главное блюдо"
    },
    5: {
        text: "Выберите главное блюдо"
    }
};

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

// Функция для определения типа уведомления
function determineNotificationType(selectedCategories) {
    const hasSoup = selectedCategories.includes('soup');
    const hasDish = selectedCategories.includes('dish');
    const hasSalat = selectedCategories.includes('salat');
    const hasDrink = selectedCategories.includes('drink');
    
    if (selectedCategories.length === 0) {
        return 1; // Ничего не выбрано
    }
    
    if (!hasDrink && (hasSoup && hasDish && hasSalat || 
                      hasSoup && hasDish || 
                      hasSoup && hasSalat || 
                      hasDish && hasSalat || 
                      hasDish)) {
        return 2; // Нет напитка
    }
    
    if (hasSoup && !hasDish && !hasSalat) {
        return 3; // Только суп
    }
    
    if (hasSalat && !hasSoup && !hasDish) {
        return 4; // Только салат
    }
    
    if ((hasDrink || selectedDishes.deserts) && !hasDish && !hasSoup && !hasSalat) {
        return 5; // Только напиток или десерт
    }
    
    return null;
}

// Функция для показа уведомления
function showNotification(type) {
    const notificationData = notifications[type];
    
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    
    // Создаем само уведомление
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <p>${notificationData.text}</p>
        <button id="notification-ok">Окей</button>
    `
    ;
    
    overlay.appendChild(notification);
    document.body.appendChild(overlay);
    
    // Обработчик для кнопки "Окей"
    const okButton = document.getElementById('notification-ok');
    okButton.addEventListener('click', function() {
        document.body.removeChild(overlay);
    });
    
    // Эффекты при наведении на кнопку
    okButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#2E7D32';
        this.style.color = '#FFFFFF';
    });
    
    okButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#4CAF50';
        this.style.color = 'white';
    });
}


// // Функция для проверки комбо
// function checkCombo(selectedCategories) {
//     const validCombos = [
//         { categories: ['soup', 'dish', 'salat', 'drink'] },
//         { categories: ['soup', 'dish', 'drink'] },
//         { categories: ['soup', 'salat', 'drink'] },
//         { categories: ['dish', 'salat', 'drink'] },
//         { categories: ['dish', 'drink'] }
//     ];
    
//     return validCombos.some(combo => {
//         if (combo.categories.length !== selectedCategories.length) return false;
//         return combo.categories.every(cat => selectedCategories.includes(cat));
//     });
// }

// Функция для получения выбранных категорий
function getSelectedCategories() {
    const categories = [];
    if (selectedDishes.soup) categories.push('soup');
    if (selectedDishes.dishes) categories.push('dish');
    if (selectedDishes.salats) categories.push('salat');
    if (selectedDishes.drinks) categories.push('drink');
    return categories.sort();
}

// Функция для отправки заказа на сервер
async function submitOrder(formData) {
    const orderData = {
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        subscribe: formData.get('subscribe') ? 1 : 0,
        phone: formData.get('phone'),
        delivery_address: formData.get('delivery_address'),
        delivery_type: formData.get('delivery_type'),
        comment: formData.get('comment') || ''
    };
    
    // Добавляем время доставки если нужно
    if (orderData.delivery_type === 'by_time') {
        const deliveryTime = formData.get('delivery_time');
        if (deliveryTime) {
            orderData.delivery_time = deliveryTime;
        }
    }
    
    // Добавляем ID блюд
    if (selectedDishes.soup) orderData.soup_id = selectedDishes.soup.id;
    if (selectedDishes.dishes) orderData.main_course_id = selectedDishes.dishes.id;
    if (selectedDishes.salats) orderData.salad_id = selectedDishes.salats.id;
    if (selectedDishes.drinks) orderData.drink_id = selectedDishes.drinks.id;
    if (selectedDishes.deserts) orderData.dessert_id = selectedDishes.deserts.id;
    
    try {
        const response = await fetch(`${API_URL}?api_key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при отправке заказа');
        }
        
        const result = await response.json();
        console.log('Заказ успешно отправлен:', result);
        
        // Очищаем localStorage после успешной отправки
        if (window.clearOrderFromStorage) {
        window.clearOrderFromStorage();
        }        
        alert('Заказ успешно оформлен!');
        
        // Перенаправляем на главную страницу
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
        return result;
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert(`Произошла ошибка при оформлении заказа: ${error.message}`);
        throw error;
    }
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', async function() {
    // Загружаем блюда с API
    await loadDishes();
    
    // Загружаем сохраненный заказ
    const savedOrder = window.loadOrderFromStorage ? window.loadOrderFromStorage() : {};
    
    // Находим блюда по сохраненным ID
    if (savedOrder && savedOrder.soup_id) {
        const soupDish = dish_arr.find(dish => dish.id === savedOrder.soup_id);
        if (soupDish) selectedDishes.soup = soupDish;
    }
    if (savedOrder && savedOrder.main_course_id) {
        const mainDish = dish_arr.find(dish => dish.id === savedOrder.main_course_id);
        if (mainDish) selectedDishes.dishes = mainDish;
    }
    if (savedOrder && savedOrder.salad_id) {
        const saladDish = dish_arr.find(dish => dish.id === savedOrder.salad_id);
        if (saladDish) selectedDishes.salats = saladDish;
    }
    if (savedOrder && savedOrder.drink_id) {
        const drinkDish = dish_arr.find(dish => dish.id === savedOrder.drink_id);
        if (drinkDish) selectedDishes.drinks = drinkDish;
    }
    if (savedOrder && savedOrder.dessert_id) {
        const dessertDish = dish_arr.find(dish => dish.id === savedOrder.dessert_id);
        if (dessertDish) selectedDishes.deserts = dessertDish;
    }
    
    // Отображаем заказ
    displayOrderItems();
    
    // Обработчик кликов для кнопок удаления
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-button')) {
            const category = event.target.dataset.category;
            removeDishFromOrder(category);
        }
    });
    
    // Обработчик отправки формы
    const form = document.getElementById('order-form');
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            // Проверяем состав заказа
            const selectedCategories = getSelectedCategories();
            if (!checkCombo(selectedCategories)) {
                alert('Состав заказа не соответствует ни одному из доступных комбо.');
                return;
            }
            
            // Проверяем наличие напитка (обязательное поле)
            if (!selectedDishes.drinks) {
                alert('Пожалуйста, выберите напиток.');
                return;
            }
            
            const formData = new FormData(form);
            await submitOrder(formData);
        });
    }
});
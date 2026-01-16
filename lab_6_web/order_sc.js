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
        
        // Обновляем отображение формы заказа
        updateOrderForm();
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
                case 'dish': cardCategory = 'dishes'; break;
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

// Функция для обновления отображения формы заказа
function updateOrderForm() {
    const orderContainer = document.getElementById('dynamic-order');
    const totalPrice = calculateTotalPrice();
    
    // Проверяем, есть ли выбранные блюда
    const hasSelectedDishes = Object.values(selectedDishes).some(dish => dish !== null);
    
    if (!hasSelectedDishes) {
        orderContainer.innerHTML = '<p>Ничего не выбрано</p>';
    } else {
        let orderHTML = '';
        orderHTML += createOrderDisplay('soup', 'Суп');
        orderHTML += createOrderDisplay('dishes', 'Главное блюдо');
        orderHTML += createOrderDisplay('salats', 'Салат или стартер'); 
        orderHTML += createOrderDisplay('drinks', 'Напиток');
        orderHTML += createOrderDisplay('deserts', 'Десерт');
        orderHTML += `
            <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
            <p><strong>Стоимость заказа:</strong> ${totalPrice} руб.</p>
        `;
        
        orderContainer.innerHTML = orderHTML;
    }
}

// Функция для создания отображения одной категории заказа
function createOrderDisplay(category, categoryName) {
    const dish = selectedDishes[category];
    
    if (dish) {
        return `
            <p><strong>${categoryName}:</strong> ${dish.name} — ${dish.price} руб.</p>
        `;
    } else {
        return `
            <p><strong>${categoryName}:</strong> ${getNotSelectedText(categoryName)}</p>
        `;
    }
}

// Функция для получения текста "не выбрано"
function getNotSelectedText(categoryName) {
    switch(categoryName) {
        case 'Суп': return 'Суп не выбран';
        case 'Главное блюдо': return 'Основное блюдо не выбрано';
        case 'Салат или стартер': return 'Салат или стартер не выбран';
        case 'Напиток': return 'Напиток не выбран';
        case 'Десерт': return 'Десерт не выбран'
        default: return 'Блюдо не выбрано';
    }
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
    
    // Обновляем отображение формы
    updateOrderForm();
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
        text: "Ничего не выбрано. Выберите блюда для заказа",
        image: "nothing-selected.jpg"
    },
    2: {
        text: "Выберите напиток",
        image: "choose-drink.jpg"
    },
    3: {
        text: "Выберите главное блюдо/салат/стартер",
        image: "choose-main.jpg"
    },
    4: {
        text: "Выберите суп или главное блюдо",
        image: "choose-soup-or-main.jpg"
    },
    5: {
        text: "Выберите главное блюдо",
        image: "choose-main-only.jpg"
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

// Функция для инициализации обработчиков событий
function initOrderHandlers() {
    // Добавляем обработчик клика на все карточки блюд
    document.addEventListener('click', function(event) {
        if (event.target.closest('.dish_card')) {
            handleDishClick(event);
        }
    });
    
    // Добавляем обработчик кнопки "Сбросить заказ"
    const resetOrderButton = document.getElementById('reset-order');
    if (resetOrderButton) {
        resetOrderButton.addEventListener('click', resetOrder);
    }
    
    // Добавляем обработчик кнопки "Сбросить форму"
    const resetFormButton = document.querySelector('button[type="reset"]');
    if (resetFormButton) {
        resetFormButton.addEventListener('click', function() {
            setTimeout(resetOrder, 100); // Сбрасываем заказ после сброса формы
        });
    }

    // Добавляем обработчик отправки формы
    const orderForm = document.querySelector('.order-form__content');
    if (orderForm) {
        orderForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Получаем выбранные категории (без десерта)
            const selectedCategories = getSelectedCategories();
            
            // Проверяем, соответствует ли выбор одному из комбо
            if (checkCombo(selectedCategories)) {
                // Если соответствует - отправляем форму
                this.submit();
            } else {
                // Если не соответствует - определяем тип уведомления и показываем его
                const notificationType = determineNotificationType(selectedCategories);
                if (notificationType) {
                    showNotification(notificationType);
                }
            }
        });
    }

    // Инициализируем первоначальное отображение формы
    updateOrderForm();
}

// Запускаем когда DOM загружен
document.addEventListener('DOMContentLoaded', initOrderHandlers);
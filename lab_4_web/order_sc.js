// Объект для хранения выбранных блюд
let selectedDishes = {
    soup: null,
    dishes: null, 
    drinks: null
};

// Функция для поиска блюда по keyword
function findDishByKeyword(keyword) {
    return dish_arr.find(dish => dish.keyword === keyword);
}

// Функция для обработки клика по карточке блюда
function handleDishClick(event) {
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
            case 'drinks': categoryKey = 'drinks'; break;
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
                case 'drinks': cardCategory = 'drinks'; break;
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
        orderHTML += createOrderDisplay('drinks', 'Напиток');
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
        case 'Напиток': return 'Напиток не выбран';
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
        drinks: null
    };
    
    // Убираем подсветку со всех карточек
    const allCards = document.querySelectorAll('.dish_card');
    allCards.forEach(card => {
        card.classList.remove('selected');
    });
    
    // Обновляем отображение формы
    updateOrderForm();
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
    
    // Инициализируем первоначальное отображение формы
    updateOrderForm();
}

// Запускаем когда DOM загружен
document.addEventListener('DOMContentLoaded', initOrderHandlers);
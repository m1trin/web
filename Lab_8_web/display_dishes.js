function cr_dish(dishes){
    // Проверяем, находимся ли мы на странице оформления заказа
    const isOrderPage = window.location.pathname.includes('order.html');
    
    const buttonText = isOrderPage ? 'Удалить' : 'Добавить';
    const buttonClass = isOrderPage ? 'remove-button' : '';
    
    return `
            <div class = "dish_card" dish_arr = "${dishes.keyword}">
            <img src = "${dishes.image}" alt = "${dishes.name}">
            <p> ${dishes.price} руб. </p>
            <p> ${dishes.name} </p>
            <p> ${dishes.count} </p>
            <button class="${buttonClass}"> ${buttonText} </button>
            </div>
            `;
}

// Функция для отображения блюд по категориям
function displayDishesByCategory() {
    // Группируем блюда по категориям
    const dishesByCategory = {
        soup: dish_arr.filter(dishes => dishes.category === 'soup').sort((a, b) => a.name.localeCompare(b.name)),
        dish: dish_arr.filter(dishes => dishes.category === 'dish').sort((a, b) => a.name.localeCompare(b.name)),
        drinks: dish_arr.filter(dishes => dishes.category === 'drinks').sort((a, b) => a.name.localeCompare(b.name)),
        salats: dish_arr.filter(dishes => dishes.category === 'salats').sort((a, b) => a.name.localeCompare(b.name)),
        deserts: dish_arr.filter(dishes => dishes.category === 'deserts').sort((a, b) => a.name.localeCompare(b.name))
    };

    // Отображаем супы
    const soupsSection = document.querySelector('.soups .dish-grid');
    if (soupsSection) {
        soupsSection.innerHTML = dishesByCategory.soup.map(dishes => cr_dish(dishes)).join('');
        setupFilterButtons('.soups', 'soup');
    }

    // Отображаем главные блюда
    const dishSection = document.querySelector('.dishes .dish-grid');
    if (dishSection) {
        dishSection.innerHTML = dishesByCategory.dish.map(dishes => cr_dish(dishes)).join('');
        setupFilterButtons('.dishes', 'dish');
    }

    // Отображаем напитки
    const drinksSection = document.querySelector('.drinks .dish-grid');
    if (drinksSection) {
        drinksSection.innerHTML = dishesByCategory.drinks.map(dishes => cr_dish(dishes)).join('');
        setupFilterButtons('.drinks', 'drinks');
    }
    
    // Отображаем салаты
    const salatsSection = document.querySelector('.salats .dish-grid');
    if (salatsSection) {
        salatsSection.innerHTML = dishesByCategory.salats.map(dishes => cr_dish(dishes)).join('');
        setupFilterButtons('.salats', 'salats');
    }

    // Отображаем десерты
    const desertsSection = document.querySelector('.deserts .dish-grid');
    if (desertsSection) {
        desertsSection.innerHTML = dishesByCategory.deserts.map(dishes => cr_dish(dishes)).join('');
        setupFilterButtons('.deserts', 'deserts');
    }
}

// Функция для настройки кнопок фильтрации в конкретной секции
function setupFilterButtons(sectionSelector, category) {
    const section = document.querySelector(sectionSelector);
    if (!section) return;
    
    const buttons = section.querySelectorAll('button[type]');
    const dishGrid = section.querySelector('.dish-grid');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс со всех кнопок в этой секции
            buttons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            const filterType = this.getAttribute('type');
            filterDishesInSection(category, filterType, dishGrid);
        });
    });
}

// Функция для фильтрации блюд в конкретной секции
function filterDishesInSection(category, filterType, dishGridElement) {
    let filteredDishes;
    
    if (filterType === 'all' || !filterType) {
        // Показываем все блюда категории
        filteredDishes = dish_arr.filter(dish => dish.category === category);
    } else {
        // Фильтруем по kind
        filteredDishes = dish_arr.filter(dish => 
            dish.category === category && dish.kind === filterType
        );
    }
    
    // Сортируем и отображаем
    filteredDishes.sort((a, b) => a.name.localeCompare(b.name));
    dishGridElement.innerHTML = filteredDishes.map(dish => cr_dish(dish)).join('');
}


document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('order.html')) {
        // Для страницы заказа не нужно вызывать displayDishesByCategory
        return;
    }
    
    loadDishes()
        .then(() => {
            displayDishesByCategory();
            console.log('Все системы запущены!');
        })
        .catch(error => {
            console.error('Ошибка при загрузке:', error);
        });
});
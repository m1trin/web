function cr_dish(dishes){
    return `
            <div class = "dish_card" dish_arr = "${dishes.keyword}">
            <img src = "${dishes.image}.jpg" alt = "${dishes.name}">
            <p> ${dishes.price} руб. </p>
            <p> ${dishes.name} </p>
            <p> ${dishes.count} </p>
            <button> Добавить </button>
            </div>
            `;
}

// Функция для отображения блюд по категориям
function displayDishesByCategory() {
    // Группируем блюда по категориям
    const dishesByCategory = {
        soup: dish_arr.filter(dishes => dishes.category === 'soup').sort((a, b) => a.name.localeCompare(b.name)),
        dish: dish_arr.filter(dishes => dishes.category === 'dish').sort((a, b) => a.name.localeCompare(b.name)),
        drinks: dish_arr.filter(dishes => dishes.category === 'drinks').sort((a, b) => a.name.localeCompare(b.name))
    };

    // Отображаем супы
    const soupsSection = document.querySelector('.soups .dish-grid');
    if (soupsSection) {
        soupsSection.innerHTML = dishesByCategory.soup.map(dishes => cr_dish(dishes)).join('');
    }

    // Отображаем главные блюда
    const dishSection = document.querySelector('.dishes .dish-grid');
    if (dishSection) {
        dishSection.innerHTML = dishesByCategory.dish.map(dishes => cr_dish(dishes)).join('');
    }

    // Отображаем напитки
    const drinksSection = document.querySelector('.drinks .dish-grid');
    if (drinksSection) {
        drinksSection.innerHTML = dishesByCategory.drinks.map(dishes => cr_dish(dishes)).join('');
    }
}

// Запускаем отображение когда DOM загружен
document.addEventListener('DOMContentLoaded', function() {
    displayDishesByCategory();
    console.log('Блюда успешно отображены!');
});
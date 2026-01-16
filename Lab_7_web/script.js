let dish_arr = []

function transformCategoryValue(serverCategoryValue) {
    const categoryValueMap = {
        'soup': 'soup',            // совпадает
        'main-course': 'dish',     // 'main-course' -> 'dish'
        'salad': 'salats',         // 'salad' -> 'salats'
        'drink': 'drinks',         // 'drink' -> 'drinks'
        'dessert': 'deserts'       // 'dessert' -> 'deserts'
    };
    
    return categoryValueMap[serverCategoryValue] || serverCategoryValue;
}

// Функция для загрузки данных с API
function loadDishes() {
    return fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }
            return response.json();
        })
        .then(data => {
            dish_arr = data.map(item => ({
                ...item,
                category: transformCategoryValue(item.category),

            }));
            console.log('Данные с API:', data);
            console.log('Данные успешно загружены с API');
            return dish_arr;
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных:', error);
            throw error;
        });
}
const API_URL = 'https://edu.std-900.ist.mospolytech.ru';
const API_KEY = '62cf6ca7-05c7-4c73-8643-37b6b0145e03';

let orders = [];
let dishesData = []; // Изменим имя, чтобы не конфликтовать с dish_arr

// Загрузка заказов с сервера
async function loadOrders() {
    try {
        console.log('Загружаю заказы по URL:', `${API_URL}/labs/api/orders?api_key=${API_KEY}`);
        
        const response = await fetch(`${API_URL}/labs/api/orders?api_key=${API_KEY}`);
        
        console.log('Статус ответа:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Текст ошибки:', errorText);
            throw new Error(`Ошибка загрузки заказов: ${response.status}`);
        }
        
        const ordersData = await response.json();
        console.log('Получены заказы:', ordersData);
        
        orders = ordersData;
        return orders;
    } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        showNotification('Ошибка при загрузке заказов: ' + error.message, 'error');
        return [];
    }
}

// Получение названия блюда по ID
function getDishNameById(dishId) {
    if (!dishesData || dishesData.length === 0) return 'Неизвестное блюдо';
    const dish = dishesData.find(d => d.id === dishId);
    return dish ? dish.name : 'Неизвестное блюдо';
}

// Форматирование даты
function formatDate(dateString) {
    if (!dateString) return 'Дата не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Форматирование времени доставки
function formatDeliveryTime(order) {
    if (order.delivery_type === 'now') {
        return 'Как можно скорее (с 7:00 до 23:00)';
    } else if (order.delivery_type === 'by_time' && order.delivery_time) {
        return order.delivery_time;
    }
    return 'Не указано';
}

// Получение состава заказа в виде строки
function getOrderComposition(order) {
    const dishes = [];
    if (order.soup_id) dishes.push(getDishNameById(order.soup_id));
    if (order.main_course_id) dishes.push(getDishNameById(order.main_course_id));
    if (order.salad_id) dishes.push(getDishNameById(order.salad_id));
    if (order.drink_id) dishes.push(getDishNameById(order.drink_id));
    if (order.dessert_id) dishes.push(getDishNameById(order.dessert_id));
    
    if (dishes.length === 0) return 'Блюда не выбраны';
    return dishes.join(', ');
}

// Расчет стоимости заказа
function calculateOrderTotal(order) {
    let total = 0;
    if (!dishesData || dishesData.length === 0) return total;
    
    const addDishPrice = (dishId) => {
        const dish = dishesData.find(d => d.id === dishId);
        if (dish) total += dish.price;
    };
    
    if (order.soup_id) addDishPrice(order.soup_id);
    if (order.main_course_id) addDishPrice(order.main_course_id);
    if (order.salad_id) addDishPrice(order.salad_id);
    if (order.drink_id) addDishPrice(order.drink_id);
    if (order.dessert_id) addDishPrice(order.dessert_id);
    
    return total;
}

// Отображение списка заказов
function displayOrders() {
    const container = document.getElementById('orders-container');
    if (!container) {
        console.error('Контейнер заказов не найден!');
        return;
    }
    
    console.log('Отображение заказов. Всего:', orders.length);
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-orders">
                <h3>Заказы не найдены</h3>
                <p>У вас пока нет оформленных заказов</p>
                <p><a href="lanch.html" class="btn btn-primary">Создать первый заказ</a></p>
            </div>
        `;
        return;
    }
    
    // Сортировка по дате (сначала новые)
    const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
    );
    
    let html = '<table class="orders-table"><thead><tr><th>№</th><th>Дата оформления</th><th>Состав заказа</th><th>Стоимость</th><th>Время доставки</th><th>Действия</th></tr></thead><tbody>';
    
    sortedOrders.forEach((order, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${formatDate(order.created_at)}</td>
                <td>${getOrderComposition(order)}</td>
                <td>${calculateOrderTotal(order)} руб.</td>
                <td>${formatDeliveryTime(order)}</td>
                <td class="actions">
                    <button class="btn-icon view-order" data-id="${order.id}" title="Подробнее">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn-icon edit-order" data-id="${order.id}" title="Редактировать">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-icon delete-order" data-id="${order.id}" title="Удалить">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Показ уведомления
function showNotification(message, type = 'info') {
    // Удаляем старые уведомления
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(n => n.remove());
    
    // Создание элемента уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Управление модальными окнами
const modals = {
    details: document.getElementById('order-details-modal'),
    edit: document.getElementById('edit-order-modal'),
    delete: document.getElementById('delete-order-modal')
};

function openModal(modal) {
    if (modal) modal.style.display = 'block';
}

function closeModal(modal) {
    if (modal) modal.style.display = 'none';
}

// Загрузка деталей заказа для просмотра
async function loadOrderDetails(orderId) {
    try {
        const response = await fetch(`${API_URL}/labs/api/orders/${orderId}?api_key=${API_KEY}`);
        if (!response.ok) throw new Error('Ошибка загрузки деталей заказа');
        return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка при загрузке деталей заказа', 'error');
        return null;
    }
}

// Показ деталей заказа в модальном окне
async function showOrderDetails(orderId) {
    const order = await loadOrderDetails(orderId);
    if (!order) return;
    
    const modal = modals.details;
    const title = modal.querySelector('#modal-title');
    const body = modal.querySelector('#modal-body');
    
    title.textContent = `Заказ #${order.id}`;
    
    let html = `
        <div class="order-details">
            <p><strong>Дата оформления:</strong> ${formatDate(order.created_at)}</p>
            <p><strong>Клиент:</strong> ${order.full_name}</p>
            <p><strong>Email:</strong> ${order.email}</p>
            <p><strong>Телефон:</strong> ${order.phone}</p>
            <p><strong>Адрес доставки:</strong> ${order.delivery_address}</p>
            <p><strong>Время доставки:</strong> ${formatDeliveryTime(order)}</p>
            <p><strong>Состав заказа:</strong></p>
            <ul class="order-dishes">
    `;
    
    const addDishInfo = (dishId, label) => {
        if (dishId) {
            const dishName = getDishNameById(dishId);
            const dish = dishesData.find(d => d.id === dishId);
            const price = dish ? dish.price : 0;
            html += `<li>${label}: ${dishName} - ${price} руб.</li>`;
        }
    };
    
    addDishInfo(order.soup_id, 'Суп');
    addDishInfo(order.main_course_id, 'Главное блюдо');
    addDishInfo(order.salad_id, 'Салат');
    addDishInfo(order.drink_id, 'Напиток');
    addDishInfo(order.dessert_id, 'Десерт');
    
    html += `
            </ul>
            <p><strong>Итого:</strong> ${calculateOrderTotal(order)} руб.</p>
            <p><strong>Комментарий:</strong> ${order.comment || 'Нет комментария'}</p>
            <p><strong>Получать рассылку:</strong> ${order.subscribe ? 'Да' : 'Нет'}</p>
        </div>
    `;
    
    body.innerHTML = html;
    openModal(modal);
}

// Загрузка данных для редактирования заказа
async function loadOrderForEdit(orderId) {
    try {
        const response = await fetch(`${API_URL}/labs/api/orders/${orderId}?api_key=${API_KEY}`);
        if (!response.ok) throw new Error('Ошибка загрузки заказа для редактирования');
        return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка при загрузке заказа', 'error');
        return null;
    }
}

// Показ формы редактирования заказа
async function showEditOrderForm(orderId) {
    const order = await loadOrderForEdit(orderId);
    if (!order) return;
    
    const form = document.getElementById('edit-order-form');
    const orderIdInput = document.getElementById('edit-order-id');
    
    if (!form || !orderIdInput) return;
    
    // Заполняем форму данными заказа
    document.getElementById('edit-full_name').value = order.full_name;
    document.getElementById('edit-email').value = order.email;
    document.getElementById('edit-phone').value = order.phone;
    document.getElementById('edit-delivery_address').value = order.delivery_address;
    document.getElementById('edit-comment').value = order.comment || '';
    
    // Устанавливаем тип доставки
    if (order.delivery_type === 'now') {
        document.getElementById('edit-asap').checked = true;
        const timeInput = document.getElementById('edit-delivery_time');
        if (timeInput) timeInput.disabled = true;
    } else {
        document.getElementById('edit-specific-time').checked = true;
        const timeInput = document.getElementById('edit-delivery_time');
        if (timeInput) {
            timeInput.value = order.delivery_time || '';
            timeInput.disabled = false;
        }
    }
    
    orderIdInput.value = order.id;
    openModal(modals.edit);
}

// Обновление заказа
async function updateOrder(orderId, data) {
    try {
        const response = await fetch(`${API_URL}/labs/api/orders/${orderId}?api_key=${API_KEY}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при обновлении заказа');
        }
        
        const result = await response.json();
        showNotification('Заказ успешно обновлен', 'success');
        
        // Обновляем локальный список заказов
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...data };
        }
        
        // Перезагружаем список заказов
        await refreshOrders();
        return result;
        
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

// Удаление заказа
async function deleteOrder(orderId) {
    try {
        const response = await fetch(`${API_URL}/labs/api/orders/${orderId}?api_key=${API_KEY}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при удалении заказа');
        }
        
        showNotification('Заказ успешно удален', 'success');
        
        // Удаляем из локального списка
        orders = orders.filter(order => order.id !== orderId);
        
        // Перезагружаем список заказов
        await refreshOrders();
        
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

// Перезагрузка списка заказов
async function refreshOrders() {
    await loadOrders();
    displayOrders();
}

// Загрузка блюд
async function loadDishesForOrders() {
    try {
        if (typeof window.loadDishes === 'function') {
            dishesData = await window.loadDishes();
            console.log('Блюда загружены через loadDishes:', dishesData.length);
        } else {
            // Загружаем напрямую
            const response = await fetch(`${API_URL}/labs/api/dishes`);
            if (response.ok) {
                dishesData = await response.json();
                console.log('Блюда загружены напрямую:', dishesData.length);
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке блюд:', error);
    }
}

// Инициализация страницы
async function initOrdersPage() {
    console.log('Инициализация страницы заказов...');
    
    try {
        // Загружаем блюда
        await loadDishesForOrders();
        
        // Загружаем заказы
        await loadOrders();
        
        // Отображаем заказы
        displayOrders();
        
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
        showNotification('Ошибка при загрузке страницы: ' + error.message, 'error');
    }
}

// Настройка обработчиков событий
function setupEventHandlers() {
    // Настройка обработчиков событий для модальных окон
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Закрытие модальных окон при клике вне контента
    window.addEventListener('click', function(event) {
        Object.values(modals).forEach(modal => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Обработчики для кнопок действий
    document.addEventListener('click', async function(event) {
        const target = event.target;
        
        // Обработка кнопки просмотра
        if (target.closest('.view-order')) {
            const button = target.closest('.view-order');
            const orderId = parseInt(button.dataset.id);
            await showOrderDetails(orderId);
        }
        
        // Обработка кнопки редактирования
        if (target.closest('.edit-order')) {
            const button = target.closest('.edit-order');
            const orderId = parseInt(button.dataset.id);
            await showEditOrderForm(orderId);
        }
        
        // Обработка кнопки удаления
        if (target.closest('.delete-order')) {
            const button = target.closest('.delete-order');
            const orderId = parseInt(button.dataset.id);
            const deleteInput = document.getElementById('delete-order-id');
            if (deleteInput) deleteInput.value = orderId;
            openModal(modals.delete);
        }
    });
    
    // Обработка переключения типа доставки
    const deliveryTypeRadios = document.querySelectorAll('input[name="delivery_type"]');
    deliveryTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const timeInput = document.getElementById('edit-delivery_time');
            if (timeInput) {
                timeInput.disabled = this.value !== 'by_time';
                if (this.value !== 'by_time') {
                    timeInput.value = '';
                }
            }
        });
    });
    
    // Обработка отправки формы редактирования
    const editForm = document.getElementById('edit-order-form');
    if (editForm) {
        editForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const orderId = document.getElementById('edit-order-id').value;
            const formData = new FormData(this);
            
            const data = {
                full_name: formData.get('full_name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                delivery_address: formData.get('delivery_address'),
                delivery_type: formData.get('delivery_type'),
                comment: formData.get('comment')
            };
            
            if (data.delivery_type === 'by_time') {
                const deliveryTime = formData.get('delivery_time');
                if (deliveryTime) {
                    data.delivery_time = deliveryTime;
                }
            }
            
            try {
                await updateOrder(orderId, data);
                closeModal(modals.edit);
            } catch (error) {
                console.error('Ошибка при обновлении:', error);
            }
        });
    }
    
    // Обработка отмены редактирования
    const editCancelBtn = document.getElementById('edit-cancel');
    if (editCancelBtn) {
        editCancelBtn.addEventListener('click', function() {
            closeModal(modals.edit);
        });
    }
    
    // Обработка подтверждения удаления
    const deleteConfirmBtn = document.getElementById('delete-confirm');
    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', async function() {
            const orderId = document.getElementById('delete-order-id').value;
            try {
                await deleteOrder(orderId);
                closeModal(modals.delete);
            } catch (error) {
                console.error('Ошибка при удалении:', error);
            }
        });
    }
    
    // Обработка отмены удаления
    const deleteCancelBtn = document.getElementById('delete-cancel');
    if (deleteCancelBtn) {
        deleteCancelBtn.addEventListener('click', function() {
            closeModal(modals.delete);
        });
    }
    
    // Обработка кнопки ОК в модальном окне просмотра
    const modalOkBtn = document.getElementById('modal-ok');
    if (modalOkBtn) {
        modalOkBtn.addEventListener('click', function() {
            closeModal(modals.details);
        });
    }
}

// Запуск при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, запускаю инициализацию...');
    
    // Инициализация страницы
    initOrdersPage().catch(error => {
        console.error('Ошибка при инициализации:', error);
    });
    
    // Настройка обработчиков событий
    setupEventHandlers();
});
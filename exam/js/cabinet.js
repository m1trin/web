// ========== ЛИЧНЫЙ КАБИНЕТ (ТОЛЬКО API) ==========

let cabinetOrders = [];
let currentOrdersPage = 1;
const ORDERS_PER_PAGE = 5;

/**
 * Инициализация личного кабинета
 */
async function initCabinet() {
    console.log('Инициализация личного кабинета (API режим)...');
    
    showCabinetLoading(true);
    
    try {
        // Проверяем доступность API
        await testApiConnection();
        
        // Загружаем заявки
        await loadOrders();
        
        // Инициализируем обработчики
        initCabinetEventListeners();
        
    } catch (error) {
        console.error('Ошибка инициализации кабинета:', error);
        showCabinetError('Не удалось загрузить данные с сервера');
    }
}

/**
 * Проверяет подключение к API
 */
async function testApiConnection() {
    try {
        const response = await fetch(getApiUrl('/api/courses'));
        if (!response.ok) {
            throw new Error(`API недоступен (${response.status})`);
        }
        return true;
    } catch (error) {
        throw new Error(`Нет подключения к серверу: ${error.message}`);
    }
}

/**
 * Загружает заявки с сервера
 */
async function loadOrders() {
    try {
        showCabinetLoading(true);
        
        // Загружаем с API
        if (typeof getOrders !== 'function') {
            throw new Error('Функция getOrders не найдена');
        }
        
        cabinetOrders = await getOrders();
        
        // Обновляем отображение
        updateOrdersDisplay();
        updateStatistics();
        
        console.log('Заявки загружены с сервера:', cabinetOrders.length, 'шт.');
        
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
        
        // Показываем ошибку
        showCabinetError(`
            <h5>Ошибка загрузки заявок</h5>
            <p>${error.message}</p>
            <p class="small text-muted">Проверьте подключение к интернету и доступность API сервера</p>
            <button class="btn btn-sm btn-outline-danger mt-2" onclick="loadOrders()">
                Попробовать снова
            </button>
        `);
        
        throw error;
    }
}

/**
 * Обновляет отображение заявок
 */
function updateOrdersDisplay() {
    const tableContainer = document.getElementById('orders-table-container');
    const emptyContainer = document.getElementById('orders-empty');
    const loadingContainer = document.getElementById('orders-loading');
    const tableBody = document.getElementById('orders-table-body');
    
    if (!tableContainer || !emptyContainer || !loadingContainer || !tableBody) {
        console.error('Элементы таблицы заявок не найдены');
        return;
    }
    
    // Скрываем индикатор загрузки
    loadingContainer.style.display = 'none';
    
    if (!cabinetOrders || cabinetOrders.length === 0) {
        // Нет заявок
        tableContainer.classList.add('d-none');
        emptyContainer.classList.remove('d-none');
        document.getElementById('orders-pagination').classList.add('d-none');
        return;
    }
    
    // Есть заявки
    emptyContainer.classList.add('d-none');
    tableContainer.classList.remove('d-none');
    
    // Получаем заявки для текущей страницы
    const startIndex = (currentOrdersPage - 1) * ORDERS_PER_PAGE;
    const endIndex = startIndex + ORDERS_PER_PAGE;
    const paginatedOrders = cabinetOrders.slice(startIndex, endIndex);
    
    // Очищаем таблицу
    tableBody.innerHTML = '';
    
    // Заполняем таблицу
    paginatedOrders.forEach((order, index) => {
        const orderNumber = startIndex + index + 1;
        const row = createOrderRow(order, orderNumber);
        tableBody.appendChild(row);
    });
    
    // Обновляем пагинацию
    updateOrdersPagination();
}

/**
 * Создает строку таблицы для заявки
 */
function createOrderRow(order, orderNumber) {
    const row = document.createElement('tr');
    
    // Форматируем дату
    const dateObj = new Date(order.date_start);
    const formattedDate = dateObj.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    
    // Определяем статус
    let statusClass = 'status-pending';
    let statusText = 'Ожидание';
    
    // Определяем тип заявки
    const typeIcon = order.course_id > 0 
        ? '<i class="bi bi-book me-1"></i>'
        : '<i class="bi bi-person-badge me-1"></i>';
    const typeText = order.course_id > 0 ? 'Курс' : 'Репетитор';
    
    row.innerHTML = `
        <td>${orderNumber}</td>
        <td>${typeIcon} ${typeText}</td>
        <td>
            <strong>${order.name || 'Без названия'}</strong>
            ${order.teacher ? `<div class="text-muted small">${order.teacher}</div>` : ''}
        </td>
        <td>${formattedDate}</td>
        <td>${order.time_start}</td>
        <td>${order.persons} чел.</td>
        <td>
            <strong class="text-success">${order.price} ₽</strong>
            ${order.early_registration ? '<div class="text-muted small">-10% ранняя</div>' : ''}
        </td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
            <div class="actions-buttons">
                <button class="btn btn-sm btn-outline-info me-1" onclick="viewOrderDetails(${order.id})" title="Подробнее">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editOrder(${order.id})" title="Изменить">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteOrder(${order.id})" title="Удалить">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

/**
 * Обновляет пагинацию заявок
 */
function updateOrdersPagination() {
    const paginationContainer = document.getElementById('orders-pagination');
    const paginationList = paginationContainer.querySelector('ul');
    
    if (!paginationContainer || !paginationList) return;
    
    const totalOrders = cabinetOrders.length;
    const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);
    
    if (totalPages <= 1) {
        paginationContainer.classList.add('d-none');
        return;
    }
    
    paginationContainer.classList.remove('d-none');
    
    let html = '';
    
    // Кнопка "Назад"
    if (currentOrdersPage > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changeOrdersPage(${currentOrdersPage - 1})" aria-label="Назад">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;
    }
    
    // Номера страниц
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${i === currentOrdersPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changeOrdersPage(${i})">${i}</a>
            </li>
        `;
    }
    
    // Кнопка "Вперед"
    if (currentOrdersPage < totalPages) {
        html += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changeOrdersPage(${currentOrdersPage + 1})" aria-label="Вперед">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;
    }
    
    paginationList.innerHTML = html;
}

/**
 * Меняет текущую страницу заявок
 */
function changeOrdersPage(page) {
    const totalPages = Math.ceil(cabinetOrders.length / ORDERS_PER_PAGE);
    
    if (page < 1 || page > totalPages) {
        return;
    }
    
    currentOrdersPage = page;
    updateOrdersDisplay();
    
    // Прокрутка к началу таблицы
    const ordersTable = document.getElementById('orders-table-container');
    if (ordersTable) {
        ordersTable.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Обновляет статистику
 */
function updateStatistics() {
    const totalOrders = cabinetOrders.length;
    const activeOrders = cabinetOrders.filter(o => o.status === 'active').length;
    const pendingOrders = cabinetOrders.filter(o => o.status === 'pending').length;
    const totalCost = cabinetOrders.reduce((sum, order) => sum + order.price, 0);
    
    // Обновляем элементы
    const totalElement = document.getElementById('total-orders');
    const activeElement = document.getElementById('active-orders');
    const pendingElement = document.getElementById('pending-orders');
    const costElement = document.getElementById('total-cost');
    
    if (totalElement) totalElement.textContent = totalOrders;
    if (activeElement) activeElement.textContent = activeOrders;
    if (pendingElement) pendingElement.textContent = pendingOrders;
    if (costElement) costElement.textContent = `${totalCost} ₽`;
}

/**
 * Удаляет заявку через API
 */
async function deleteOrder(orderId) {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) {
        return;
    }
    
    try {
        showCabinetNotification('info', 'Удаление заявки...');
        
        // DELETE запрос к API
        if (typeof deleteOrderApi !== 'function') {
            throw new Error('Функция deleteOrderApi не найдена');
        }
        
        await deleteOrderApi(orderId);
        
        // Удаляем из локального массива
        cabinetOrders = cabinetOrders.filter(o => o.id !== orderId);
        
        // Обновляем отображение
        updateOrdersDisplay();
        updateStatistics();
        
        // Корректируем пагинацию
        const totalPages = Math.ceil(cabinetOrders.length / ORDERS_PER_PAGE);
        if (currentOrdersPage > totalPages && totalPages > 0) {
            currentOrdersPage = totalPages;
            updateOrdersDisplay();
        }
        
        showCabinetNotification('success', 'Заявка успешно удалена');
        
    } catch (error) {
        console.error('Ошибка удаления заявки:', error);
        showCabinetNotification('danger', `Ошибка удаления: ${error.message}`);
    }
}

/**
 * Редактирует заявку
 */
async function editOrder(orderId) {
    try {
        showCabinetNotification('info', 'Загрузка данных заявки...');
        
        // Загружаем данные заявки
        if (typeof getOrderDetails !== 'function') {
            throw new Error('Функция getOrderDetails не найдена');
        }
        
        const order = await getOrderDetails(orderId);
        
        // Открываем модальное окно редактирования
        if (typeof loadOrderForEditing === 'function') {
            loadOrderForEditing(orderId, order);
        } else {
            showCabinetNotification('warning', 'Функция редактирования недоступна');
        }
        
    } catch (error) {
        console.error('Ошибка загрузки заявки:', error);
        showCabinetNotification('danger', `Ошибка: ${error.message}`);
    }
}

/**
 * Показывает детали заявки
 */
async function viewOrderDetails(orderId) {
    try {
        // Пробуем загрузить детали с сервера
        let order;
        
        if (typeof getOrderDetails === 'function') {
            order = await getOrderDetails(orderId);
        } else {
            // Ищем в локальном массиве
            order = cabinetOrders.find(o => o.id === orderId);
        }
        
        if (!order) {
            throw new Error('Заявка не найдена');
        }
        
        // Форматируем и показываем
        showOrderDetailsModal(order);
        
    } catch (error) {
        console.error('Ошибка загрузки деталей:', error);
        showCabinetNotification('danger', `Ошибка: ${error.message}`);
    }
}

/**
 * Показывает модальное окно с деталями заявки
 */
function showOrderDetailsModal(order) {
    // Форматируем дату
    const date = new Date(order.date_start);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Определяем тип
    const typeText = order.course_id > 0 ? 'Курс' : 'Занятие с репетитором';
    const typeIcon = order.course_id > 0 ? 'bi-book' : 'bi-person-badge';
    
    // Формируем HTML
    const html = `
        <div class="row">
            <div class="col-md-6 mb-3">
                <h6><i class="bi ${typeIcon} me-2"></i>Тип</h6>
                <p class="fs-5">${typeText}</p>
            </div>
            <div class="col-md-6 mb-3">
                <h6><i class="bi bi-calendar me-2"></i>Дата</h6>
                <p class="fs-5">${formattedDate}</p>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <h6><i class="bi bi-clock me-2"></i>Время</h6>
                <p>${order.time_start}</p>
            </div>
            <div class="col-md-6">
                <h6><i class="bi bi-people me-2"></i>Количество</h6>
                <p>${order.persons} человек</p>
            </div>
        </div>
        
        <div class="alert alert-success">
            <h6><i class="bi bi-currency-exchange me-2"></i>Стоимость</h6>
            <h3 class="mb-0">${order.price} ₽</h3>
        </div>
        
        <div class="mt-3">
            <h6>Дополнительные опции:</h6>
            <ul class="list-unstyled">
                ${order.early_registration ? '<li><i class="bi bi-check-circle text-success me-2"></i>Ранняя регистрация</li>' : ''}
                ${order.intensive_course ? '<li><i class="bi bi-check-circle text-success me-2"></i>Интенсивный курс</li>' : ''}
                ${order.supplementary ? '<li><i class="bi bi-check-circle text-success me-2"></i>Дополнительные материалы</li>' : ''}
                ${order.personalized ? '<li><i class="bi bi-check-circle text-success me-2"></i>Персонализированные занятия</li>' : ''}
            </ul>
        </div>
    `;
    
    // Заполняем модальное окно
    const content = document.getElementById('order-details-content');
    if (content) {
        content.innerHTML = html;
    }
    
    // Показываем модальное окно
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}

/**
 * Показывает ошибку в интерфейсе
 */
function showCabinetError(message) {
    const loading = document.getElementById('orders-loading');
    if (loading) {
        loading.innerHTML = `
            <div class="alert alert-danger">
                ${message}
            </div>
        `;
    }
}

/**
 * Показывает уведомление в кабинете
 */
function showCabinetNotification(type, message, timeout = 3000) {
    const area = document.getElementById('cabinet-notifications');
    if (!area) {
        console.log(`[Кабинет ${type}]: ${message}`);
        return;
    }
    
    const alertClass = {
        'success': 'alert-success',
        'danger': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    }[type] || 'alert-info';
    
    const html = `
        <div class="alert ${alertClass} alert-dismissible fade show">
            ${message}
            <button class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    area.innerHTML = html;
    
    if (timeout > 0) {
        setTimeout(() => {
            area.innerHTML = '';
        }, timeout);
    }
}

/**
 * Показывает/скрывает индикатор загрузки
 */
function showCabinetLoading(show) {
    const loadingContainer = document.getElementById('orders-loading');
    const tableContainer = document.getElementById('orders-table-container');
    const emptyContainer = document.getElementById('orders-empty');
    
    if (!loadingContainer || !tableContainer || !emptyContainer) return;
    
    if (show) {
        loadingContainer.style.display = 'block';
        loadingContainer.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка заявок...</span>
                </div>
                <p class="mt-3">Загрузка ваших заявок с сервера...</p>
            </div>
        `;
        tableContainer.classList.add('d-none');
        emptyContainer.classList.add('d-none');
    }
}

/**
 * Инициализирует обработчики событий личного кабинета
 */
function initCabinetEventListeners() {
    // Обработчик для кнопки "Обновить" в шапке
    const refreshBtn = document.querySelector('button[onclick="loadOrders()"]');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loadOrders();
        });
    }
    
    console.log('Обработчики личного кабинета инициализированы');
}

// Экспорт функций
window.initCabinet = initCabinet;
window.loadOrders = loadOrders;
window.viewOrderDetails = viewOrderDetails;
window.editOrder = editOrder;
window.deleteOrder = deleteOrder;
window.changeOrdersPage = changeOrdersPage;
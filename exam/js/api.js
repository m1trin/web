// ========== API КОНФИГУРАЦИЯ И ФУНКЦИИ ==========

// Глобальные переменные для данных
window.courses_arr = [];
window.tutors_arr = [];

// Конфигурация API
const API_BASE_URL = 'http://exam-api-courses.std-900.ist.mospolytech.ru';
const DEFAULT_API_KEY = '62cf6ca7-05c7-4c73-8643-37b6b0145e03';
let API_KEY = DEFAULT_API_KEY;

/**
 * Устанавливает API ключ
 */
function setApiKey(key) {
    API_KEY = key;
    localStorage.setItem('polyLangApiKey', key);
    console.log('API ключ установлен');
}

/**
 * Загружает API ключ из localStorage
 */
function loadApiKey() {
    const savedKey = localStorage.getItem('polyLangApiKey');
    if (savedKey) {
        API_KEY = savedKey;
        console.log('API ключ загружен из localStorage');
    } else {
        API_KEY = DEFAULT_API_KEY;
        console.log('Используется ключ API по умолчанию');
    }
}

/**
 * Создает URL для API запроса
 */
function getApiUrl(endpoint) {
    if (!API_KEY) {
        console.error('API ключ не установлен!');
        return null;
    }
    
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    return `${API_BASE_URL}${normalizedEndpoint}?api_key=${API_KEY}`;
}

/**
 * Базовый запрос к API
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = getApiUrl(endpoint);
    
    if (!url) {
        throw new Error('API ключ не установлен');
    }
    
    console.log(`API запрос: ${method} ${endpoint}`);
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        mode: 'cors'
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }
    
    return await response.json();
}

/**
 * Получить список курсов
 */
async function getCourses() {
    try {
        const courses = await apiRequest('/api/courses', 'GET');
        window.courses_arr = courses;
        console.log('Курсы получены:', courses.length, 'шт.');
        return courses;
    } catch (error) {
        console.error('Ошибка получения курсов:', error);
        window.courses_arr = [];
        return [];
    }
}

/**
 * Получить список репетиторов
 */
async function getTutors() {
    try {
        const tutors = await apiRequest('/api/tutors', 'GET');
        window.tutors_arr = tutors;
        console.log('Репетиторы получены:', tutors.length, 'шт.');
        return tutors;
    } catch (error) {
        console.error('Ошибка получения репетиторов:', error);
        window.tutors_arr = [];
        return [];
    }
}

// ========== API ФУНКЦИИ ДЛЯ ЗАЯВОК ==========

/**
 * Получить список заявок пользователя
 */
async function getOrders() {
    try {
        const orders = await apiRequest('/api/orders', 'GET');
        console.log('Заявки получены:', orders.length, 'шт.');
        return orders;
    } catch (error) {
        console.error('Ошибка получения заявок:', error);
        throw error;
    }
}

/**
 * Получить детали заявки
 */
async function getOrderDetails(orderId) {
    try {
        const order = await apiRequest(`/api/orders/${orderId}`, 'GET');
        console.log('Детали заявки получены:', order);
        return order;
    } catch (error) {
        console.error('Ошибка получения деталей заявки:', error);
        throw error;
    }
}

/**
 * Создать заявку
 */
async function createOrder(orderData) {
    try {
        const response = await apiRequest('/api/orders', 'POST', orderData);
        console.log('Заявка создана:', response);
        return response;
    } catch (error) {
        console.error('Ошибка создания заявки:', error);
        throw error;
    }
}

/**
 * Обновить заявку
 */
async function updateOrder(orderId, orderData) {
    try {
        const response = await apiRequest(`/api/orders/${orderId}`, 'PUT', orderData);
        console.log('Заявка обновлена:', response);
        return response;
    } catch (error) {
        console.error('Ошибка обновления заявки:', error);
        throw error;
    }
}

/**
 * Удалить заявку
 */
async function deleteOrderApi(orderId) {
    try {
        const response = await apiRequest(`/api/orders/${orderId}`, 'DELETE');
        console.log('Заявка удалена через API:', response);
        return response;
    } catch (error) {
        console.error('Ошибка удаления заявки:', error);
        throw error;
    }
}

// Экспорт функций
window.getOrders = getOrders;
window.getOrderDetails = getOrderDetails;
window.createOrder = createOrder;
window.updateOrder = updateOrder;
window.deleteOrderApi = deleteOrderApi;
window.setApiKey = setApiKey;
window.loadApiKey = loadApiKey;
window.getCourses = getCourses;
window.getTutors = getTutors;
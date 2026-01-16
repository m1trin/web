// ========== API КОНФИГУРАЦИЯ ==========

// Импортируем конфигурацию
const API_BASE_URL = 'http://exam-api-courses.std-900.ist.mospolytech.ru';
const DEFAULT_API_KEY = '62cf6ca7-05c7-4c73-8643-37b6b0145e03';

let API_KEY = DEFAULT_API_KEY;

// /
//  * Устанавливает API ключ
//  * @param {string} key - API ключ
//  */
function setApiKey(key) {
    API_KEY = key;
    localStorage.setItem('polyLangApiKey', key);
    console.log('API ключ установлен:', key.substring(0, 8) + '...');
}

// /
//  * Загружает API ключ из localStorage
//  * Если нет в localStorage, использует ключ по умолчанию
//  */
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

// /
//  * Создает URL с API ключом
//  * @param {string} endpoint - Конечная точка API
//  * @returns {string} Полный URL
//  */
function getApiUrl(endpoint) {
    if (!API_KEY) {
        console.error('API ключ не установлен!');
        showNotification('Ошибка: API ключ не установлен', 'danger');
        return null;
    }
    
    // Убедимся, что endpoint начинается с /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    
    const originalUrl = `${API_BASE_URL}${normalizedEndpoint}?api_key=${API_KEY}`;
    
    // Если мы на GitHub Pages, добавляем прокси
    if (window.location.hostname.includes('github.io')) {
        // Используем CORS прокси
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(originalUrl);
        console.log('Используем прокси для GitHub Pages');
        return proxyUrl;
    }
    
    // Локально работаем как обычно
    return originalUrl;
}
// /
//  * Базовый запрос к API
//  * @param {string} endpoint - Конечная точка API
//  * @param {string} method - HTTP метод (GET, POST, PUT, DELETE)
//  * @param {Object} data - Данные для отправки (для POST/PUT)
//  * @returns {Promise} Promise с результатом
//  */
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = getApiUrl(endpoint);
    
    if (!url) {
        throw new Error('Не удалось создать URL запроса');
    }
    
    console.log('API запрос: ${method} ${endpoint}');
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error,  'Ошибка ${response.status}: ${response.statusText}');
        }
        
        console.log('API ответ от ${endpoint}:', result);
        return result;
    } catch (error) {
        console.error('Ошибка API запроса:', error);
        showNotification('Ошибка API: ${error.message}', 'danger');
        throw error;
    }
}

// /
//  * Получить список курсов
//  * @returns {Promise<Array>} Массив курсов
//  */
async function getCourses() {
    try {
        return await apiRequest('/api/courses', 'GET');
    } catch (error) {
        console.error('Ошибка получения курсов:', error);
        return [];
    }
}

// /
//  * Получить список репетиторов
//  * @returns {Promise<Array>} Массив репетиторов
//  */
async function getTutors() {
    try {
        return await apiRequest('/api/tutors', 'GET');
    } catch (error) {
        console.error('Ошибка получения репетиторов:', error);
        return [];
    }
}


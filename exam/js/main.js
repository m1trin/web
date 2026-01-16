// ========== ГЛАВНЫЙ ФАЙЛ - ИНИЦИАЛИЗАЦИЯ ==========

console.log('Language School — главная страница загружена');

/**
 * Показывает индикатор загрузки
 */
function showLoadingIndicator() {
    const coursesList = document.getElementById('courses-list');
    const tutorsList = document.getElementById('tutors-list');
    
    if (coursesList) {
        coursesList.innerHTML = `
            <div class="col-12">
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Загрузка курсов...</span>
                    </div>
                    <p class="mt-2">Загрузка данных...</p>
                </div>
            </div>
        `;
    }
    
    if (tutorsList) {
        tutorsList.innerHTML = `
            <div class="col-12">
                <div class="text-center py-4">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Загрузка репетиторов...</span>
                    </div>
                    <p class="mt-2">Загрузка данных...</p>
                </div>
            </div>
        `;
    }
}

/**
 * Показывает сообщение об ошибке
 */
function showError(error, target = 'general') {
    const errorMessage = error.message || 'Заполните обязательные поля';
    
    console.error(`Ошибка (${target}):`, error);
    
    // Определяем, куда показывать ошибку
    if (target === 'courses') {
        // Ошибка только для курсов
        const coursesList = document.getElementById('courses-list');
        if (coursesList) {
            coursesList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <h5>Ошибка загрузки курсов</h5>
                        <p>${errorMessage}</p>
                        <button class="btn btn-sm btn-outline-danger mt-2" onclick="location.reload()">
                            Перезагрузить страницу
                        </button>
                    </div>
                </div>
            `;
        }
        
    } else if (target === 'tutors') {
        // Ошибка только для репетиторов
        const tutorsList = document.getElementById('tutors-list');
        if (tutorsList) {
            tutorsList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <h5>Ошибка загрузки репетиторов</h5>
                        <p>${errorMessage}</p>
                        <button class="btn btn-sm btn-outline-danger mt-2" onclick="location.reload()">
                            Перезагрузить страницу
                        </button>
                    </div>
                </div>
            `;
        }
        
    } else {
        // Общая ошибка - используем систему уведомлений
        if (typeof showNotification === 'function') {
            showNotification(`Ошибка: ${errorMessage}`, 'danger');
        } else {
            // Fallback - простой alert
            alert(`Ошибка: ${errorMessage}`);
        }
        
        // НЕ трогаем курсы и репетиторы при общей ошибке!
    }
}

/**
 * Показывает ошибку загрузки курсов
 */
function showCoursesError(error) {
    return showError(error, 'courses');
}

/**
 * Показывает ошибку загрузки репетиторов
 */
function showTutorsError(error) {
    return showError(error, 'tutors');
}

/**
 * Инициализирует обработчики событий
 */
function initEventListeners() {
    // Обработчик формы поиска курсов
    const searchForm = document.getElementById('course-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (typeof searchCourses === 'function') {
                searchCourses();
            }
        });
    }
    
    console.log('Обработчики событий инициализированы');
}

/**
 * Основная функция инициализации
 */
/**
 * Основная функция инициализации
 */
async function initApp() {
    console.log('Инициализация приложения...');
    
    // Показываем индикатор загрузки
    showLoadingIndicator();
    
    // Показываем уведомление о начале загрузки
    if (typeof showLoadingNotification === 'function') {
        window.loadingNotificationId = showLoadingNotification('Загрузка данных с сервера...', false);
    }
    
    try {
        // Загружаем API ключ
        if (typeof loadApiKey === 'function') {
            loadApiKey();
        }
        
        // Загружаем данные
        console.log('Загрузка данных с API...');
        
        // Загружаем курсы и репетиторы параллельно, но с раздельной обработкой ошибок
        const [courses, tutors] = await Promise.allSettled([
            typeof getCourses === 'function' ? getCourses() : Promise.resolve([]),
            typeof getTutors === 'function' ? getTutors() : Promise.resolve([])
        ]);
        
        // Обрабатываем результат загрузки курсов
        if (courses.status === 'fulfilled') {
            window.courses_arr = courses.value;
            console.log('Курсы загружены:', window.courses_arr?.length || 0, 'шт.');
        } else {
            console.error('Ошибка загрузки курсов:', courses.reason);
            showCoursesError(courses.reason);
        }
        
        // Обрабатываем результат загрузки репетиторов
        if (tutors.status === 'fulfilled') {
            window.tutors_arr = tutors.value;
            console.log('Репетиторы загружены:', window.tutors_arr?.length || 0, 'шт.');
        } else {
            console.error('Ошибка загрузки репетиторов:', tutors.reason);
            showTutorsError(tutors.reason);
        }
        
        // Закрываем уведомление о загрузке
        if (window.loadingNotificationId && typeof removeNotification === 'function') {
            removeNotification(window.loadingNotificationId);
            delete window.loadingNotificationId;
        }
        
        // Отображаем данные, если они загружены
        if (window.courses_arr && window.courses_arr.length > 0) {
            if (typeof updateCoursesDisplay === 'function') {
                updateCoursesDisplay();
            } else if (typeof displayCourses === 'function') {
                displayCourses();
            }
        }
        
        if (window.tutors_arr && window.tutors_arr.length > 0) {
            if (typeof displayTutors === 'function') {
                displayTutors();
            }
        }
        
        // Инициализируем обработчики событий
        initEventListeners();
        
        // Показываем общее уведомление об успехе
        if (typeof showSuccess === 'function') {
            const loadedCourses = window.courses_arr?.length || 0;
            const loadedTutors = window.tutors_arr?.length || 0;
            
            if (loadedCourses > 0 || loadedTutors > 0) {
                showSuccess(`Данные загружены: ${loadedCourses} курсов, ${loadedTutors} репетиторов`, 3000);
            }
        }
        
        console.log('Приложение инициализировано');
        
    } catch (error) {
        console.error('Критическая ошибка инициализации приложения:', error);
        
        // Закрываем уведомление о загрузке если есть
        if (window.loadingNotificationId && typeof removeNotification === 'function') {
            removeNotification(window.loadingNotificationId);
            delete window.loadingNotificationId;
        }
        
        // Показываем общую ошибку
        showError(error, 'general');
    }
}
/**
 * Тестовая функция для отладки
 */
function testApp() {
    console.log('Тест приложения:');
    console.log('- courses_arr доступен:', typeof window.courses_arr !== 'undefined');
    console.log('- tutors_arr доступен:', typeof window.tutors_arr !== 'undefined');
    console.log('- getCourses доступна:', typeof getCourses === 'function');
    console.log('- displayCourses доступна:', typeof displayCourses === 'function');
}

/**
 * Инициализирует обработчики событий
 */
/** */
function initEventListeners() {
    // Обработчик формы поиска курсов
    const searchForm = document.getElementById('course-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (typeof searchCourses === 'function') {
                searchCourses();
                
                // Показываем уведомление о поиске
                if (typeof showInfo === 'function') {
                    const nameInput = document.getElementById('course-name');
                    const levelSelect = document.getElementById('course-level');
                    const hasSearch = nameInput.value || (levelSelect.value && levelSelect.value !== 'all');
                    
                    if (hasSearch) {
                        showInfo('Выполняется поиск курсов...', 2000);
                    }
                }
            }
        });
    }
    
    // Обработчик формы поиска репетиторов
    const tutorSearchForm = document.getElementById('tutor-search-form');
    if (tutorSearchForm) {
        tutorSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (typeof searchTutors === 'function') {
                searchTutors();
                
                // Показываем уведомление о поиске
                if (typeof showInfo === 'function') {
                    showInfo('Выполняется поиск репетиторов...', 2000);
                }
            }
        });
    }
    
    // Инициализация интерактивного поиска репетиторов
    if (typeof initTutorsSearch === 'function') {
        initTutorsSearch();
    }
    
    // Инициализация обработчиков ошибок
    if (typeof initErrorHandlers === 'function') {
        initErrorHandlers();
    }
    
    console.log('Обработчики событий инициализированы');
}

/**
 * Основная функция инициализации
 */
async function initApp() {
    console.log('Инициализация приложения...');
    
    // Показываем индикатор загрузки
    showLoadingIndicator();
    
    // Показываем уведомление о начале загрузки
    if (typeof showLoadingNotification === 'function') {
        window.loadingNotificationId = showLoadingNotification('Загрузка данных с сервера...', false);
    }
    
    try {
        // Загружаем API ключ
        if (typeof loadApiKey === 'function') {
            loadApiKey();
        }
        
        // Загружаем данные
        console.log('Загрузка данных с API...');
        await Promise.all([
            typeof getCourses === 'function' ? getCourses() : Promise.resolve([]),
            typeof getTutors === 'function' ? getTutors() : Promise.resolve([])
        ]);
        
        // Закрываем уведомление о загрузке
        if (window.loadingNotificationId && typeof removeNotification === 'function') {
            removeNotification(window.loadingNotificationId);
            delete window.loadingNotificationId;
        }
        
        // Показываем уведомление об успешной загрузке
        if (typeof showSuccess === 'function') {
            showSuccess(`Данные загружены: ${window.courses_arr?.length || 0} курсов, ${window.tutors_arr?.length || 0} репетиторов`, 3000);
        }
        
        console.log('Данные успешно загружены:');
        console.log('- Курсы:', window.courses_arr?.length || 0, 'шт.');
        console.log('- Репетиторы:', window.tutors_arr?.length || 0, 'шт.');
        
        // Отображаем данные
        if (typeof updateCoursesDisplay === 'function') {
            updateCoursesDisplay();
        } else if (typeof displayCourses === 'function') {
            displayCourses();
        }
        
        if (typeof displayTutors === 'function') {
            displayTutors();
        }
        
        // Инициализируем обработчики событий
        initEventListeners();
        
        console.log('Приложение успешно инициализировано');
        
    } catch (error) {
        // Закрываем уведомление о загрузке если есть
        if (window.loadingNotificationId && typeof removeNotification === 'function') {
            removeNotification(window.loadingNotificationId);
            delete window.loadingNotificationId;
        }
        
        // Показываем уведомление об ошибке
        if (typeof showError === 'function') {
            showError(`Ошибка загрузки данных: ${error.message}`, 10000);
        }
        
        console.error('Ошибка инициализации приложения:', error);
        showError(error);
    }
}

// Добавляем в конец main.js
/**
 * Восстанавливает отображение курсов после ошибки
 */
function restoreCoursesDisplay() {
    if (window.courses_arr && window.courses_arr.length > 0) {
        if (typeof updateCoursesDisplay === 'function') {
            updateCoursesDisplay();
        } else if (typeof displayCourses === 'function') {
            displayCourses();
        }
    }
}

/**
 * Восстанавливает отображение репетиторов после ошибки
 */
function restoreTutorsDisplay() {
    if (window.tutors_arr && window.tutors_arr.length > 0) {
        if (typeof displayTutors === 'function') {
            displayTutors();
        }
    }
}

/**
 * Глобальный обработчик ошибок, который не ломает интерфейс
 */
window.addEventListener('error', function(event) {
    console.error('Глобальная ошибка:', event.error);
    
    // Предотвращаем замену контента при ошибках
    if (event.error && event.error.message && 
        event.error.message.includes('showError') &&
        !window.location.pathname.includes('cabinet.html')) {
        
        // Восстанавливаем отображение курсов и репетиторов
        restoreCoursesDisplay();
        restoreTutorsDisplay();
        
        // Показываем уведомление вместо замены контента
        if (typeof showNotification === 'function') {
            showNotification('Произошла ошибка при обработке запроса', 'warning');
        }
        
        event.preventDefault();
    }
});

// Экспорт тестовой функции
window.testApp = testApp;

// Запуск приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');
    
    // Небольшая задержка для гарантии загрузки всех скриптов
    setTimeout(() => {
        initApp();
    }, 100);
});

// Экспортируем функции восстановления
window.restoreCoursesDisplay = restoreCoursesDisplay;
window.restoreTutorsDisplay = restoreTutorsDisplay;
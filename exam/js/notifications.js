// ========== СИСТЕМА УВЕДОМЛЕНИЙ ==========

/**
 * Показывает уведомление
 * @param {string} message - Текст сообщения
 * @param {string} type - Тип (success, danger, warning, info, primary)
 * @param {number} timeout - Время автоматического скрытия (мс), 0 - не скрывать
 * @param {boolean} closeable - Можно ли закрыть вручную
 * @returns {string} ID уведомления
 */
function showNotification(message, type = 'info', timeout = 5000, closeable = true) {
    const notificationArea = document.getElementById('notification-area');
    if (!notificationArea) {
        console.error('Область уведомлений не найдена');
        return null;
    }
    
    // Создаем уникальный ID для уведомления
    const notificationId = 'notification-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Определяем иконку в зависимости от типа
    const iconMap = {
        'success': 'bi-check-circle',
        'danger': 'bi-exclamation-triangle',
        'warning': 'bi-exclamation-circle',
        'info': 'bi-info-circle',
        'primary': 'bi-bell'
    };
    const iconClass = iconMap[type] || 'bi-info-circle';
    
    // Определяем классы Bootstrap
    const alertClass = {
        'success': 'alert-success',
        'danger': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info',
        'primary': 'alert-primary'
    }[type] || 'alert-info';
    
    // Создаем HTML уведомления
    const html = `
        <div id="${notificationId}" class="alert ${alertClass} alert-dismissible fade show notification-item" role="alert">
            <div class="d-flex align-items-center">
                <i class="bi ${iconClass} me-2 fs-5"></i>
                <div class="flex-grow-1">${message}</div>
                ${closeable ? `
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Закрыть"></button>
                ` : ''}
            </div>
        </div>
    `;
    
    // Добавляем уведомление в начало области
    notificationArea.insertAdjacentHTML('afterbegin', html);
    
    // Автоматическое скрытие через timeout
    if (timeout > 0) {
        const autoCloseTimeout = setTimeout(() => {
            removeNotification(notificationId);
        }, timeout);
        
        // Сохраняем timeout ID для возможности отмены
        window[notificationId + '_timeout'] = autoCloseTimeout;
    }
    
    console.log(`Уведомление показано: ${type} - ${message.substring(0, 50)}...`);
    return notificationId;
}

/**
 * Удаляет уведомление по ID
 */
function removeNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
        // Очищаем timeout если он был
        if (window[notificationId + '_timeout']) {
            clearTimeout(window[notificationId + '_timeout']);
            delete window[notificationId + '_timeout'];
        }
        
        // Используем Bootstrap для плавного скрытия
        const bsAlert = new bootstrap.Alert(notification);
        bsAlert.close();
        
        // Удаляем элемент из DOM после анимации
        notification.addEventListener('closed.bs.alert', function() {
            notification.remove();
        });
    }
}

/**
 * Удаляет все уведомления
 */
function clearAllNotifications() {
    const notificationArea = document.getElementById('notification-area');
    if (!notificationArea) return;
    
    // Находим все уведомления
    const notifications = notificationArea.querySelectorAll('.notification-item');
    
    // Удаляем каждое уведомление
    notifications.forEach(notification => {
        const bsAlert = new bootstrap.Alert(notification);
        bsAlert.close();
        
        // Очищаем связанные таймауты
        const notificationId = notification.id;
        if (window[notificationId + '_timeout']) {
            clearTimeout(window[notificationId + '_timeout']);
            delete window[notificationId + '_timeout'];
        }
    });
    
    console.log('Все уведомления очищены');
}

/**
 * Показывает уведомление об успехе
 */
function showSuccess(message, timeout = 5000) {
    return showNotification(message, 'success', timeout);
}

/**
 * Показывает уведомление об ошибке
 */
function showError(message, timeout = 5000) {
    return showNotification(message, 'danger', timeout);
}

/**
 * Показывает предупреждение
 */
function showWarning(message, timeout = 5000) {
    return showNotification(message, 'warning', timeout);
}

/**
 * Показывает информационное уведомление
 */
function showInfo(message, timeout = 5000) {
    return showNotification(message, 'info', timeout);
}

/**
 * Показывает уведомление о загрузке
 */
function showLoadingNotification(message = 'Загрузка...', closeable = false) {
    return showNotification(`
        <div class="d-flex align-items-center">
            <div class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Загрузка...</span>
            </div>
            <span>${message}</span>
        </div>
    `, 'info', 0, closeable);
}

/**
 * Показывает уведомление с действиями (кнопками)
 */
function showActionNotification(message, actions = [], type = 'info', timeout = 10000) {
    const notificationId = 'notification-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const notificationArea = document.getElementById('notification-area');
    
    if (!notificationArea) return null;
    
    const alertClass = {
        'success': 'alert-success',
        'danger': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info',
        'primary': 'alert-primary'
    }[type] || 'alert-info';
    
    // Создаем кнопки действий
    let actionsHtml = '';
    if (actions && actions.length > 0) {
        actionsHtml = '<div class="mt-2 d-flex gap-2">';
        actions.forEach((action, index) => {
            const btnClass = action.type === 'primary' ? 'btn-primary' : 
                            action.type === 'danger' ? 'btn-danger' : 
                            action.type === 'warning' ? 'btn-warning' : 'btn-secondary';
            actionsHtml += `
                <button class="btn btn-sm ${btnClass}" 
                        onclick="${action.onclick}; removeNotification('${notificationId}')">
                    ${action.text}
                </button>
            `;
        });
        actionsHtml += '</div>';
    }
    
    const html = `
        <div id="${notificationId}" class="alert ${alertClass} alert-dismissible fade show notification-item" role="alert">
            <div class="d-flex align-items-start">
                <i class="bi bi-info-circle me-2 mt-1"></i>
                <div class="flex-grow-1">
                    <div>${message}</div>
                    ${actionsHtml}
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Закрыть"></button>
            </div>
        </div>
    `;
    
    notificationArea.insertAdjacentHTML('afterbegin', html);
    
    if (timeout > 0) {
        window[notificationId + '_timeout'] = setTimeout(() => {
            removeNotification(notificationId);
        }, timeout);
    }
    
    return notificationId;
}

/**
 * Инициализирует глобальные обработчики ошибок
 */
function initErrorHandlers() {
    // Обработчик глобальных ошибок JavaScript
    window.addEventListener('error', function(event) {
        const errorMessage = event.error ? event.error.message : event.message;
        showError(`JavaScript ошибка: ${errorMessage}`, 10000);
    });
    
    // Обработчик неперехваченных промисов
    window.addEventListener('unhandledrejection', function(event) {
        const errorMessage = event.reason ? event.reason.message : 'Неизвестная ошибка промиса';
        showError(`Ошибка промиса: ${errorMessage}`, 10000);
    });
    
    console.log('Глобальные обработчики ошибок инициализированы');
}

// Экспорт функций
window.showNotification = showNotification;
window.removeNotification = removeNotification;
window.clearAllNotifications = clearAllNotifications;
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
window.showInfo = showInfo;
window.showLoadingNotification = showLoadingNotification;
window.showActionNotification = showActionNotification;
window.initErrorHandlers = initErrorHandlers;
// ========== МОДАЛЬНЫЕ ОКНА ДЛЯ ЗАЯВОК ==========

let currentCourseForOrder = null;
let currentTutorForOrder = null;
let isEditingOrder = false;
let currentOrderId = null;

/**
 * Открывает модальное окно для создания/редактирования заявки
 */
function openOrderModal(courseId = null, tutorId = null, orderId = null) {
    // Если передан orderId - режим редактирования
    if (orderId) {
        isEditingOrder = true;
        currentOrderId = orderId;
        // Здесь будет загрузка данных заявки из API
        loadOrderForEditing(orderId);
        return;
    }
    
    // Режим создания новой заявки
    isEditingOrder = false;
    currentOrderId = null;
    
    if (courseId) {
        currentCourseForOrder = window.courses_arr?.find(c => c.id === courseId);
        currentTutorForOrder = null;
    } else if (tutorId) {
        currentTutorForOrder = window.tutors_arr?.find(t => t.id === tutorId);
        currentCourseForOrder = null;
    }
    
    if (!currentCourseForOrder && !currentTutorForOrder) {
        if (typeof showError === 'function') {
            showError('Не удалось загрузить данные для заявки');
        }
        return;
    }
    
    // Заполняем и показываем модальное окно
    populateOrderModal();
    showOrderModal();
}

/**
 * Заполняет модальное окно данными
 */
function populateOrderModal() {
    const modal = document.getElementById('orderModal');
    if (!modal) {
        console.error('Модальное окно не найдено');
        return;
    }
    
    // Устанавливаем заголовок
    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) {
        modalTitle.textContent = isEditingOrder 
            ? 'Редактирование заявки'
            : (currentCourseForOrder 
                ? `Заявка на курс: ${currentCourseForOrder.name}`
                : `Запись к репетитору: ${currentTutorForOrder.name}`);
    }
    
    // Заполняем тело модального окна
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) {
        modalBody.innerHTML = generateOrderForm();
    }
    
    // Инициализируем форму
    initializeOrderForm();
    
    // Обновляем расчет стоимости
    calculateOrderPrice();
}

/**
 * Генерирует HTML формы заявки
 */
function generateOrderForm() {
    const course = currentCourseForOrder;
    const tutor = currentTutorForOrder;
    
    // Генерируем опции дат
    let dateOptions = '<option value="">Выберите дату</option>';
    if (course && course.start_dates && course.start_dates.length > 0) {
        course.start_dates.forEach((date, index) => {
            try {
                const dateObj = new Date(date);
                const dateStr = dateObj.toISOString().split('T')[0];
                const formattedDate = dateObj.toLocaleDateString('ru-RU', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'long'
                });
                dateOptions += `<option value="${dateStr}">${formattedDate}</option>`;
            } catch (e) {
                console.error('Ошибка форматирования даты:', date);
            }
        });
    } else if (tutor) {
        // Для репетитора - ближайшие даты на 2 недели вперед
        const today = new Date();
        for (let i = 1; i <= 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const formattedDate = date.toLocaleDateString('ru-RU', {
                weekday: 'short',
                day: 'numeric',
                month: 'long'
            });
            dateOptions += `<option value="${dateStr}">${formattedDate}</option>`;
        }
    }
    
    // Генерируем опции времени
    const timeOptions = [
        { value: '09:00', label: '09:00 - 10:30 (утро)' },
        { value: '11:00', label: '11:00 - 12:30' },
        { value: '14:00', label: '14:00 - 15:30' },
        { value: '16:00', label: '16:00 - 17:30' },
        { value: '18:00', label: '18:00 - 19:30 (вечер)' }
    ].map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
    
    // Рассчитываем продолжительность
    let durationInfo = '';
    let endDateInfo = '';
    if (course) {
        const totalHours = (course.total_length || 0) * (course.week_length || 0);
        const totalWeeks = course.total_length || 0;
        durationInfo = `${totalWeeks} недель (${totalHours} часов)`;
    } else if (tutor) {
        durationInfo = '1 занятие (2 часа)';
    }
    
    return `
    <form id="order-form" novalidate>
        <div class="row">
            <!-- Основная информация -->
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">${course ? 'Курс' : 'Репетитор'}</label>
                <input type="text" class="form-control" value="${course ? course.name : tutor.name}" readonly>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">${course ? 'Преподаватель' : 'Уровень'}</label>
                <input type="text" class="form-control" value="${course ? (course.teacher || 'Не указан') : (tutor.language_level || 'Не указан')}" readonly>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6 mb-3">
                <label for="order-date" class="form-label">Дата начала <span class="text-danger">*</span></label>
                <select class="form-select" id="order-date" required>
                    ${dateOptions}
                </select>
                <div class="invalid-feedback">Пожалуйста, выберите дату</div>
            </div>
            <div class="col-md-6 mb-3">
                <label for="order-time" class="form-label">Время занятия <span class="text-danger">*</span></label>
                <select class="form-select" id="order-time" required>
                    <option value="">Выберите время</option>
                    ${timeOptions}
                </select>
                <div class="invalid-feedback">Пожалуйста, выберите время</div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6 mb-3">
                <label for="order-students" class="form-label">Количество студентов <span class="text-danger">*</span></label>
                <input type="number" class="form-control" id="order-students" 
                       min="1" max="20" value="1" required>
                <div class="invalid-feedback">Введите количество от 1 до 20</div>
                <div class="form-text">От количества студентов зависит стоимость</div>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Продолжительность</label>
                <input type="text" class="form-control" value="${durationInfo}" readonly>
                <div id="end-date-info" class="form-text text-muted">${endDateInfo}</div>
            </div>
        </div>
        
        <!-- Дополнительные опции -->
        <div class="card mb-3">
            <div class="card-header">
                <h6 class="mb-0">Дополнительные опции</h6>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6 mb-2">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="option-early">
                            <label class="form-check-label" for="option-early">
                                <strong>Ранняя регистрация</strong>
                                <div class="form-text">Скидка 10% при регистрации за месяц</div>
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6 mb-2">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="option-intensive">
                            <label class="form-check-label" for="option-intensive">
                                <strong>Интенсивный курс</strong>
                                <div class="form-text">+20% к стоимости, 5+ часов в неделю</div>
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6 mb-2">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="option-supplementary">
                            <label class="form-check-label" for="option-supplementary">
                                <strong>Дополнительные материалы</strong>
                                <div class="form-text">+2000 ₽ за каждого студента</div>
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6 mb-2">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="option-personalized">
                            <label class="form-check-label" for="option-personalized">
                                <strong>Персонализированные занятия</strong>
                                <div class="form-text">Индивидуальный подход, +30%</div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Расчет стоимости -->
        <div class="card border-success">
            <div class="card-header bg-success text-white">
                <h6 class="mb-0">Расчет стоимости</h6>
            </div>
            <div class="card-body">
                <div class="row mb-2">
                    <div class="col-6">
                        <small>Базовая стоимость:</small>
                    </div>
                    <div class="col-6 text-end">
                        <small id="base-price">0 ₽</small>
                    </div>
                </div>
                <div class="row mb-2">
                    <div class="col-6">
                        <small>Дополнительные опции:</small>
                    </div>
                    <div class="col-6 text-end">
                        <small id="options-price">0 ₽</small>
                    </div>
                </div>
                <div class="row mb-2">
                    <div class="col-6">
                        <small>Количество студентов:</small>
                    </div>
                    <div class="col-6 text-end">
                        <small id="students-count">1 чел.</small>
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div class="col-6">
                        <h5 class="mb-0">Итого:</h5>
                    </div>
                    <div class="col-6 text-end">
                        <h3 class="text-success mb-0" id="total-price">0 ₽</h3>
                    </div>
                </div>
                <div class="mt-2 text-end">
                    <small class="text-muted" id="price-details">Детали расчета будут отображены здесь</small>
                </div>
            </div>
        </div>
        
        <!-- Кнопки -->
        <div class="mt-4 d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Отмена
            </button>
            <button type="submit" class="btn btn-success" id="submit-order-btn">
                ${isEditingOrder ? 'Сохранить изменения' : 'Отправить заявку'}
            </button>
        </div>
    </form>
    `;
}

/**
 * Инициализирует форму заявки
 */
function initializeOrderForm() {
    const form = document.getElementById('order-form');
    if (!form) return;
    
    // Добавляем обработчики изменений для пересчета цены
    const elementsToWatch = [
        'order-date', 'order-time', 'order-students',
        'option-early', 'option-intensive', 'option-supplementary', 'option-personalized'
    ];
    
    elementsToWatch.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', calculateOrderPrice);
            element.addEventListener('input', calculateOrderPrice);
        }
    });
    
    // Обработчик отправки формы
    form.addEventListener('submit', handleOrderSubmit);
    
    // Валидация формы
    form.addEventListener('input', function(e) {
        if (e.target.matches('input, select')) {
            validateField(e.target);
        }
    });
}

/**
 * Валидирует поле формы
 */
function validateField(field) {
    if (field.checkValidity()) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
    }
}

/**
 * Рассчитывает стоимость заявки
 */
function calculateOrderPrice() {
    const students = parseInt(document.getElementById('order-students')?.value) || 1;
    
    // Базовая стоимость
    let basePrice = 0;
    let details = [];
    
    if (currentCourseForOrder) {
        const hours = (currentCourseForOrder.total_length || 0) * (currentCourseForOrder.week_length || 0);
        const hourlyRate = currentCourseForOrder.course_fee_per_hour || 0;
        basePrice = hours * hourlyRate;
        details.push(`${hours} ч × ${hourlyRate} ₽/ч`);
    } else if (currentTutorForOrder) {
        // Для репетитора - 10 занятий по 2 часа
        const hourlyRate = currentTutorForOrder.price_per_hour || 0;
        basePrice = 10 * 2 * hourlyRate; // 10 занятий по 2 часа
        details.push(`10 занятий × 2 ч × ${hourlyRate} ₽/ч`);
    }
    
    // Применяем множители и дополнительные платежи
    let multiplier = 1;
    let additionalCost = 0;
    
    // Проверяем день недели (выходные дороже)
    const dateInput = document.getElementById('order-date');
    if (dateInput && dateInput.value) {
        const date = new Date(dateInput.value);
        const dayOfWeek = date.getDay(); // 0-воскресенье, 6-суббота
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            multiplier *= 1.5;
            details.push('×1.5 (выходной день)');
        }
    }
    
    // Проверяем время (утро/вечер дороже)
    const timeInput = document.getElementById('order-time');
    if (timeInput && timeInput.value) {
        const hour = parseInt(timeInput.value.split(':')[0]);
        if (hour >= 9 && hour < 12) {
            additionalCost += 400;
            details.push('+400 ₽ (утреннее время)');
        } else if (hour >= 18 && hour < 20) {
            additionalCost += 1000;
            details.push('+1000 ₽ (вечернее время)');
        }
    }
    
    // Дополнительные опции
    if (document.getElementById('option-early')?.checked) {
        multiplier *= 0.9;
        details.push('×0.9 (ранняя регистрация)');
    }
    
    if (document.getElementById('option-intensive')?.checked) {
        multiplier *= 1.2;
        details.push('×1.2 (интенсивный курс)');
    }
    
    if (document.getElementById('option-supplementary')?.checked) {
        additionalCost += 2000 * students;
        details.push(`+${2000 * students} ₽ (доп. материалы)`);
    }
    
    if (document.getElementById('option-personalized')?.checked) {
        multiplier *= 1.3;
        details.push('×1.3 (персонализированные занятия)');
    }
    
    // Групповая скидка
    if (students >= 5) {
        multiplier *= 0.85;
        details.push('×0.85 (групповая скидка от 5 чел.)');
    }
    
    // Итоговая стоимость
    const optionsPrice = (basePrice * (multiplier - 1)) + additionalCost;
    const totalPrice = Math.round((basePrice * multiplier) + additionalCost);
    
    // Обновляем отображение
    updatePriceDisplay(basePrice, optionsPrice, students, totalPrice, details);
    
    return totalPrice;
}

/**
 * Обновляет отображение расчета стоимости
 */
function updatePriceDisplay(basePrice, optionsPrice, students, totalPrice, details) {
    const basePriceElement = document.getElementById('base-price');
    const optionsPriceElement = document.getElementById('options-price');
    const studentsCountElement = document.getElementById('students-count');
    const totalPriceElement = document.getElementById('total-price');
    const priceDetailsElement = document.getElementById('price-details');
    
    if (basePriceElement) basePriceElement.textContent = `${basePrice} ₽`;
    if (optionsPriceElement) optionsPriceElement.textContent = `${optionsPrice > 0 ? '+' : ''}${optionsPrice} ₽`;
    if (studentsCountElement) studentsCountElement.textContent = `${students} чел.`;
    if (totalPriceElement) totalPriceElement.textContent = `${totalPrice} ₽`;
    if (priceDetailsElement) priceDetailsElement.textContent = details.join('; ');
}

/**
 * Обрабатывает отправку формы заявки
 */
async function handleOrderSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const form = document.getElementById('order-form');
    if (!form) return;
    
    // Проверяем валидность формы
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        if (typeof showError === 'function') {
            showError('Пожалуйста, заполните все обязательные поля');
        }
        return;
    }
    
    // Собираем данные для API
    const orderData = {
        // Обязательные поля
        date_start: document.getElementById('order-date').value,
        time_start: document.getElementById('order-time').value,
        persons: parseInt(document.getElementById('order-students').value),
        price: calculateOrderPrice(),
        
        // Курс ИЛИ репетитор
        course_id: 0,
        tutor_id: 0,
        
        // Опциональные поля
        duration: 2,
        early_registration: false,
        group_enrollment: false,
        intensive_course: false,
        supplementary: false,
        personalized: false,
        excursions: false,
        assessment: false,
        interactive: true
    };
    
    // Устанавливаем курс или репетитора
    if (currentCourseForOrder?.id) {
        orderData.course_id = currentCourseForOrder.id;
        orderData.duration = (currentCourseForOrder.total_length || 0) * (currentCourseForOrder.week_length || 0);
    } else if (currentTutorForOrder?.id) {
        orderData.tutor_id = currentTutorForOrder.id;
    }
    
    // Устанавливаем дополнительные опции
    orderData.early_registration = document.getElementById('option-early')?.checked || false;
    orderData.group_enrollment = (parseInt(document.getElementById('order-students').value) >= 5);
    orderData.intensive_course = document.getElementById('option-intensive')?.checked || false;
    orderData.supplementary = document.getElementById('option-supplementary')?.checked || false;
    orderData.personalized = document.getElementById('option-personalized')?.checked || false;
    
    // Гарантируем, что все булевы поля имеют значения
    ['early_registration', 'group_enrollment', 'intensive_course', 
     'supplementary', 'personalized', 'excursions', 'assessment', 'interactive'].forEach(field => {
        orderData[field] = Boolean(orderData[field]);
    });
    
    // Гарантируем, что duration >= 1
    if (orderData.duration < 1) {
        orderData.duration = 1;
    }
    
    // Показываем индикатор загрузки
    const submitBtn = document.getElementById('submit-order-btn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        ${isEditingOrder ? 'Сохранение...' : 'Отправка...'}
    `;
    submitBtn.disabled = true;
    
    try {
        let response;
        
        if (isEditingOrder && currentOrderId) {
            // Режим редактирования
            response = await updateOrder(currentOrderId, orderData);
            
            if (typeof showSuccess === 'function') {
                showSuccess('Заявка успешно обновлена!');
            }
            
        } else {
            // Режим создания новой заявки
            response = await createOrder(orderData);
            
            if (typeof showSuccess === 'function') {
                showSuccess('Заявка успешно создана!');
            }
        }
        
        console.log('Заявка сохранена:', response);
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
        if (modal) modal.hide();
        
        // Сбрасываем форму
        resetOrderForm();
        
        // Если мы в личном кабинете, обновляем список заявок
        if (window.location.pathname.includes('cabinet.html') && typeof loadOrders === 'function') {
            setTimeout(() => {
                loadOrders();
            }, 1000);
        }
        
    } catch (error) {
        console.error('Ошибка отправки заявки:', error);
        
        // Важно: НЕ используем общую функцию showError, которая может испортить курсы!
        // Используем только систему уведомлений
        if (typeof showNotification === 'function') {
            let errorMessage = 'Ошибка отправки заявки';
            
            if (error.message.includes('422')) {
                errorMessage = 'Ошибка данных. Проверьте заполнение формы.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Сервер не отвечает. Проверьте подключение.';
            }
            
            showNotification(errorMessage, 'danger');
        } else {
            // Fallback
            alert('Ошибка отправки заявки. Проверьте заполнение формы.');
        }
        
    } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}
/**
 * Симулирует запрос к API (временная функция)
 */
function simulateApiRequest(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 90% успешных запросов для демонстрации
            if (Math.random() > 0.1) {
                resolve({
                    success: true,
                    id: Math.floor(Math.random() * 1000) + 1,
                    ...data
                });
            } else {
                reject(new Error('Ошибка сервера при сохранении заявки'));
            }
        }, 1500);
    });
}

/**
 * Загружает заявку для редактирования
 */
function loadOrderForEditing(orderId) {
    // Временная заглушка - в следующем этапе будет загрузка из API
    console.log('Загрузка заявки для редактирования:', orderId);
    
    // Показываем уведомление
    if (typeof showInfo === 'function') {
        showInfo('Редактирование заявок будет реализовано в личном кабинете');
    }
    
    // Закрываем модальное окно если открыто
    const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
    if (modal) modal.hide();
}

/**
 * Сбрасывает форму заявки
 */
function resetOrderForm() {
    currentCourseForOrder = null;
    currentTutorForOrder = null;
    isEditingOrder = false;
    currentOrderId = null;
    
    const form = document.getElementById('order-form');
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
    }
}

/**
 * Показывает модальное окно
 */
function showOrderModal() {
    const modalElement = document.getElementById('orderModal');
    if (!modalElement) {
        console.error('Модальное окно не найдено');
        return;
    }
    
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Обработчик закрытия модального окна
    modalElement.addEventListener('hidden.bs.modal', function() {
        resetOrderForm();
    });
}

// Экспорт функций
window.openOrderModal = openOrderModal;
window.calculateOrderPrice = calculateOrderPrice;
window.resetOrderForm = resetOrderForm;
// ========== ФУНКЦИИ ОТОБРАЖЕНИЯ ==========

/**
 * Форматирование дат начала курсов
 */
function formatStartDates(datesArray) {
    if (!Array.isArray(datesArray) || datesArray.length === 0) {
        return 'Даты не указаны';
    }
    
    const formattedDates = datesArray.slice(0, 3).map(date => {
        try {
            const dateObj = new Date(date);
            return isNaN(dateObj.getTime()) ? date : dateObj.toLocaleDateString('ru-RU');
        } catch (error) {
            return date;
        }
    });
    
    let result = formattedDates.join(', ');
    if (datesArray.length > 3) {
        result += ` и еще ${datesArray.length - 3}`;
    }
    
    return result;
}

/**
 * Создание карточки курса
 */
function createCourseCard(course) {
    if (!course) return '';
    
    const { 
        id, 
        name, 
        description, 
        teacher, 
        level, 
        total_length, 
        week_length, 
        course_fee_per_hour = 0,
        start_dates = []
    } = course;
    
    // Уровень курса на русском
    const levelMap = {
        'Beginner': 'Начальный',
        'Intermediate': 'Средний',
        'Advanced': 'Продвинутый'
    };
    const levelText = levelMap[level] || level || 'Не указан';
    
    // Сокращаем описание если нужно
    const shortDescription = description && description.length > 120 
        ? description.substring(0, 120) + '...' 
        : description || 'Описание отсутствует';
    
    // Форматируем даты начала
    const formattedDates = formatStartDates(start_dates);
    
    // Рассчитываем общее количество часов и стоимость
    const totalHours = (total_length || 0) * (week_length || 0);
    const totalCost = totalHours * (course_fee_per_hour || 0);
    
    return `
    <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title mb-0 flex-grow-1">${name || 'Без названия'}</h5>
                    <span class="badge bg-primary ms-2">${levelText}</span>
                </div>
                
                <p class="card-text text-muted small mb-2">
                    <i class="bi bi-person me-1"></i>
                    ${teacher || 'Преподаватель не указан'}
                </p>
                
                <p class="card-text flex-grow-1 mb-3">${shortDescription}</p>
                
                <div class="mb-3">
                    <p class="card-text small text-muted mb-1">
                        <i class="bi bi-calendar-event me-1"></i>
                        <strong>Начало:</strong> ${formattedDates}
                    </p>
                    <p class="card-text small text-muted">
                        <i class="bi bi-clock-history me-1"></i>
                        <strong>Продолжительность:</strong> ${total_length || '?'} недель
                        (${totalHours} часов всего)
                    </p>
                </div>
                
                <div class="mt-auto">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="text-muted small">
                            <i class="bi bi-clock me-1"></i>
                            ${total_length || '?'} нед × ${week_length || '?'} ч/нед
                        </span>
                        <div class="text-end">
                            <div class="text-primary fw-bold">${course_fee_per_hour || '?'} ₽/час</div>
                            <div class="text-success small">${totalCost} ₽ всего</div>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary w-100" onclick="openOrderModal(${id})">
                        <i class="bi bi-pencil-square me-1"></i>
                        Подать заявку
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Создание карточки репетитора
 */
function createTutorCard(tutor) {
    if (!tutor) return '';
    
    const { 
        id, 
        name, 
        work_experience = 0, 
        languages_spoken = [],
        languages_offered = [], 
        language_level, 
        price_per_hour = 0
    } = tutor;
    
    // Уровень языка на русском
    const levelMap = {
        'Beginner': 'Начальный',
        'Intermediate': 'Средний',
        'Advanced': 'Продвинутый'
    };
    const levelText = levelMap[language_level] || language_level || 'Не указан';
    
    // Форматируем языки
    const languagesSpoken = Array.isArray(languages_spoken) && languages_spoken.length > 0
        ? languages_spoken.join(', ') 
        : 'Не указаны';
    
    const languagesOffered = Array.isArray(languages_offered) && languages_offered.length > 0
        ? languages_offered.join(', ') 
        : 'Не указаны';
    
    return `
    <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title mb-2">
                    <i class="bi bi-person-badge me-2"></i>
                    ${name || 'Имя не указано'}
                </h5>
                
                <div class="mb-3">
                    <span class="badge bg-info me-1 mb-1">${levelText}</span>
                    <span class="badge bg-secondary mb-1">Опыт: ${work_experience} лет</span>
                </div>
                
                <div class="mb-3">
                    <p class="card-text small mb-1">
                        <i class="bi bi-chat-dots me-1"></i>
                        <strong>Говорит на:</strong> ${languagesSpoken}
                    </p>
                    <p class="card-text small">
                        <i class="bi bi-book me-1"></i>
                        <strong>Обучает:</strong> ${languagesOffered}
                    </p>
                </div>
                
                <div class="mt-auto">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="text-muted small">
                            <i class="bi bi-currency-exchange me-1"></i>
                            Стоимость:
                        </span>
                        <span class="text-success fw-bold">${price_per_hour} ₽/час</span>
                    </div>
                    
                    <button class="btn btn-primary w-100" onclick="openOrderModal(null, ${id})">
                        <i class="bi bi-calendar-plus me-1"></i>
                        Записаться
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Отображение курсов
 */
function displayCourses() {
    const coursesList = document.getElementById('courses-list');
    if (!coursesList) {
        console.error('Элемент courses-list не найден');
        return;
    }
    
    if (!window.courses_arr || window.courses_arr.length === 0) {
        coursesList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    Курсы не найдены.
                </div>
            </div>
        `;
        return;
    }
    
    coursesList.innerHTML = window.courses_arr.map(course => createCourseCard(course)).join('');
    console.log('Курсы отображены:', window.courses_arr.length, 'шт.');
}

/**
 * Отображение репетиторов
 */
function displayTutors() {
    const tutorsList = document.getElementById('tutors-list');
    if (!tutorsList) {
        console.error('Элемент tutors-list не найден');
        return;
    }
    
    if (!window.tutors_arr || window.tutors_arr.length === 0) {
        tutorsList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    Репетиторы не найдены.
                </div>
            </div>
        `;
        return;
    }
    
    tutorsList.innerHTML = window.tutors_arr.map(tutor => createTutorCard(tutor)).join('');
    console.log('Репетиторы отображены:', window.tutors_arr.length, 'шт.');
}

/**
 * Открытие модального окна курса
 */
function openCourseModal(courseId) {
    const course = window.courses_arr.find(c => c.id === courseId);
    if (!course) {
        console.error('Курс не найден');
        return;
    }
    
    alert(`Заявка на курс: ${course.name || 'Без названия'}\nID: ${courseId}\n\nФункционал модального окна будет реализован позже.`);
}

/**
 * Открытие модального окна репетитора
 */
function openTutorModal(tutorId) {
    const tutor = window.tutors_arr.find(t => t.id === tutorId);
    if (!tutor) {
        console.error('Репетитор не найден');
        return;
    }
    
    alert(`Запись к репетитору: ${tutor.name || 'Имя не указано'}\nID: ${tutorId}\n\nФункционал модального окна будет реализован позже.`);
}

// ========== ПОИСК И ФИЛЬТРАЦИЯ РЕПЕТИТОРОВ ==========

/**
 * Поиск и фильтрация репетиторов
 */
function searchTutors() {
    const levelSelect = document.getElementById('tutor-qualification');
    const experienceInput = document.getElementById('tutor-experience');
    
    if (!levelSelect || !experienceInput) {
        console.error('Элементы поиска репетиторов не найдены');
        if (typeof showError === 'function') {
            showError('Ошибка поиска: элементы формы не найдены');
        }
        return;
    }
    
    const levelValue = levelSelect.value;
    const experienceValue = parseInt(experienceInput.value) || 0;
    
    let filteredTutors = window.tutors_arr || [];
    
    // Фильтрация по уровню квалификации
    if (levelValue && levelValue !== '') {
        filteredTutors = filteredTutors.filter(tutor => {
            const tutorLevel = tutor.language_level ? tutor.language_level.toLowerCase() : '';
            const searchLevel = levelValue.toLowerCase();
            return tutorLevel === searchLevel;
        });
    }
    
    // Фильтрация по минимальному опыту
    if (experienceValue > 0) {
        filteredTutors = filteredTutors.filter(tutor => {
            const tutorExperience = tutor.work_experience || 0;
            return tutorExperience >= experienceValue;
        });
    }
    
    // Отображаем результаты
    displayFilteredTutors(filteredTutors);
    
    // Показываем информацию о количестве найденных репетиторов
    showTutorsSearchInfo(filteredTutors.length, experienceValue, levelValue);
    
    // Показываем уведомление о результате поиска
    if (typeof showInfo === 'function') {
        const filters = [];
        if (levelValue) {
            const levelMap = {
                'Beginner': 'Начальный',
                'Intermediate': 'Средний',
                'Advanced': 'Продвинутый'
            };
            filters.push(`уровень: ${levelMap[levelValue] || levelValue}`);
        }
        if (experienceValue > 0) filters.push(`опыт от ${experienceValue} лет`);
        
        const message = filters.length > 0 
            ? `Найдено ${filteredTutors.length} репетиторов (${filters.join(', ')})`
            : `Найдено ${filteredTutors.length} репетиторов`;
        
        if (filteredTutors.length === 0) {
            showWarning('Репетиторы по вашему запросу не найдены', 3000);
        } else {
            showInfo(message, 3000);
        }
    }
}

/**
 * Сброс фильтров поиска репетиторов
 */
function resetTutorsSearch() {
    const levelSelect = document.getElementById('tutor-qualification');
    const experienceInput = document.getElementById('tutor-experience');
    
    if (levelSelect) levelSelect.value = '';
    if (experienceInput) experienceInput.value = '';
    
    // Скрываем информационное сообщение
    const infoElement = document.getElementById('tutors-search-info');
    if (infoElement) {
        infoElement.remove();
    }
    
    // Отображаем всех репетиторов
    displayTutors();
    
    // Показываем уведомление о сбросе
    if (typeof showInfo === 'function') {
        showInfo('Фильтры поиска репетиторов сброшены', 2000);
    }
    
    console.log('Фильтры поиска репетиторов сброшены');
}

/**
 * Отображение отфильтрованных репетиторов
 */
function displayFilteredTutors(filteredTutors) {
    const tutorsList = document.getElementById('tutors-list');
    if (!tutorsList) {
        console.error('Элемент tutors-list не найден');
        return;
    }
    
    if (!filteredTutors || filteredTutors.length === 0) {
        tutorsList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    По вашему запросу репетиторы не найдены. 
                    Попробуйте изменить критерии поиска.
                </div>
            </div>
        `;
        return;
    }
    
    tutorsList.innerHTML = filteredTutors.map(tutor => createTutorCard(tutor)).join('');
    console.log('Отфильтрованные репетиторы отображены:', filteredTutors.length, 'шт.');
}

/**
 * Показывает информацию о поиске
 */
function showTutorsSearchInfo(foundCount, experienceValue, levelValue) {
    let infoMessage = '';
    
    if (foundCount === 0) {
        infoMessage = 'Ничего не найдено';
    } else {
        infoMessage = `Найдено репетиторов: ${foundCount}`;
        
        const filters = [];
        if (levelValue) {
            const levelMap = {
                'Beginner': 'Начальный',
                'Intermediate': 'Средний',
                'Advanced': 'Продвинутый'
            };
            filters.push(`уровень: ${levelMap[levelValue] || levelValue}`);
        }
        
        if (experienceValue > 0) {
            filters.push(`опыт от ${experienceValue} лет`);
        }
        
        if (filters.length > 0) {
            infoMessage += ` (фильтры: ${filters.join(', ')})`;
        }
    }
    
    // Обновляем или создаем элемент для информации
    let infoElement = document.getElementById('tutors-search-info');
    if (!infoElement) {
        const tutorsNote = document.getElementById('tutors-note');
        if (tutorsNote) {
            infoElement = document.createElement('div');
            infoElement.id = 'tutors-search-info';
            infoElement.className = 'mt-2 small';
            tutorsNote.parentNode.insertBefore(infoElement, tutorsNote.nextSibling);
        }
    }
    
    if (infoElement) {
        infoElement.innerHTML = `
            <div class="alert alert-light border p-2 mb-0">
                <i class="bi bi-info-circle me-1"></i>
                ${infoMessage}
                ${foundCount > 0 ? '<button class="btn btn-sm btn-outline-secondary ms-2" onclick="resetTutorsSearch()">Сбросить фильтры</button>' : ''}
            </div>
        `;
    }
}

/**
 * Сброс фильтров поиска репетиторов
 */
function resetTutorsSearch() {
    const levelSelect = document.getElementById('tutor-qualification');
    const experienceInput = document.getElementById('tutor-experience');
    
    if (levelSelect) levelSelect.value = '';
    if (experienceInput) experienceInput.value = '';
    
    // Скрываем информационное сообщение
    const infoElement = document.getElementById('tutors-search-info');
    if (infoElement) {
        infoElement.remove();
    }
    
    // Отображаем всех репетиторов
    displayTutors();
    
    console.log('Фильтры поиска репетиторов сброшены');
}

/**
 * Инициализация интерактивного поиска репетиторов
 */
function initTutorsSearch() {
    const levelSelect = document.getElementById('tutor-qualification');
    const experienceInput = document.getElementById('tutor-experience');
    
    if (levelSelect) {
        levelSelect.addEventListener('change', function() {
            // Добавляем небольшую задержку для лучшего UX
            clearTimeout(window.tutorsSearchTimeout);
            window.tutorsSearchTimeout = setTimeout(searchTutors, 300);
        });
    }
    
    if (experienceInput) {
        experienceInput.addEventListener('input', function() {
            // Проверяем, что введено число
            if (this.value && !/^\d+$/.test(this.value)) {
                this.value = this.value.replace(/\D/g, '');
            }
            
            // Ограничиваем максимальное значение
            if (parseInt(this.value) > 50) {
                this.value = '50';
            }
            
            clearTimeout(window.tutorsSearchTimeout);
            window.tutorsSearchTimeout = setTimeout(searchTutors, 500);
        });
        
        // Предотвращаем ввод нечисловых значений
        experienceInput.addEventListener('keypress', function(e) {
            const charCode = e.which ? e.which : e.keyCode;
            if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                e.preventDefault();
            }
        });
    }
}

// Экспорт функций
window.searchTutors = searchTutors;
window.resetTutorsSearch = resetTutorsSearch;
window.initTutorsSearch = initTutorsSearch;
window.formatStartDates = formatStartDates;
window.createCourseCard = createCourseCard;
window.createTutorCard = createTutorCard;
window.displayCourses = displayCourses;
window.displayTutors = displayTutors;
window.openCourseModal = openCourseModal;
window.openTutorModal = openTutorModal;
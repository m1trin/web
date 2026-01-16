// ========== ПАГИНАЦИЯ ==========

const ITEMS_PER_PAGE = 5;
let currentCoursesPage = 1;

// ========== ПОИСК КУРСОВ С ПАГИНАЦИЕЙ ==========

let filteredCourses = null;
let isSearchActive = false;

/**
 * Пагинация курсов
 */
function paginateCoursesList() {
    const courses = getCoursesForDisplay();
    
    if (!courses || courses.length === 0) {
        return [];
    }
    
    const startIndex = (currentCoursesPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return courses.slice(startIndex, endIndex);
}

/**
 * Получает курсы для отображения (оригинальные или отфильтрованные)
 */
function getCoursesForDisplay() {
    if (isSearchActive && filteredCourses) {
        return filteredCourses;
    }
    return window.courses_arr || [];
}

/**
 * Поиск курсов с поддержкой пагинации
 */
function searchCourses() {
    const nameInput = document.getElementById('course-name');
    const levelSelect = document.getElementById('course-level');
    
    if (!nameInput || !levelSelect) {
        console.error('Элементы поиска не найдены');
        if (typeof showError === 'function') {
            showError('Ошибка поиска: элементы формы не найдены');
        }
        return;
    }
    
    const nameValue = nameInput.value.toLowerCase().trim();
    const levelValue = levelSelect.value;
    
    // Фильтруем курсы
    let result = window.courses_arr;
    
    if (nameValue) {
        result = result.filter(course => 
            (course.name && course.name.toLowerCase().includes(nameValue)) ||
            (course.description && course.description.toLowerCase().includes(nameValue))
        );
    }
    
    if (levelValue && levelValue !== 'all') {
        result = result.filter(course => course.level === levelValue);
    }
    
    // Сохраняем отфильтрованные курсы
    filteredCourses = result;
    isSearchActive = nameValue || (levelValue && levelValue !== 'all');
    
    // Сбрасываем на первую страницу
    currentCoursesPage = 1;
    
    // Обновляем отображение
    updateCoursesDisplay();
    
    // Показываем информацию о поиске
    showCoursesSearchInfo(result.length, nameValue, levelValue);
    
    // Показываем уведомление о результате поиска
    if (typeof showInfo === 'function') {
        const filters = [];
        if (nameValue) filters.push(`"${nameValue}"`);
        if (levelValue && levelValue !== 'all') {
            const levelMap = {
                'Beginner': 'Начальный',
                'Intermediate': 'Средний',
                'Advanced': 'Продвинутый'
            };
            filters.push(`${levelMap[levelValue] || levelValue}`);
        }
        
        const message = filters.length > 0 
            ? `Найдено ${result.length} курсов (${filters.join(', ')})`
            : `Найдено ${result.length} курсов`;
        
        if (result.length === 0) {
            showWarning('Курсы по вашему запросу не найдены', 3000);
        } else {
            showInfo(message, 3000);
        }
    }
}

/**
 * Показывает информацию о поиске курсов
 */
function showCoursesSearchInfo(foundCount, nameValue, levelValue) {
    const searchSection = document.getElementById('search');
    if (!searchSection) return;
    
    let infoElement = document.getElementById('courses-search-info');
    
    // Создаем элемент если его нет
    if (!infoElement) {
        infoElement = document.createElement('div');
        infoElement.id = 'courses-search-info';
        infoElement.className = 'mt-3';
        searchSection.appendChild(infoElement);
    }
    
    if (foundCount === 0) {
        infoElement.innerHTML = `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                По вашему запросу ничего не найдено.
                <button class="btn btn-sm btn-outline-warning ms-2" onclick="resetCoursesSearch()">
                    Показать все курсы
                </button>
            </div>
        `;
    } else {
        let filters = [];
        if (nameValue) filters.push(`по названию: "${nameValue}"`);
        if (levelValue && levelValue !== 'all') {
            const levelMap = {
                'Beginner': 'Начальный',
                'Intermediate': 'Средний',
                'Advanced': 'Продвинутый'
            };
            filters.push(`уровень: ${levelMap[levelValue] || levelValue}`);
        }
        
        infoElement.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-search me-2"></i>
                Найдено курсов: <strong>${foundCount}</strong>
                ${filters.length > 0 ? ` (${filters.join(', ')})` : ''}
                ${isSearchActive ? `
                    <button class="btn btn-sm btn-outline-info ms-2" onclick="resetCoursesSearch()">
                        Сбросить фильтры
                    </button>
                ` : ''}
            </div>
        `;
    }
}

/**
 * Сброс поиска курсов
 */
function resetCoursesSearch() {
    const nameInput = document.getElementById('course-name');
    const levelSelect = document.getElementById('course-level');
    
    if (nameInput) nameInput.value = '';
    if (levelSelect) levelSelect.value = '';
    
    filteredCourses = null;
    isSearchActive = false;
    currentCoursesPage = 1;
    
    // Удаляем информационное сообщение
    const infoElement = document.getElementById('courses-search-info');
    if (infoElement) {
        infoElement.remove();
    }
    
    // Обновляем отображение
    updateCoursesDisplay();
    
    // Показываем уведомление о сбросе
    if (typeof showInfo === 'function') {
        showInfo('Фильтры поиска курсов сброшены', 2000);
    }
    
    console.log('Поиск курсов сброшен');
}

/**
 * Обновляет информационный блок
 */
function updateCoursesInfo() {
    const infoElement = document.getElementById('courses-info');
    if (!infoElement || !window.courses_arr) return;
    
    const courses = getCoursesForDisplay();
    const totalCourses = courses.length;
    
    if (totalCourses === 0) {
        infoElement.textContent = 'Курсы не найдены';
        return;
    }
    
    const startCourse = (currentCoursesPage - 1) * ITEMS_PER_PAGE + 1;
    const endCourse = Math.min(currentCoursesPage * ITEMS_PER_PAGE, totalCourses);
    
    infoElement.textContent = `Показаны курсы ${startCourse}-${endCourse} из ${totalCourses}`;
}

/**
 * Обновляет отображение курсов с учетом пагинации
 */
function updateCoursesDisplay() {
    const coursesList = document.getElementById('courses-list');
    if (!coursesList) {
        console.error('Элемент courses-list не найден');
        return;
    }
    
    const courses = getCoursesForDisplay();
    
    if (!courses || courses.length === 0) {
        coursesList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    ${isSearchActive ? 'По вашему запросу курсы не найдены.' : 'Курсы не найдены.'}
                </div>
            </div>
        `;
        
        // Скрываем пагинацию
        const pagination = document.getElementById('courses-pagination');
        if (pagination) {
            pagination.style.display = 'none';
        }
        return;
    }
    
    const paginatedCourses = paginateCoursesList();
    
    if (paginatedCourses.length === 0) {
        coursesList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    На этой странице нет курсов.
                </div>
            </div>
        `;
        return;
    }
    
    coursesList.innerHTML = paginatedCourses.map(course => createCourseCard(course)).join('');
    
    // Обновляем пагинацию
    renderCoursesPagination(courses.length);
    
    // Обновляем информационный блок
    updateCoursesInfo();
}

/**
 * Обновляет рендеринг пагинации с учетом общего количества курсов
 */
function renderCoursesPagination(totalItems) {
    const paginationContainer = document.getElementById('courses-pagination');
    if (!paginationContainer || !totalItems) {
        return;
    }
    
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'block';
    
    let html = '';
    
    // Кнопка "Назад"
    if (currentCoursesPage > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changeCoursesPage(${currentCoursesPage - 1})" aria-label="Назад">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;
    }
    
    // Номера страниц
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${i === currentCoursesPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changeCoursesPage(${i})">${i}</a>
            </li>
        `;
    }
    
    // Кнопка "Вперед"
    if (currentCoursesPage < totalPages) {
        html += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changeCoursesPage(${currentCoursesPage + 1})" aria-label="Вперед">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;
    }
    
    paginationContainer.querySelector('ul').innerHTML = html;
}

/**
 * Меняет текущую страницу курсов
 */
function changeCoursesPage(page) {
    if (page < 1 || page > Math.ceil(window.courses_arr.length / ITEMS_PER_PAGE)) {
        return;
    }
    
    currentCoursesPage = page;
    updateCoursesDisplay();
    
    // Прокрутка к началу списка курсов
    const coursesSection = document.getElementById('courses');
    if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Сбрасывает пагинацию при поиске
 */
function resetCoursesPagination() {
    currentCoursesPage = 1;
}

// Экспорт функций
window.searchCourses = searchCourses;
window.resetCoursesSearch = resetCoursesSearch;
window.changeCoursesPage = changeCoursesPage;
window.updateCoursesDisplay = updateCoursesDisplay;
window.resetCoursesPagination = resetCoursesPagination;
window.renderCoursesPagination = renderCoursesPagination;
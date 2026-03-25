const app = {
    currentModule: null,
    progress: JSON.parse(localStorage.getItem('d_edu_progress')) || {},
    activeCourses: JSON.parse(localStorage.getItem('d_edu_active')) || [],

    init() {
        this.renderDashboard();
        this.updateOverallProgress();
    },

    openModule(moduleId) {
        this.currentModule = moduleId;
        const moduleData = modulesData[moduleId];
        if (!moduleData) return;

        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('module-view').style.display = 'block';
        
        this.renderModule(moduleId);
        window.scrollTo(0, 0);
    },

    showDashboard() {
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('module-view').style.display = 'none';
        document.getElementById('profile-view').style.display = 'none';
        this.updateNav('dashboard');
        this.renderDashboard();
        this.updateOverallProgress();
    },

    showProfile() {
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('module-view').style.display = 'none';
        document.getElementById('profile-view').style.display = 'block';
        this.updateNav('profile');
        this.renderProfile();
    },

    updateNav(view) {
        const dashboardLink = document.querySelector('#main-nav a:nth-child(1)');
        const profileLink = document.querySelector('#main-nav a:nth-child(2)');
        if (view === 'dashboard') {
            dashboardLink.style.color = 'var(--text-primary)';
            profileLink.style.color = 'var(--text-secondary)';
        } else {
            dashboardLink.style.color = 'var(--text-secondary)';
            profileLink.style.color = 'var(--text-primary)';
        }
    },

    renderProfile() {
        this.renderWeeklySchedule();
        this.renderActiveCoursesList();
    },

    renderWeeklySchedule() {
        const schedule = document.getElementById('weekly-schedule');
        const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
        schedule.innerHTML = '';

        days.forEach((day, index) => {
            const dayCard = document.createElement('div');
            dayCard.style.padding = '1rem';
            dayCard.style.background = 'rgba(255,255,255,0.02)';
            dayCard.style.borderRadius = '12px';
            dayCard.style.border = '1px solid var(--glass-border)';
            
            // Assign courses to days if they are active
            let taskHtml = '<div style="font-size: 0.8rem; color: var(--text-secondary);">Свободный день</div>';
            if (this.activeCourses.length > 0) {
                const courseId = this.activeCourses[index % this.activeCourses.length];
                const course = modulesData[courseId];
                taskHtml = `<div style="font-size: 0.9rem; color: var(--accent-secondary); font-weight: 700;">${course.title}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary);">Урок ${Math.floor(Math.random() * 5) + 1}</div>`;
            }

            dayCard.innerHTML = `
                <div style="font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary); opacity: 0.6;">${day}</div>
                ${taskHtml}
            `;
            schedule.appendChild(dayCard);
        });
    },

    renderActiveCoursesList() {
        const list = document.getElementById('active-courses-list');
        list.innerHTML = '';
        if (this.activeCourses.length === 0) {
            list.innerHTML = '<li style="color: var(--text-secondary); font-size: 0.9rem;">Нет активных курсов</li>';
            return;
        }

        this.activeCourses.forEach(id => {
            const course = modulesData[id];
            const li = document.createElement('li');
            li.style.marginBottom = '1rem';
            li.style.padding = '1rem';
            li.style.background = 'rgba(255,255,255,0.02)';
            li.style.borderRadius = '12px';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.innerHTML = `
                <div>
                    <div style="font-weight: 700; font-size: 0.9rem;">${course.title}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Прогресс: 15%</div>
                </div>
                <button class="btn-action" style="padding: 0.25rem 0.5rem; font-size: 0.7rem;" onclick="app.openModule('${id}')">Продолжить</button>
            `;
            list.appendChild(li);
        });
    },

    toggleCourse(moduleId) {
        const index = this.activeCourses.indexOf(moduleId);
        if (index > -1) {
            this.activeCourses.splice(index, 1);
        } else {
            if (this.activeCourses.length >= 3) {
                alert("Оптимально изучать не более 3 курсов одновременно для лучшего усвоения.");
            }
            this.activeCourses.push(moduleId);
        }
        localStorage.setItem('d_edu_active', JSON.stringify(this.activeCourses));
        this.renderDashboard();
    },

    renderDashboard() {
        const grid = document.getElementById('module-grid');
        grid.innerHTML = '';
        
        // Show Active Courses first
        const sortedKeys = Object.keys(modulesData).sort((a,b) => {
            const aActive = this.activeCourses.includes(a);
            const bActive = this.activeCourses.includes(b);
            return bActive - aActive;
        });

        sortedKeys.forEach(key => {
            const data = modulesData[key];
            const isActive = this.activeCourses.includes(key);
            const card = document.createElement('div');
            card.className = `card ${isActive ? 'active-status' : ''}`;
            card.innerHTML = `
                ${isActive ? '<div class="badge">ACTIVE</div>' : ''}
                <div class="card-header ${this.getBgClass(key)}">${this.getEmoji(key)}</div>
                <h3>${data.title}</h3>
                <p>${data.description}</p>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn-action" onclick="event.stopPropagation(); app.openModule('${key}')">Открыть</button>
                    <button class="btn-secondary" onclick="event.stopPropagation(); app.toggleCourse('${key}')">
                        ${isActive ? 'Убрать из активных' : 'В активные'}
                    </button>
                </div>
            `;
            card.onclick = () => this.openModule(key);
            grid.appendChild(card);
        });
    },

    getBgClass(key) {
        const mapping = {
            'ai-literacy': 'ai-bg', 'eq': 'eq-bg', 'finance': 'fin-bg', 'critical': 'crit-bg',
            'marketing': 'ai-bg', 'habits': 'eq-bg', 'self-dev': 'crit-bg', 'organization': 'fin-bg'
        };
        return mapping[key] || 'ai-bg';
    },

    getEmoji(key) {
        const mapping = {
            'ai-literacy': '🧠', 'eq': '❤️', 'finance': '💰', 'critical': '⚡',
            'marketing': '📈', 'habits': '🔄', 'self-dev': '🌱', 'organization': '⏱️'
        };
        return mapping[key] || '📚';
    },

    renderModule(moduleId) {
        this.currentModule = moduleId;
        const data = modulesData[moduleId];
        const content = document.getElementById('module-content');
        
        // Header
        let html = `
            <button class="btn-back" onclick="app.showDashboard()">← К панеле</button>
            <div class="module-header">
                <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">${data.title}</h1>
                <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 2rem;">${data.description}</p>
            </div>
        `;

        // Check for 3-level hierarchy (Blocks -> Topics -> Lessons)
        if (data.blocks) {
            html += `<div class="blocks-container">`;
            data.blocks.forEach((block, bIdx) => {
                html += `
                    <div class="block-card">
                        <h2 style="margin-bottom: 1.5rem; color: var(--accent-primary); border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">${block.title}</h2>
                        <div class="topics-container">
                            ${block.topics.map((topic, tIdx) => `
                                <div class="topic-accordion">
                                    <div class="topic-header" onclick="app.toggleAccordion(this)">
                                        <h3>${topic.title}</h3>
                                        <span>▼</span>
                                    </div>
                                    <div class="lessons-list" style="display: none;">
                                        ${topic.lessons.map((lesson, lIdx) => `
                                            <div class="lesson-link" onclick="app.openLesson('${moduleId}', ${bIdx}, ${tIdx}, ${lIdx})">
                                                <span>${lesson.title}</span>
                                                <span class="day-num">День ${lIdx + 1}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        } else {
            // Fallback for simple courses
            html += `
                <section class="course-curriculum">
                    <h2 style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">Курс Обучения</h2>
                    <div class="curriculum-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                        ${data.curriculum.map(item => `
                            <div class="card" style="cursor: default;">
                                <h4>${item.topic}</h4>
                                <p style="font-size: 0.85rem;">${item.details}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        }
        content.innerHTML = html;
        window.scrollTo(0,0);
    },

    toggleAccordion(el) {
        const list = el.nextElementSibling;
        const arrow = el.querySelector('span');
        if (list.style.display === 'none') {
            list.style.display = 'flex';
            arrow.innerText = '▲';
            el.parentElement.style.borderColor = 'var(--accent-primary)';
        } else {
            list.style.display = 'none';
            arrow.innerText = '▼';
            el.parentElement.style.borderColor = 'var(--glass-border)';
        }
    },

    openLesson(moduleId, bIdx, tIdx, lIdx) {
        const lesson = modulesData[moduleId].blocks[bIdx].topics[tIdx].lessons[lIdx];
        const content = document.getElementById('module-content');
        
        let html = `
            <button class="btn-back" onclick="app.renderModule('${moduleId}')">← К списку тем</button>
            <div class="reading-container animate">
                <h1 style="font-size: 3rem; margin-bottom: 2rem; line-height: 1.1;">${lesson.title}</h1>
                <div class="reading-content">
                    ${lesson.content}
                </div>
                
                <div class="lesson-meta-grid">
                    <div class="meta-box">
                        <h4 style="color: var(--accent-secondary);">📚 Материалы</h4>
                        <ul class="books-list">
                            ${(lesson.books || []).map(b => `<li>${b}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="meta-box">
                        <h4 style="color: var(--success);">💡 Советы</h4>
                        <p class="tip-text">${lesson.tips || 'Нет советов для этого урока.'}</p>
                    </div>
                    <div class="meta-box">
                        <h4 style="color: var(--error);">🎯 Задание</h4>
                        <p class="task-text">${lesson.task || 'Задание скоро появится.'}</p>
                    </div>
                </div>
                
                <div style="margin-top: 4rem; display: flex; justify-content: center;">
                    <button class="btn-action" style="padding: 1rem 3rem; font-size: 1.2rem;" onclick="app.completeLesson('${moduleId}', '${lesson.title}')">Я изучил материал</button>
                </div>
            </div>
        `;
        content.innerHTML = html;
        window.scrollTo(0,0);
    },

    completeLesson(moduleId, lessonTitle) {
        this.progress[lessonTitle] = true;
        localStorage.setItem('d_edu_progress', JSON.stringify(this.progress));
        alert("Урок завершен! Твой прогресс обновлен.");
        this.renderModule(moduleId);
    },

    updateOverallProgress() {
        // Simple logic for demonstration
        const total = 4;
        const completed = Object.keys(this.progress).length;
        const percent = Math.round((completed / total) * 100);
        document.getElementById('total-progress').innerText = `${percent}%`;
    }
};

window.onload = () => app.init();

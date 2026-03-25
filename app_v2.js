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
        
        this.renderModule(moduleData);
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

    renderModule(data) {
        const content = document.getElementById('module-content');
        let html = `
            <div class="module-header">
                <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">${data.title}</h1>
                <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 2rem;">${data.description}</p>
            </div>
        `;

        if (data.blocks) {
            html += `<div class="blocks-container" style="display: flex; flex-direction: column; gap: 2rem;">`;
            data.blocks.forEach((block, bIdx) => {
                html += `
                    <div class="block-card" style="background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem;">
                        <h2 style="margin-bottom: 1.5rem; color: var(--accent-primary);">${block.title}</h2>
                        <div class="lessons-grid" style="display: grid; gap: 1rem;">
                            ${block.lessons.map((lesson, lIdx) => `
                                <div class="lesson-item" style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1rem; border: 1px solid transparent; transition: border-color 0.3s;">
                                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                        <span style="opacity: 0.5;">${bIdx + 1}.${lIdx + 1}</span> ${lesson.title}
                                    </h3>
                                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">${lesson.content}</p>
                                    
                                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--glass-border);">
                                        ${lesson.books ? `<div><strong style="font-size: 0.8rem; color: var(--accent-secondary);">📚 Литература:</strong><ul style="font-size: 0.75rem; color: var(--text-secondary); padding-left: 1.2rem; margin-top: 0.3rem;">${lesson.books.map(b => `<li>${b}</li>`).join('')}</ul></div>` : ''}
                                        ${lesson.tips ? `<div><strong style="font-size: 0.8rem; color: var(--success);">💡 Совет:</strong><p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.3rem;">${lesson.tips}</p></div>` : ''}
                                        ${lesson.task ? `<div><strong style="font-size: 0.8rem; color: var(--error);">🎯 Задание:</strong><p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.3rem;">${lesson.task}</p></div>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        } else {
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

                <section class="daily-program" style="margin-top: 4rem;">
                    <h2 style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">Программа по Дням</h2>
                    <div class="program-list">
                        ${data.dailyProgram.map(day => `
                            <div class="program-day">
                                <h3>День ${day.day}: ${day.focus}</h3>
                                <p>${day.activity}</p>
                                <div class="retrieval-box"><strong>Recall:</strong> ${day.retrieval}</div>
                                <div class="error-correction-box"><strong>Errors:</strong> ${day.errorWork}</div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        }
        content.innerHTML = html;
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

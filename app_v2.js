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
        this.renderDashboard();
        this.updateOverallProgress();
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
            
            <section class="course-curriculum">
                <h2 style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">Курс Обучения</h2>
                <div class="curriculum-grid" style="display: grid; gap: 1.5rem;">
                    ${data.curriculum.map(item => `
                        <div class="card" style="cursor: default;">
                            <h4>${item.topic}</h4>
                            <p style="font-size: 0.85rem;">${item.details}</p>
                        </div>
                    `).join('')}
                </div>
            </section>

            <section class="daily-program" style="margin-top: 4rem;">
                <h2 style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">Программа по Дням (Оптимум Усвоения)</h2>
                <div class="program-list">
                    ${data.dailyProgram.map(day => `
                        <div class="program-day">
                            <h3>День ${day.day}: ${day.focus}</h3>
                            <p>${day.activity}</p>
                            
                            <div class="retrieval-box">
                                <strong>Активное Вспоминание:</strong> ${day.retrieval}
                            </div>
                            
                            <div class="error-correction-box">
                                <strong>Работа над ошибками:</strong> ${day.errorWork}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
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

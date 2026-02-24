// ==================== DADOS PADRÃO ====================
const defaultSchedule = {
    monday: [
        { id: 'mon-anki', time: '08:20-08:40', activity: 'Anki', type: 'anki', duration: 20, defaultPoints: 5 },
        { id: 'mon-interview', time: '08:40-09:00', activity: 'Interview Practice', type: 'structured', duration: 20, defaultPoints: 10 },
        { id: 'mon-class', time: '18:00-19:00', activity: 'English Class', type: 'speaking', duration: 60, defaultPoints: 15 }
    ],
    tuesday: [
        { id: 'tue-anki', time: '08:20-08:40', activity: 'Anki', type: 'anki', duration: 20, defaultPoints: 5 },
        { id: 'tue-grammar', time: '08:40-09:30', activity: 'Grammar', type: 'grammar', duration: 50, defaultPoints: 5 },
        { id: 'tue-listening', time: '18:40-19:10', activity: 'Listening + Summary', type: 'listening', duration: 30, defaultPoints: 10 }
    ],
    wednesday: [
        { id: 'wed-speaking', time: '08:20-08:50', activity: 'Speaking Practice', type: 'speaking', duration: 30, defaultPoints: 15 }
    ],
    thursday: [
        { id: 'thu-anki', time: '08:20-08:40', activity: 'Anki', type: 'anki', duration: 20, defaultPoints: 5 },
        { id: 'thu-tech', time: '08:40-09:30', activity: 'Technical Question', type: 'speaking', duration: 50, defaultPoints: 15 }
    ],
    friday: [
        { id: 'fri-review', time: '08:20-08:40', activity: 'Review', type: 'review', duration: 20, defaultPoints: 0 },
        { id: 'fri-improve', time: '08:40-09:30', activity: 'Improve 1 Answer', type: 'structured', duration: 50, defaultPoints: 10 },
        { id: 'fri-listening', time: '18:30-18:50', activity: 'Listening', type: 'listening', duration: 20, defaultPoints: 10 }
    ],
    saturday: [
        { id: 'sat-mock', time: '10:00-11:00', activity: 'Mock Interview', type: 'mock', duration: 60, defaultPoints: 25 }
    ],
    sunday: [
        { id: 'sun-rest', time: 'Rest Day', activity: 'Rest', type: 'rest', duration: 0, defaultPoints: 0 }
    ]
};

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

// Tipos padrão (serão carregados e podem ser editados)
const defaultActivityTypes = [
    { value: 'anki', label: 'Anki', defaultPoints: 5 },
    { value: 'listening', label: 'Listening', defaultPoints: 10 },
    { value: 'grammar', label: 'Grammar', defaultPoints: 5 },
    { value: 'speaking', label: 'Speaking', defaultPoints: 15 },
    { value: 'structured', label: 'Resposta Estruturada', defaultPoints: 10 },
    { value: 'mock', label: 'Mock Interview', defaultPoints: 25 },
    { value: 'review', label: 'Review', defaultPoints: 0 },
    { value: 'rest', label: 'Descanso', defaultPoints: 0 }
];

// ==================== FUNÇÕES DE DATA ====================
function getWeekRange(date = new Date()) {
    const current = new Date(date);
    const day = current.getDay(); // 0 domingo, 1 segunda...
    // Ajustar para segunda como início da semana
    const diff = (day === 0 ? 6 : day - 1); // se domingo (0), diff = 6 (volta 6 dias)
    const monday = new Date(current);
    monday.setDate(current.getDate() - diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const format = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return {
        start: monday,
        end: sunday,
        rangeString: `${format(monday)} a ${format(sunday)}`,
        key: monday.toISOString().split('T')[0]
    };
}

function getWeekKey(date) {
    return getWeekRange(date).key;
}

// ==================== ESTADO GLOBAL ====================
let state = {
    schedule: JSON.parse(JSON.stringify(defaultSchedule)), // cópia editável
    activityTypes: JSON.parse(JSON.stringify(defaultActivityTypes)), // tipos editáveis
    weeks: {}, // chave (semana) -> { activities, weeklyProgress }
    currentWeekKey: getWeekKey(new Date()),
    history: [] // array de objetos com weekKey, totalPoints, fluency, confidence
};

// ==================== FUNÇÕES DE PONTUAÇÃO ====================
function calculatePoints(activity, userInput) {
    const { type, defaultPoints } = activity;
    switch (type) {
        case 'listening':
            return userInput && userInput.trim().length >= 50 ? defaultPoints : 0;
        case 'anki':
        case 'grammar':
            return userInput && userInput.trim().length > 0 ? defaultPoints : 0;
        case 'mock':
        case 'speaking':
        case 'structured':
            return defaultPoints;
        default:
            return 0;
    }
}

function getPerformanceLevel(points) {
    if (points >= 90) return { label: 'Excelente', color: '#10b981', emoji: '🟢' };
    if (points >= 70) return { label: 'Boa', color: '#f59e0b', emoji: '🟡' };
    if (points >= 50) return { label: 'Média', color: '#f97316', emoji: '🟠' };
    return { label: 'Fraca', color: '#ef4444', emoji: '🔴' };
}

// ==================== LOCALSTORAGE ====================
const STORAGE_KEY = 'b2-study-tracker-v4';

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            state = JSON.parse(saved);
        } else {
            resetToDefault();
        }
    } catch (error) {
        console.error('Erro ao carregar estado:', error);
        resetToDefault();
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Erro ao salvar estado:', error);
    }
}

function resetToDefault() {
    state.schedule = JSON.parse(JSON.stringify(defaultSchedule));
    state.activityTypes = JSON.parse(JSON.stringify(defaultActivityTypes));
    state.weeks = {};
    state.currentWeekKey = getWeekKey(new Date());
    state.history = [];
    ensureCurrentWeek();
}

// ==================== GARANTIR SEMANA ATUAL ====================
function ensureCurrentWeek() {
    if (!state.weeks[state.currentWeekKey]) {
        state.weeks[state.currentWeekKey] = {
            activities: {},
            weeklyProgress: {
                fluencyScore: 0,
                confidenceLevel: 0,
                mainGrammarMistake: '',
                newVocabulary: '',
                totalPoints: 0
            }
        };
    }
}

// ==================== RENDERIZAÇÃO DO CALENDÁRIO ====================
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    const weekData = state.weeks[state.currentWeekKey] || { activities: {} };
    const activitiesState = weekData.activities;

    daysOfWeek.forEach((day, index) => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';

        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = dayNames[index];
        dayDiv.appendChild(dayHeader);

        const activitiesDiv = document.createElement('div');
        activitiesDiv.className = 'day-activities';

        const dayActivities = state.schedule[day] || [];
        dayActivities.forEach(activity => {
            if (activity.type === 'rest') {
                const restItem = document.createElement('div');
                restItem.className = 'activity-item';
                restItem.innerHTML = `<span class="activity-info">😴 ${activity.activity}</span>`;
                activitiesDiv.appendChild(restItem);
                return;
            }

            const isCompleted = activitiesState[activity.id]?.completed || false;
            
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'activity-info';
            infoDiv.innerHTML = `
                <span class="activity-time">${activity.time}</span>
                <span>${activity.activity}</span>
                ${activity.defaultPoints > 0 ? `<span class="activity-points">${activity.defaultPoints} pts</span>` : ''}
            `;
            
            const buttonsDiv = document.createElement('div');
            buttonsDiv.style.display = 'flex';
            buttonsDiv.style.gap = '0.25rem';

            const startBtn = document.createElement('button');
            startBtn.className = 'start-btn';
            startBtn.disabled = isCompleted;
            startBtn.innerHTML = '<i data-lucide="play"></i>';
            startBtn.title = 'Iniciar com timer';
            startBtn.dataset.activityId = activity.id;
            startBtn.dataset.day = day;
            startBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openTimerModal(activity, day);
            });

            const manualBtn = document.createElement('button');
            manualBtn.className = 'start-btn';
            manualBtn.style.background = '#10b981';
            manualBtn.disabled = isCompleted;
            manualBtn.innerHTML = '<i data-lucide="check"></i>';
            manualBtn.title = 'Concluir manualmente';
            manualBtn.dataset.activityId = activity.id;
            manualBtn.dataset.day = day;
            manualBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openManualCompleteModal(activity, day);
            });

            buttonsDiv.appendChild(startBtn);
            buttonsDiv.appendChild(manualBtn);

            activityItem.appendChild(infoDiv);
            activityItem.appendChild(buttonsDiv);
            
            activitiesDiv.appendChild(activityItem);
        });

        dayDiv.appendChild(activitiesDiv);
        calendar.appendChild(dayDiv);
    });

    if (window.lucide) lucide.createIcons();
}

// ==================== RENDERIZAÇÃO DO CHECKLIST DIÁRIO ====================
function renderDailyChecklist() {
    const today = new Date().getDay();
    const todayKey = daysOfWeek[today === 0 ? 6 : today - 1];
    const todayActivities = state.schedule[todayKey] || [];

    const weekData = state.weeks[state.currentWeekKey] || { activities: {} };
    const activitiesState = weekData.activities;

    const checklist = document.getElementById('dailyChecklist');
    checklist.innerHTML = '';

    let todayPoints = 0;

    todayActivities.forEach(activity => {
        if (activity.type === 'rest') return;

        const completed = activitiesState[activity.id]?.completed || false;
        const pointsEarned = activitiesState[activity.id]?.pointsEarned || 0;
        
        if (completed) todayPoints += pointsEarned;

        const item = document.createElement('div');
        item.className = `checklist-item ${completed ? 'completed' : ''}`;
        
        item.innerHTML = `
            <input type="checkbox" ${completed ? 'checked' : ''} disabled>
            <span>${activity.time} - ${activity.activity}</span>
            <span class="activity-points">${pointsEarned}/${activity.defaultPoints} pts</span>
        `;
        
        checklist.appendChild(item);
    });

    const totalDiv = document.createElement('div');
    totalDiv.className = 'checklist-item';
    totalDiv.style.background = '#e0f2fe';
    totalDiv.innerHTML = `
        <span><strong>Total do dia:</strong></span>
        <span><strong>${todayPoints} pts</strong></span>
    `;
    checklist.appendChild(totalDiv);
}

// ==================== RENDERIZAÇÃO DO RESUMO SEMANAL ====================
function renderWeeklyChecklist() {
    const container = document.getElementById('weeklyChecklist');
    
    const weekData = state.weeks[state.currentWeekKey] || { weeklyProgress: {} };
    const progress = weekData.weeklyProgress;
    
    const level = getPerformanceLevel(progress.totalPoints || 0);
    
    container.innerHTML = `
        <div class="performance-badge" style="background: ${level.color}">
            ${level.emoji} ${level.label} · ${progress.totalPoints || 0} pts
        </div>
        <div class="weekly-stats">
            <div class="stat-item">
                <label>Fluency Score (1-5):</label>
                <input type="number" id="fluencyScore" min="1" max="5" value="${progress.fluencyScore || 0}">
            </div>
            <div class="stat-item">
                <label>Confidence Level (1-5):</label>
                <input type="number" id="confidenceLevel" min="1" max="5" value="${progress.confidenceLevel || 0}">
            </div>
            <div class="stat-item">
                <label>Principal erro gramatical:</label>
                <input type="text" id="mainGrammarMistake" value="${progress.mainGrammarMistake || ''}">
            </div>
            <div class="stat-item">
                <label>Novo vocabulário:</label>
                <textarea id="newVocabulary" rows="2">${progress.newVocabulary || ''}</textarea>
            </div>
            <button class="btn-success" id="saveWeeklyBtn">Salvar Avaliação</button>
        </div>
    `;

    document.getElementById('saveWeeklyBtn').addEventListener('click', () => {
        const weekData = state.weeks[state.currentWeekKey] || { weeklyProgress: {} };
        weekData.weeklyProgress = {
            fluencyScore: parseInt(document.getElementById('fluencyScore').value) || 0,
            confidenceLevel: parseInt(document.getElementById('confidenceLevel').value) || 0,
            mainGrammarMistake: document.getElementById('mainGrammarMistake').value,
            newVocabulary: document.getElementById('newVocabulary').value,
            totalPoints: weekData.weeklyProgress.totalPoints || 0
        };
        state.weeks[state.currentWeekKey] = weekData;
        
        saveState();
        updateTotalPointsDisplay();
        renderCharts();
        renderHistory();
    });
}

// ==================== GRÁFICOS ====================
let pointsChart, scoresChart;

function renderCharts() {
    const history = state.history.slice(-4);
    const weeks = history.map((_, i) => `S${i+1}`);
    const points = history.map(h => h.totalPoints);
    const fluency = history.map(h => h.fluency);
    const confidence = history.map(h => h.confidence);

    if (pointsChart) pointsChart.destroy();
    if (scoresChart) scoresChart.destroy();

    const pointsCtx = document.getElementById('pointsChart').getContext('2d');
    pointsChart = new Chart(pointsCtx, {
        type: 'line',
        data: {
            labels: weeks,
            datasets: [{
                label: 'Pontos Semanais',
                data: points,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 120 } }
        }
    });

    const scoresCtx = document.getElementById('scoresChart').getContext('2d');
    scoresChart = new Chart(scoresCtx, {
        type: 'bar',
        data: {
            labels: weeks,
            datasets: [
                { label: 'Fluency', data: fluency, backgroundColor: '#10b981', borderRadius: 6 },
                { label: 'Confidence', data: confidence, backgroundColor: '#f59e0b', borderRadius: 6 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 5 } }
        }
    });
}

// ==================== HISTÓRICO ====================
function renderHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    const sorted = [...state.history].reverse();
    sorted.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <span>${entry.weekKey}</span>
            <span class="history-points">${entry.totalPoints} pts</span>
            <span>${entry.fluency}/5 · ${entry.confidence}/5</span>
        `;
        item.addEventListener('click', () => {
            // Navegar para a semana clicada
            state.currentWeekKey = entry.weekKey;
            ensureCurrentWeek();
            updateWeekDisplay();
            renderCalendar();
            renderDailyChecklist();
            renderWeeklyChecklist();
            updateTotalPointsDisplay();
        });
        historyList.appendChild(item);
    });
}

// ==================== ATUALIZAR HISTÓRICO ====================
function updateHistoryFromWeeks() {
    const history = [];
    for (const [weekKey, weekData] of Object.entries(state.weeks)) {
        history.push({
            weekKey,
            totalPoints: weekData.weeklyProgress.totalPoints || 0,
            fluency: weekData.weeklyProgress.fluencyScore || 0,
            confidence: weekData.weeklyProgress.confidenceLevel || 0
        });
    }
    history.sort((a, b) => a.weekKey.localeCompare(b.weekKey));
    state.history = history;
}

// ==================== NAVEGAÇÃO ENTRE SEMANAS ====================
function updateWeekDisplay() {
    const range = getWeekRange(new Date(state.currentWeekKey + 'T12:00:00'));
    document.getElementById('weekRangeDisplay').textContent = range.rangeString;
}

function goToPrevWeek() {
    const currentDate = new Date(state.currentWeekKey + 'T12:00:00');
    currentDate.setDate(currentDate.getDate() - 7);
    state.currentWeekKey = getWeekKey(currentDate);
    ensureCurrentWeek();
    updateWeekDisplay();
    renderCalendar();
    renderDailyChecklist();
    renderWeeklyChecklist();
    updateTotalPointsDisplay();
    saveState();
}

function goToNextWeek() {
    const currentDate = new Date(state.currentWeekKey + 'T12:00:00');
    currentDate.setDate(currentDate.getDate() + 7);
    state.currentWeekKey = getWeekKey(currentDate);
    ensureCurrentWeek();
    updateWeekDisplay();
    renderCalendar();
    renderDailyChecklist();
    renderWeeklyChecklist();
    updateTotalPointsDisplay();
    saveState();
}

// ==================== TIMER / MODAL ====================
let currentActivity = null;
let currentDay = null;
let timerInterval = null;
let timeLeft = 0;
let isRunning = false;

function openTimerModal(activity, day) {
    currentActivity = activity;
    currentDay = day;
    timeLeft = activity.duration * 60;
    isRunning = false;

    document.getElementById('modalActivityTitle').textContent = activity.activity;
    document.getElementById('modalTime').textContent = `${activity.time} · ${activity.duration} min`;
    document.getElementById('timerDisplay').textContent = formatTime(timeLeft);
    document.getElementById('timerDisplay').classList.remove('hidden');
    
    document.getElementById('inputSection').classList.add('hidden');
    document.getElementById('timerControls').classList.remove('hidden');
    
    document.getElementById('startTimerBtn').disabled = false;
    document.getElementById('pauseTimerBtn').disabled = true;
    
    document.getElementById('timerModal').classList.remove('hidden');
}

function openManualCompleteModal(activity, day) {
    currentActivity = activity;
    currentDay = day;
    
    document.getElementById('modalActivityTitle').textContent = activity.activity;
    document.getElementById('modalTime').textContent = `${activity.time} · ${activity.duration} min (manual)`;
    
    document.getElementById('timerDisplay').classList.add('hidden');
    document.getElementById('timerControls').classList.add('hidden');
    
    const inputSection = document.getElementById('inputSection');
    const inputLabel = document.getElementById('inputLabel');
    const activityInput = document.getElementById('activityInput');
    const completeBtn = document.getElementById('completeActivityBtn');
    
    inputSection.classList.remove('hidden');
    
    if (activity.type === 'listening') {
        inputLabel.textContent = '✍️ Escreva um resumo do que ouviu (mínimo 50 caracteres):';
        activityInput.classList.remove('hidden');
        activityInput.value = '';
        completeBtn.disabled = true;
        activityInput.oninput = () => {
            completeBtn.disabled = activityInput.value.trim().length < 50;
        };
    } else if (activity.type === 'anki') {
        inputLabel.textContent = '📝 Crie uma frase usando 2 palavras do Anki:';
        activityInput.classList.remove('hidden');
        activityInput.value = '';
        completeBtn.disabled = false;
        activityInput.oninput = null;
    } else if (activity.type === 'grammar') {
        inputLabel.textContent = '🗣️ Escreva a frase que você falou usando a estrutura gramatical:';
        activityInput.classList.remove('hidden');
        activityInput.value = '';
        completeBtn.disabled = false;
        activityInput.oninput = null;
    } else {
        inputLabel.textContent = 'Confirmar conclusão manual?';
        activityInput.classList.add('hidden');
        completeBtn.disabled = false;
    }
    
    completeBtn.onclick = () => {
        let userInput = '';
        if (!activityInput.classList.contains('hidden')) {
            userInput = activityInput.value;
        }
        completeActivity(userInput);
    };
    
    document.getElementById('timerModal').classList.remove('hidden');
}

function closeModal() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    document.getElementById('timerDisplay').classList.remove('hidden');
    document.getElementById('timerControls').classList.remove('hidden');
    document.getElementById('inputSection').classList.add('hidden');
    document.getElementById('activityInput').classList.remove('hidden');
    document.getElementById('timerModal').classList.add('hidden');
    currentActivity = null;
    currentDay = null;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (!currentActivity || timeLeft <= 0) return;
    
    isRunning = true;
    document.getElementById('startTimerBtn').disabled = true;
    document.getElementById('pauseTimerBtn').disabled = false;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timerDisplay').textContent = formatTime(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            isRunning = false;
            document.getElementById('startTimerBtn').disabled = true;
            document.getElementById('pauseTimerBtn').disabled = true;
            showInputSection();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    document.getElementById('startTimerBtn').disabled = false;
    document.getElementById('pauseTimerBtn').disabled = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    timeLeft = currentActivity.duration * 60;
    document.getElementById('timerDisplay').textContent = formatTime(timeLeft);
    document.getElementById('startTimerBtn').disabled = false;
    document.getElementById('pauseTimerBtn').disabled = true;
    document.getElementById('inputSection').classList.add('hidden');
    document.getElementById('timerControls').classList.remove('hidden');
}

function showInputSection() {
    const activity = currentActivity;
    const inputSection = document.getElementById('inputSection');
    const timerControls = document.getElementById('timerControls');
    const inputLabel = document.getElementById('inputLabel');
    const activityInput = document.getElementById('activityInput');
    const completeBtn = document.getElementById('completeActivityBtn');
    
    document.getElementById('timerDisplay').classList.remove('hidden');
    
    if (activity.type === 'listening') {
        inputLabel.textContent = '✍️ Escreva um resumo do que ouviu (mínimo 50 caracteres):';
    } else if (activity.type === 'anki') {
        inputLabel.textContent = '📝 Crie uma frase usando 2 palavras do Anki:';
    } else if (activity.type === 'grammar') {
        inputLabel.textContent = '🗣️ Escreva a frase que você falou usando a estrutura gramatical:';
    } else {
        completeActivity('');
        return;
    }
    
    activityInput.value = '';
    activityInput.classList.remove('hidden');
    timerControls.classList.add('hidden');
    inputSection.classList.remove('hidden');
    
    completeBtn.onclick = () => {
        completeActivity(activityInput.value);
    };
    
    if (activity.type === 'listening') {
        activityInput.addEventListener('input', () => {
            completeBtn.disabled = activityInput.value.trim().length < 50;
        });
        completeBtn.disabled = true;
    } else {
        completeBtn.disabled = false;
    }
}

function completeActivity(userInput) {
    if (!currentActivity) return;
    
    const pointsEarned = calculatePoints(currentActivity, userInput);
    
    ensureCurrentWeek();
    
    const weekData = state.weeks[state.currentWeekKey];
    weekData.activities[currentActivity.id] = {
        completed: true,
        completedAt: new Date().toISOString(),
        pointsEarned: pointsEarned,
        userInput: userInput || null
    };
    
    let totalPoints = 0;
    Object.values(weekData.activities).forEach(act => {
        if (act.completed) totalPoints += act.pointsEarned;
    });
    weekData.weeklyProgress.totalPoints = totalPoints;
    
    updateHistoryFromWeeks();
    saveState();
    updateTotalPointsDisplay();
    renderCalendar();
    renderDailyChecklist();
    renderWeeklyChecklist();
    renderCharts();
    renderHistory();
    
    closeModal();
}

function updateTotalPointsDisplay() {
    const weekData = state.weeks[state.currentWeekKey];
    const total = weekData?.weeklyProgress.totalPoints || 0;
    document.querySelector('#totalPoints span').textContent = `${total} pts`;
}

// ==================== EDIÇÃO DO CRONOGRAMA ====================
function openEditModal() {
    renderEditSchedule();
    document.getElementById('editScheduleModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editScheduleModal').classList.add('hidden');
}

function renderEditSchedule() {
    const container = document.getElementById('editScheduleContainer');
    container.innerHTML = '';

    daysOfWeek.forEach((day, idx) => {
        const section = document.createElement('div');
        section.className = 'edit-day-section';
        section.dataset.day = day;

        const header = document.createElement('div');
        header.className = 'edit-day-header';
        header.innerHTML = `<span>${dayNames[idx]}</span>`;
        section.appendChild(header);

        const activitiesList = document.createElement('div');
        activitiesList.className = 'edit-activities-list';
        activitiesList.id = `edit-${day}-list`;

        // Listar atividades existentes
        const dayActivities = state.schedule[day] || [];
        dayActivities.forEach(activity => {
            const activityDiv = document.createElement('div');
            activityDiv.className = 'edit-activity-item';
            activityDiv.innerHTML = `
                <span><strong>${activity.time}</strong> - ${activity.activity} (${getTypeLabel(activity.type)})</span>
                <div class="edit-activity-actions">
                    <button class="edit-activity-btn" data-day="${day}" data-id="${activity.id}"><i data-lucide="pencil"></i></button>
                    <button class="delete-activity-btn" data-day="${day}" data-id="${activity.id}"><i data-lucide="trash-2"></i></button>
                </div>
            `;
            activitiesList.appendChild(activityDiv);
        });

        section.appendChild(activitiesList);

        // Botão adicionar
        const addBtn = document.createElement('button');
        addBtn.className = 'add-activity-btn';
        addBtn.innerHTML = '<i data-lucide="plus"></i> Adicionar atividade';
        addBtn.addEventListener('click', () => showActivityForm(day, null));
        section.appendChild(addBtn);

        container.appendChild(section);
    });

    // Adicionar event listeners para editar/excluir
    document.querySelectorAll('.edit-activity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const day = btn.dataset.day;
            const id = btn.dataset.id;
            const activity = state.schedule[day].find(a => a.id === id);
            showActivityForm(day, activity);
        });
    });

    document.querySelectorAll('.delete-activity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const day = btn.dataset.day;
            const id = btn.dataset.id;
            if (confirm('Tem certeza que deseja excluir esta atividade?')) {
                state.schedule[day] = state.schedule[day].filter(a => a.id !== id);
                renderEditSchedule(); // re-renderiza a lista
            }
        });
    });

    if (window.lucide) lucide.createIcons();
}

function getTypeLabel(typeValue) {
    const type = state.activityTypes.find(t => t.value === typeValue);
    return type ? type.label : typeValue;
}

// ==================== FUNÇÃO SHOW ACTIVITY FORM (CORRIGIDA) ====================
function showActivityForm(day, activity) {
    const listDiv = document.getElementById(`edit-${day}-list`);
    if (!listDiv) return;

    const formDiv = document.createElement('div');
    formDiv.className = 'activity-edit-form';

    // Prevent multiple open forms for same day (keeps UX clean)
    const existingForm = listDiv.querySelector('.activity-edit-form');
    if (existingForm) existingForm.remove();

    const isEditing = !!activity;
    const activityType = activity ? activity.type : (state.activityTypes[0]?.value || '');
    const activityName = activity ? activity.activity : '';
    const timeStr = activity ? activity.time : '08:00-08:30';

    let start = '08:00', end = '08:30';
    if (timeStr && typeof timeStr === 'string' && timeStr.includes('-')) {
        [start, end] = timeStr.split('-');
    }
    start = start || '08:00';
    end = end || '08:30';

    const typeOptions = state.activityTypes.map(t =>
        `<option value="${t.value}" ${t.value === activityType ? 'selected' : ''}>${t.label} (${t.defaultPoints} pts)</option>`
    ).join('');

    formDiv.innerHTML = `
        <h4>${isEditing ? 'Editar' : 'Nova'} Atividade</h4>
        <input type="text" name="edit-name" placeholder="Nome da atividade" value="${activityName}">
        <div style="display: flex; gap: 0.5rem;">
            <input type="time" name="edit-start" value="${start}" style="flex:1;">
            <input type="time" name="edit-end" value="${end}" style="flex:1;">
        </div>
        <select name="edit-type">
            ${typeOptions}
        </select>
        <div class="form-actions">
            <button class="btn-secondary" type="button" data-action="cancel">Cancelar</button>
            <button class="btn-success" type="button" data-action="save">Salvar</button>
        </div>
    `;

    listDiv.prepend(formDiv);

    const $name = formDiv.querySelector('input[name="edit-name"]');
    const $start = formDiv.querySelector('input[name="edit-start"]');
    const $end = formDiv.querySelector('input[name="edit-end"]');
    const $type = formDiv.querySelector('select[name="edit-type"]');
    const $cancel = formDiv.querySelector('[data-action="cancel"]');
    const $save = formDiv.querySelector('[data-action="save"]');

    $cancel.addEventListener('click', () => formDiv.remove());

    $save.addEventListener('click', () => {
        const name = ($name.value || '').trim();
        const startTime = $start.value;
        const endTime = $end.value;
        const type = $type.value;

        if (!name || !startTime || !endTime) {
            alert('Preencha todos os campos');
            return;
        }

        const time = `${startTime}-${endTime}`;
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);

        if (duration <= 0) {
            alert('Horário inválido (fim deve ser depois do início)');
            return;
        }

        const typeInfo = state.activityTypes.find(t => t.value === type);
        const defaultPoints = typeInfo ? typeInfo.defaultPoints : 0;

        if (isEditing) {
            activity.activity = name;
            activity.time = time;
            activity.type = type;
            activity.duration = duration;
            activity.defaultPoints = defaultPoints;
        } else {
            const newId = `${day}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            const newActivity = {
                id: newId,
                time,
                activity: name,
                type,
                duration,
                defaultPoints
            };
            if (!state.schedule[day]) state.schedule[day] = [];
            state.schedule[day].push(newActivity);

            // Keep day ordered by start time
            state.schedule[day].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
        }

        formDiv.remove();
        renderEditSchedule();
    });
}


// ==================== EDIÇÃO DE TIPOS DE ATIVIDADE (GERENCIAR ATIVIDADES) ====================
function openEditTypesModal() {
    renderEditTypes();
    document.getElementById('editTypesModal').classList.remove('hidden');
}

function closeEditTypesModal() {
    document.getElementById('editTypesModal').classList.add('hidden');
}

function renderEditTypes() {
    const container = document.getElementById('editTypesContainer');
    container.innerHTML = '';

    const typesList = document.createElement('div');
    typesList.className = 'edit-types-list';

    state.activityTypes.forEach((type, index) => {
        const typeDiv = document.createElement('div');
        typeDiv.className = 'edit-activity-item';
        typeDiv.innerHTML = `
            <span><strong>${type.label}</strong> (${type.defaultPoints} pts) - ${type.value}</span>
            <div class="edit-activity-actions">
                <button class="edit-type-btn" data-index="${index}"><i data-lucide="pencil"></i></button>
                <button class="delete-type-btn" data-value="${type.value}"><i data-lucide="trash-2"></i></button>
            </div>
        `;
        typesList.appendChild(typeDiv);
    });

    container.appendChild(typesList);

    // Botão adicionar novo tipo
    const addBtn = document.createElement('button');
    addBtn.className = 'add-activity-btn';
    addBtn.innerHTML = '<i data-lucide="plus"></i> Criar Atividade';
    addBtn.addEventListener('click', showTypeForm);
    container.appendChild(addBtn);

    // Event listeners para editar
    document.querySelectorAll('.edit-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = btn.dataset.index;
            const type = state.activityTypes[index];
            showTypeForm(type, index);
        });
    });

    // Event listeners para excluir
    document.querySelectorAll('.delete-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const value = btn.dataset.value;
            // Verificar se o tipo está sendo usado em alguma atividade
            const isUsed = Object.values(state.schedule).some(dayActivities =>
                dayActivities.some(act => act.type === value)
            );
            if (isUsed) {
                alert('Este tipo está sendo usado em atividades do cronograma. Remova ou edite as atividades primeiro.');
                return;
            }
            if (confirm('Tem certeza que deseja excluir este tipo?')) {
                state.activityTypes = state.activityTypes.filter(t => t.value !== value);
                saveState();
                renderEditTypes();
            }
        });
    });

    if (window.lucide) lucide.createIcons();
}

// ==================== FUNÇÃO SHOW TYPE FORM (CORRIGIDA) ====================
function showTypeForm(existingType = null, index = null) {
    const container = document.getElementById('editTypesContainer');
    const formDiv = document.createElement('div');
    formDiv.className = 'activity-edit-form';

    const isEditing = existingType !== null;
    const labelValue = existingType ? existingType.label : '';
    const pointsValue = existingType ? existingType.defaultPoints : 5;

    let html = `
        <h4>${isEditing ? 'Editar' : 'Nova'} Atividade</h4>
        <input type="text" id="edit-type-label" placeholder="Nome da atividade (ex: Leitura)" value="${labelValue}">
        <input type="number" id="edit-type-points" placeholder="Pontos padrão" min="0" value="${pointsValue}">
    `;
    if (!isEditing) {
        html += `<input type="text" id="edit-type-value" placeholder="Identificador único (ex: leitura) - deixe em branco para gerar automaticamente" value="">`;
    }
    html += `
        <div class="form-actions">
            <button class="btn-secondary" id="cancel-type-edit">Cancelar</button>
            <button class="btn-success" id="save-type-edit">Salvar</button>
        </div>
    `;

    formDiv.innerHTML = html;
    container.prepend(formDiv);

    document.getElementById('cancel-type-edit').addEventListener('click', () => {
        formDiv.remove();
    });

    document.getElementById('save-type-edit').addEventListener('click', () => {
        const label = document.getElementById('edit-type-label').value.trim();
        const points = parseInt(document.getElementById('edit-type-points').value);
        if (!label || isNaN(points)) {
            alert('Preencha todos os campos');
            return;
        }

        if (isEditing) {
            // Atualizar
            existingType.label = label;
            existingType.defaultPoints = points;
        } else {
            let valueInput = document.getElementById('edit-type-value')?.value.trim() || '';
            if (!valueInput) {
                // Gerar automaticamente a partir do label
                valueInput = label.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '_')
                    .replace(/^_|_$/g, '');
                if (!valueInput) valueInput = 'novo_tipo';
            }
            // Verificar se já existe
            if (state.activityTypes.some(t => t.value === valueInput)) {
                alert('Já existe um tipo com esse identificador. Escolha outro ou deixe em branco para gerar automaticamente.');
                return;
            }
            state.activityTypes.push({
                value: valueInput,
                label: label,
                defaultPoints: points
            });
        }

        saveState(); // Persiste alterações
        formDiv.remove();
        renderEditTypes(); // Re-renderiza a lista
    });
}


// Helper: add click listeners safely (avoids errors if element is removed)
function onClick(id, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', handler);
}

// ==================== EVENT LISTENERS ====================
onClick('startTimerBtn', startTimer);
onClick('pauseTimerBtn', pauseTimer);
onClick('resetTimerBtn', resetTimer);
onClick('prevWeekBtn', goToPrevWeek);
onClick('nextWeekBtn', goToNextWeek);
onClick('editScheduleBtn', openEditModal);
onClick('saveScheduleBtn', () => {
    saveState();
    closeEditModal();
    renderCalendar();
    renderDailyChecklist();
});

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    ensureCurrentWeek();
    updateWeekDisplay();
    renderCalendar();
    renderDailyChecklist();
    renderWeeklyChecklist();
    updateTotalPointsDisplay();
    renderCharts();
    renderHistory();
    
    if (window.lucide) lucide.createIcons();
});
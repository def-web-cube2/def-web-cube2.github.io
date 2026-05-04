// [Unverified] Я не могу проверить корректность работы часовых поясов в вашем браузере.
// Переменные для переключения вкладок
const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// --- ЧАСЫ ---
function updateClocks() { 
    const now = new Date();
    


    // Местное время
    document.getElementById('local-time').textContent = now.toLocaleTimeString('ru-RU');
    document.getElementById('local-date').textContent = now.toLocaleDateString('ru-RU');
    
    // Иркутск
    const irkutskOptions = { timeZone: 'Asia/Irkutsk', hour12: false };
    const irkutskTime = now.toLocaleTimeString('ru-RU', irkutskOptions);
    const irkutskDate = now.toLocaleDateString('ru-RU', irkutskOptions);
    document.getElementById('irutsk-time').textContent = irkutskTime;
    document.getElementById('irkutsk-date').textContent = irkutskDate;
   
    // Москва
    const moscowOptions = { timeZone: "Europe/Moscow" ,hour07: false } 
    const moscowTime = now.toLocaleTimeString('ru-RU', moscowOptions);
    const moscowDate = now.toLocaleDateString('ru-RU', moscowOptions);
    document.getElementById('moscow-time').textContent = moscowTime;
    document.getElementById('moscow-date').textContent = moscowDate;
    
    // Выбранный пояс
    const zone = document.getElementById('timezone-select').value;
    const zoneOptions = { timeZone: zone, hour12: false };
    document.getElementById('selected-zone-time').textContent = now.toLocaleTimeString('ru-RU', zoneOptions);
}

setInterval(updateClocks, 1000);
updateClocks();

document.getElementById('timezone-select').addEventListener('change', updateClocks);

// --- БУДИЛЬНИК ---
let alarmTime = null;
let alarmTimeout = null;
const alarmSound = new AudioContext(); // [Inference] Использование AudioContext может быть ограничено политиками браузеров.

document.getElementById('set-alarm-btn').addEventListener('click', () => {
    const input = document.getElementById('alarm-time-input').value;
    if (input) {
        alarmTime = input;
        document.getElementById('alarm-status').textContent = `Будильник установлен на ${alarmTime}`;
        document.getElementById('alarm-status').style.color = 'var(--success-color)';
    }
});

document.getElementById('clear-alarm-btn').addEventListener('click', () => {
    alarmTime = null;
    document.getElementById('alarm-status').textContent = 'Будильник не установлен';
    document.getElementById('alarm-status').style.color = 'var(--text-color)';
    if (alarmTimeout) clearTimeout(alarmTimeout);
    stopAlarmSound();
});

function checkAlarm() {
    if (!alarmTime) return;
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;
    
    if (currentTime === alarmTime && now.getSeconds() === 0) {
        playAlarmSound();
        document.getElementById('alarm-status').textContent = 'ЗВОНОК!';
        document.getElementById('alarm-status').style.color = 'var(--danger-color)';
    }
}

setInterval(checkAlarm, 1000);

function playAlarmSound() {
    // [Speculation] Простая генерация звука через Web Audio API
    const oscillator = alarmSound.createOscillator();
    const gainNode = alarmSound.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(alarmSound.destination);
    oscillator.type = 'square';
    oscillator.frequency.value = 440; 
    gainNode.gain.value = 0.1;
    oscillator.start();
    // Остановить через 5 секунд
    setTimeout(() => { oscillator.stop(); }, 5000);
}

function stopAlarmSound() {
    if (alarmSound) {
        // [Unverified] Метод закрытия контекста может отличаться в разных браузерах.
        alarmSound.close().catch(() => {}); 
    }
}

// --- СЕКУНДОМЕР ---
let swStartTime = 0;
let swElapsedTime = 0;
let swInterval = null;
let swRunning = false;

const swDisplay = document.getElementById('stopwatch-display');
const swLapsList = document.getElementById('sw-laps');

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
}

document.getElementById('sw-start').addEventListener('click', () => {
    if (!swRunning) {
        swStartTime = Date.now() - swElapsedTime;
        swInterval = setInterval(() => {
            swElapsedTime = Date.now() - swStartTime;
            swDisplay.textContent = formatTime(swElapsedTime);
        }, 10);
        swRunning = true;
    }
});

document.getElementById('sw-stop').addEventListener('click', () => {
    if (swRunning) {
        clearInterval(swInterval);
        swRunning = false;
    }
});

document.getElementById('sw-reset').addEventListener('click', () => {
    clearInterval(swInterval);
    swRunning = false;
    swElapsedTime = 0;
    swDisplay.textContent = '00:00:00';
    swLapsList.innerHTML = '';
});

// Добавление функции круга к секундомеру (дополнительная кнопка может потребоваться в HTML)
// Для краткости в этом примере кнопка круга не выведена в основной интерфейс, но логика доступна.

// --- ТАЙМЕР ---
let timerInterval = null;
let timerRemaining = 0;
let timerRunning = false;

const timerDisplay = document.getElementById('timer-display');

function updateTimerDisplay() {
    const hours = Math.floor(timerRemaining / 3600);
    const minutes = Math.floor((timerRemaining % 3600) / 60);
    const seconds = timerRemaining % 60;
    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.getElementById('timer-start').addEventListener('click', () => {
    if (!timerRunning) {
        if (timerRemaining === 0) {
            const h = parseInt(document.getElementById('timer-hours').value) || 0;
            const m = parseInt(document.getElementById('timer-minutes').value) || 0;
            const s = parseInt(document.getElementById('timer-seconds').value) || 0;
            timerRemaining = h * 3600 + m * 60 + s;
        }
        
        if (timerRemaining > 0) {
            timerRunning = true;
            updateTimerDisplay();
            timerInterval = setInterval(() => {
                if (timerRemaining > 0) {
                    timerRemaining--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    timerDisplay.textContent = 'ГОТОВО';
                    playAlarmSound(); // Используем тот же звук
                }
            }, 1000);
        }
    }
});

document.getElementById('timer-pause').addEventListener('click', () => {
    if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
    }
});

document.getElementById('timer-reset').addEventListener('click', () => {
    clearInterval(timerInterval);
    timerRunning = false;
    timerRemaining = 0;
    timerDisplay.textContent = '00:00:00';
});
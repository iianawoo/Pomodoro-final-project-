let timerDisplay = document.getElementById('timer');
let workButton = document.getElementById('work-btn');
let breakButton = document.getElementById('break-btn');
let startButton = document.getElementById('start-btn');
let resetButton = document.getElementById('reset-btn');
let sessionCounterDisplay = document.getElementById('session-counter');
let workTimeInput = document.getElementById('work-time');
let breakTimeInput = document.getElementById('break-time');
let sessionData = []; // это массив для хранения количества завершённых сессий
let progressBar = document.querySelector('.progress-bar');
let notificationSound = document.getElementById('notification-sound');


let countdown;
let timeLeft;
let isRunning = false;
let completedSessions = 0;
let workSessions = 0; // для отслеживания количества рабочих сессий
let mode = 'work'; // Возможные значения: 'work', 'break' или 'longBreak'

// создаем график
let progressChart = createChart();

function createChart() {
  let ctx = document.getElementById('progress-chart').getContext('2d');
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [], // Метки оси X (например, Session 1, Session 2)
      datasets: [{
        label: 'Completed Pomodoro Sessions',
        data: [], // Данные (количество завершённых сессий)
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1, // Шаг 1
            callback: function(value) {
              return Number.isInteger(value) ? value : ''; // Показываем только целые числа
            }
          }
        }
      },
      plugins: {
        legend: {
            display: true, // Включаем отображение легенды
            labels: {
                font: {
                    size: 12 // Уменьшаем шрифт, если нужно
                },
                boxWidth: 10, // Ширина квадрата цвета
                boxHeight: 10 // Высота квадрата цвета
            }
        }
    }
    
    }
  });
}

function updateCircleProgress() {
    const totalTime = mode === 'work' ? workTimeInput.value * 60 : breakTimeInput.value * 60;
    const progress = (timeLeft / totalTime) * 283; // Пропорция длины окружности
    progressBar.style.strokeDashoffset = 283 - progress; // Обновляем смещение
}


function updateChart() {
  // Обновляем метки и данные графика
  progressChart.data.labels = Array.from({ length: sessionData.length }, (_, i) => `Session ${i + 1}`);
  progressChart.data.datasets[0].data = sessionData;

  // Перерисовываем график
  progressChart.update();
}

// Установка времени по умолчанию
function setTimeForMode() {
  if (mode === 'work') {
    timeLeft = workTimeInput.value * 60;
  } else if (mode === 'break') {
    timeLeft = breakTimeInput.value * 60;
  } else if (mode === 'longBreak') {
    timeLeft = 15 * 60; // Длинный перерыв — 15 минут
  }
  displayTimeLeft(timeLeft);
  updateCircleProgress(); // Обновляем прогресс круга
}

function displayTimeLeft(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;
  timerDisplay.textContent = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
}

function switchMode(newMode) {
  mode = newMode;
  setTimeForMode();
  showNotification(
    mode === 'work' ? 'Work mode activated!' : mode === 'break' ? 'Break mode activated!' : 'Long break activated!'
  );
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;

  countdown = setInterval(() => {
    timeLeft--;
    displayTimeLeft(timeLeft);
    updateCircleProgress();


    if (timeLeft <= 0) {
      clearInterval(countdown);
      isRunning = false;
      notificationSound.play();


      if (mode === 'work') {
        completedSessions++;
        workSessions++;
        sessionCounterDisplay.textContent = `Completed Sessions: ${completedSessions}`;
        sessionData.push(1); // Увеличиваем количество завершённых сессий
        saveSessionData(); // Сохраняем данные
        updateChart(); // Обновляем график

        if (workSessions >= 4) {
          workSessions = 0; // Сбрасываем счётчик рабочих сессий
          showNotification('Time for a long break!');
          mode = 'longBreak'; // Устанавливаем длинный перерыв
          timeLeft = 15 * 60; // 15 минут
        } else {
          showNotification('Time for a break!');
          switchMode('break');
        }
      } else if (mode === 'break' || mode === 'longBreak') {
        showNotification('Time to work!');
        switchMode('work');
      }
    }
  }, 1000);
}

function resetTimer() {
    clearInterval(countdown);
    isRunning = false;
    setTimeForMode();
    updateCircleProgress(); // Обновляем прогресс круга
  }
  

function showNotification(message) {
  notificationSound.play(); // Воспроизводим звук
  let notification = document.createElement('div');
  notification.textContent = message;
  notification.className = 'notification';
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Сохранение данных в localStorage
function saveSessionData() {
  localStorage.setItem('sessionData', JSON.stringify(sessionData));
}

// Загрузка данных из localStorage
function loadSessionData() {
  const data = localStorage.getItem('sessionData');
  if (data) {
    sessionData = JSON.parse(data);
    updateChart(); // Обновляем график после загрузки
  }
}

workButton.addEventListener('click', () => switchMode('work'));
breakButton.addEventListener('click', () => switchMode('break'));
startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);

// Инициализация таймера
loadSessionData();
setTimeForMode();

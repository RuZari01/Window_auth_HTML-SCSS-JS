document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const roomCodeInput = document.getElementById('room-code');
    const createButton = document.querySelector('.action-buttons button:first-child');
    const joinButton = document.querySelector('.action-buttons button:nth-child(2)');
    const errorBox = document.querySelector('.error-box') || document.createElement('div');

    const gameInterface = document.querySelector('.game-interface');
    const displayRoomCode = document.getElementById('display-room-code');
    const playersList = document.getElementById('players');

    const leaveRoomBtn = document.getElementById('leave-room-btn');

    localStorage.removeItem('bunker_username');

    // === Показ уведомления ===
    function showNotification({ message, type = 'info', duration = 3000 }) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type} show`;

        // Иконки SVG
        const icons = {
            success: `
            <svg class="icon" viewBox="0 0 20 20">
                <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm-1.414 14.586l-4-4 1.414-1.414L9 12.586l6.586-6.586 1.414 1.414z"/>
            </svg>
        `,
            error: `
            <svg class="icon" viewBox="0 0 20 20">
                <path d="M10 0a10 10 0 100 20 10 10 0 000-20zM8 14h4V6H8v8zm0-10h4v2H8V4zM8 6h4V4H8v2z"/>
            </svg>
        `,
            info: `
            <svg class="icon" viewBox="0 0 20 20">
                <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm1-13h-2v2h2V6zm0 3h-2v6h2V9z"/>
            </svg>
        `,
        };

        const iconHTML = icons[type] || icons.info;

        notification.innerHTML = `
        ${iconHTML}
        <div class="message">${message}</div>
        <button class="close-btn">&times;</button>
    `;

        container.appendChild(notification);

        // Автоматическое закрытие
        const timeout = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => container.removeChild(notification), 300);
        }, duration);

        // Ручное закрытие
        notification.querySelector('.close-btn').addEventListener('click', () => {
            clearTimeout(timeout);
            notification.classList.remove('show');
            setTimeout(() => container.removeChild(notification), 300);
        });
    }

    // Подготовка блока ошибок
    errorBox.classList.add('error-box');
    errorBox.style.display = 'none';
    if (!document.querySelector('.error-box')) {
        document.querySelector('.lobby__input')?.insertBefore(errorBox, document.querySelector('.action-buttons'));
    }

    // Загрузка сохраненного имени
    const savedName = localStorage.getItem('bunker_username');
    if (savedName) {
        usernameInput.value = savedName;
    }

    // Генерация кода комнаты
    function generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    // Показ ошибки
    function showError(message) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
        setTimeout(() => {
            errorBox.style.display = 'none';
        }, 3000);
    }

    // Обновление списка игроков
    function updatePlayersList(roomCode) {
        const key = `bunker_room_${roomCode}`;
        let players = JSON.parse(localStorage.getItem(key)) || [];

        // Если текущего игрока нет в списке — добавляем
        const username = usernameInput.value.trim();
        if (!players.includes(username)) {
            players.push(username);
            localStorage.setItem(key, JSON.stringify(players));
        }

        playersList.innerHTML = '';
        players.forEach(player => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="online-indicator"></span>${player}`;
            playersList.appendChild(li);
        });
    }

    // Обработка создания комнаты
    createButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();

        if (!username) {
            showNotification({ message: 'Введите ваше имя', type: 'error' });
            return;
        }

        const roomCode = generateRoomCode();
        localStorage.setItem('bunker_username', username);
        localStorage.setItem('current_bunker_room', roomCode);

        displayRoomCode.textContent = roomCode;
        updatePlayersList(roomCode);

        document.querySelector('.lobby__input').classList.add('hidden');
        gameInterface.classList.remove('hidden');
    });

    // Обработка присоединения к комнате
    joinButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const roomCode = roomCodeInput.value.trim().toUpperCase();

        if (!username) {
            showNotification({ message: 'Введите ваше имя', type: 'error' });
            return;
        }

        if (!roomCode) {
            showNotification({ message: 'Введите код комнаты', type: 'error' });
            return;
        }

        localStorage.setItem('bunker_username', username);
        localStorage.setItem('current_bunker_room', roomCode);

        displayRoomCode.textContent = roomCode;
        updatePlayersList(roomCode);

        document.querySelector('.lobby__input').classList.add('hidden');
        gameInterface.classList.remove('hidden');
    });

    // Выход из комнаты
    leaveRoomBtn.addEventListener('click', () => {
        const currentRoom = localStorage.getItem('current_bunker_room');
        if (!currentRoom) {
            showNotification({ message: 'Вы уже вышли из комнаты', type: 'error' });
            return;
        }

        const key = `bunker_room_${currentRoom}`;
        const username = usernameInput.value.trim();

        // Удаляем игрока из списка
        let players = JSON.parse(localStorage.getItem(key)) || [];
        players = players.filter(p => p !== username);
        localStorage.setItem(key, JSON.stringify(players));

        // Сбрасываем состояние
        localStorage.removeItem('current_bunker_room');
        gameInterface.classList.add('hidden');
        document.querySelector('.lobby__input').classList.remove('hidden');
    });

    // Кнопка "Начать игру" (заглушка)
    document.getElementById('start-game-btn')?.addEventListener('click', () => {
        const roomCode = localStorage.getItem('current_bunker_room');
        alert(`Игра началась в комнате ${roomCode}!`);
        // Здесь можно перенаправить на страницу игры
    });

    // Обновление списка игроков каждые 2 секунды
    setInterval(() => {
        const currentRoom = localStorage.getItem('current_bunker_room');
        if (currentRoom) {
            updatePlayersList(currentRoom);
        }
    }, 1000);

    // === Кнопка закрытия комнаты ===
    document.getElementById('close-room-btn')?.addEventListener('click', () => {
        const currentRoom = localStorage.getItem('current_bunker_room');
        if (!currentRoom) {
            showNotification({ message: 'Вы уже вышли из комнаты', type: 'error' });
            return;
        }

        const key = `bunker_room_${currentRoom}`;

        // Удаляем список игроков и информацию о комнате
        localStorage.removeItem(key);
        localStorage.removeItem('current_bunker_room');

        // Возвращаемся к форме авторизации
        gameInterface.classList.add('hidden');
        document.querySelector('.lobby__input').classList.remove('hidden');

        showNotification({ message: 'Комната закрыта', type: 'success' });
    });
});
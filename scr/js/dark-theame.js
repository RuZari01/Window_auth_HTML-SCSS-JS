document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('theme-toggle');

    if (!toggleButton) return;

    // Проверяем сохранённую тему в localStorage или устанавливаем светлую по умолчанию
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        toggleButton.textContent = '☀️';
    } else {
        document.body.classList.add('light-theme');
    }

    // Переключение темы при клике
    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');

        // Сохраняем текущую тему в localStorage
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);

        // Меняем значок кнопки
        toggleButton.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    });
});
// Коды стран
const countryCodes = {
    UA: '+380',
    RU: '+7',
    BY: '+375',
    KZ: '+7',
    UZ: '+998',
    KG: '+996',
    TJ: '+992',
    AM: '+374',
    AZ: '+994',
    MD: '+373',
    GE: '+995',
    PL: '+48',
    DE: '+49',
    TR: '+90',
    US: '+1',
    GB: '+44',
    FR: '+33',
    IT: '+39',
    ES: '+34',
    IL: '+972'
};

// Максимальная длина цифр номера (без кода страны)
const maxDigitsByCountry = {
    UA: 9,   // XX XXX XX XX
    RU: 10,  // XXX XXX XX XX
    BY: 9,
    KZ: 10,
    UZ: 9,
    KG: 9,
    TJ: 9,
    AM: 8,
    AZ: 9,
    MD: 8,
    GE: 9,
    PL: 9,
    DE: 11,
    TR: 10,
    US: 10,
    GB: 10,
    FR: 9,
    IT: 10,
    ES: 9,
    IL: 9
};

/**
 * Форматирует номер телефона с пробелами.
 * Пример: +380 99 666 77 88
 */
function formatPhoneNumber(value, countryCode) {
    // Оставляем только цифры
    const digits = value.replace(/\D/g, '');
    const codeDigits = countryCode.replace(/\D/g, '');
    
    // Цифры номера без кода страны
    let numberDigits = digits;
    if (digits.startsWith(codeDigits)) {
        numberDigits = digits.slice(codeDigits.length);
    }
    
    // Ограничиваем длину
    const countryKey = Object.keys(countryCodes).find(k => countryCodes[k] === countryCode);
    const maxLen = maxDigitsByCountry[countryKey] || 10;
    numberDigits = numberDigits.slice(0, maxLen);
    
    // Форматирование в зависимости от длины
    // Формат: XX XXX XX XX  (как 99 666 77 88)
    let formatted = '';
    if (numberDigits.length === 0) {
        formatted = '';
    } else if (numberDigits.length <= 2) {
        formatted = numberDigits;
    } else if (numberDigits.length <= 5) {
        formatted = numberDigits.slice(0, 2) + ' ' + numberDigits.slice(2);
    } else if (numberDigits.length <= 7) {
        formatted = numberDigits.slice(0, 2) + ' ' + numberDigits.slice(2, 5) + ' ' + numberDigits.slice(5);
    } else {
        formatted = numberDigits.slice(0, 2) + ' ' +
                    numberDigits.slice(2, 5) + ' ' +
                    numberDigits.slice(5, 7) + ' ' +
                    numberDigits.slice(7);
    }
    
    return countryCode + (formatted ? ' ' + formatted : ' ');
}

document.addEventListener('DOMContentLoaded', function () {
    const countrySelect = document.getElementById('country');
    const phoneInput = document.getElementById('phone');
    const phoneForm = document.getElementById('phoneForm');
    const codeForm = document.getElementById('codeForm');
    const displayPhone = document.getElementById('displayPhone');

    // Автоматическая подстановка кода страны + автоформатирование
    if (countrySelect && phoneInput) {
        // При загрузке страницы
        phoneInput.value = countryCodes[countrySelect.value] + ' ';

        // Смена страны
        countrySelect.addEventListener('change', function () {
            const code = countryCodes[this.value] || '';
            
            // Берём только цифры номера (без старого кода)
            let currentDigits = phoneInput.value.replace(/\D/g, '');
            const oldCode = Object.values(countryCodes).find(c => phoneInput.value.startsWith(c)) || '';
            const oldCodeDigits = oldCode.replace(/\D/g, '');
            
            if (currentDigits.startsWith(oldCodeDigits)) {
                currentDigits = currentDigits.slice(oldCodeDigits.length);
            }
            
            phoneInput.value = formatPhoneNumber(code + currentDigits, code);
            phoneInput.focus();
        });

        // Автоформатирование при вводе
        phoneInput.addEventListener('input', function () {
            const code = countryCodes[countrySelect.value] || '+380';
            const cursorPos = this.selectionStart;
            const oldValue = this.value;
            
            this.value = formatPhoneNumber(this.value, code);
            
            // Пытаемся сохранить позицию курсора
            const diff = this.value.length - oldValue.length;
            const newPos = Math.max(code.length + 1, cursorPos + diff);
            this.setSelectionRange(newPos, newPos);
        });

        // Запрещаем удаление кода страны при Backspace в начале
        phoneInput.addEventListener('keydown', function (e) {
            const code = countryCodes[countrySelect.value] || '+380';
            if ((e.key === 'Backspace' || e.key === 'Delete') && 
                this.selectionStart <= code.length + 1 && 
                this.selectionEnd <= code.length + 1) {
                e.preventDefault();
            }
        });
    }

    // Переход на страницу подтверждения после ввода номера
    if (phoneForm) {
        phoneForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const phone = phoneInput.value.trim();
            if (!phone || phone.length < 8) {
                alert('Пожалуйста, введите корректный номер телефона');
                return;
            }

            // Сохраняем номер, чтобы показать на второй странице
            localStorage.setItem('telegram_phone', phone);

            // Переходим на страницу подтверждения
            window.location.href = 'confirm.html';
        });
    }

    // На странице подтверждения показываем введённый номер
    if (displayPhone) {
        const savedPhone = localStorage.getItem('telegram_phone');
        if (savedPhone) {
            displayPhone.textContent = savedPhone;
        }
    }

    // Обработка формы кода (пока просто заглушка)
    if (codeForm) {
        codeForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const code = document.getElementById('code').value.trim();
            if (code.length === 4) {
                alert('Код принят: ' + code + '\n(Это демо-страница)');
            } else {
                alert('Введите 4-значный код');
            }
        });
    }
});

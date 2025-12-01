// Обробка форми бронювання
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    
    // Ініціалізація даних
    initHotelData();
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Збираємо дані форми
            const formData = {
                id: generateId(),
                roomType: document.getElementById('roomType').value,
                roomName: document.getElementById('roomType').options[document.getElementById('roomType').selectedIndex].text,
                checkIn: document.getElementById('checkIn').value,
                checkOut: document.getElementById('checkOut').value,
                adults: document.getElementById('adults').value,
                children: document.getElementById('children').value,
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                specialRequests: document.getElementById('specialRequests').value,
                createdAt: new Date().toISOString(),
                status: 'Підтверджено'
            };
            
            // Валідація дат
            const checkInDate = new Date(formData.checkIn);
            const checkOutDate = new Date(formData.checkOut);
            
            if (checkOutDate <= checkInDate) {
                alert('Дата виїзду повинна бути пізніше дати заїзду');
                return;
            }
            
            // Зберігаємо в LocalStorage
            saveBooking(formData);
            
            // Показати модальне вікно успіху
            showBookingDetails(formData);
            
            // Очистити форму
            this.reset();
            
            // Оновити мінімальні дати
            updateMinDates();
        });

        // Встановлення мінімальної дати як сьогодні
        updateMinDates();

        // Оновлення мінімальної дати виїзду при зміні дати заїзду
        document.getElementById('checkIn').addEventListener('change', function() {
            document.getElementById('checkOut').min = this.value;
            // Автоматично встановити дату виїзду +1 день
            if (this.value) {
                const nextDay = new Date(this.value);
                nextDay.setDate(nextDay.getDate() + 1);
                document.getElementById('checkOut').value = nextDay.toISOString().split('T')[0];
            }
        });
    }
    
    // Якщо це сторінка бронювань (адмінка)
    if (window.location.pathname.includes('admin.html') || 
        document.querySelector('.bookings-list')) {
        displayAllBookings();
    }
    
    // Перевірити, чи є успішне бронювання в URL
    checkUrlForSuccess();
});

// ==================== ФУНКЦІЇ ====================

// Ініціалізація початкових даних
function initHotelData() {
    if (!localStorage.getItem('hotelRooms')) {
        const rooms = [
            { id: 'lux', name: 'Люкс Suite', price: 5000, features: ['Велике двоспальне ліжко', 'Гідромасажна ванна', 'Вид на море'] },
            { id: 'junior', name: 'Напівлюкс', price: 3500, features: ['Двоспальне ліжко', 'Сучасний душ', 'Вид на місто'] },
            { id: 'standard', name: 'Стандарт', price: 2500, features: ['Два односпальні ліжка', 'Душова кабіна', 'Вид у двір'] }
        ];
        localStorage.setItem('hotelRooms', JSON.stringify(rooms));
    }
    
    if (!localStorage.getItem('hotelBookings')) {
        localStorage.setItem('hotelBookings', JSON.stringify([]));
    }
}

// Генерація унікального ID
function generateId() {
    return 'BK_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Збереження бронювання
function saveBooking(bookingData) {
    try {
        const bookings = getBookings();
        bookings.push(bookingData);
        localStorage.setItem('hotelBookings', JSON.stringify(bookings));
        
        // Оновити статистику
        updateStats();
        
        console.log('Бронювання збережено:', bookingData);
        return true;
    } catch (error) {
        console.error('Помилка збереження:', error);
        return false;
    }
}

// Отримати всі бронювання
function getBookings() {
    try {
        return JSON.parse(localStorage.getItem('hotelBookings')) || [];
    } catch {
        return [];
    }
}

// Оновити мінімальні дати в формі
function updateMinDates() {
    const today = new Date().toISOString().split('T')[0];
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    
    if (checkInInput) {
        checkInInput.min = today;
        // Автоматично заповнити завтрашню дату
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        checkInInput.value = tomorrow.toISOString().split('T')[0];
    }
    
    if (checkOutInput) {
        // Автоматично заповнити через 2 дні
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        checkOutInput.value = dayAfterTomorrow.toISOString().split('T')[0];
    }
}

// Показати деталі бронювання
function showBookingDetails(booking) {
    // Створюємо модальне вікно з деталями
    const modalContent = `
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>🎉 Бронювання підтверджено!</h2>
            
            <div class="booking-details">
                <h3>Деталі бронювання:</h3>
                <p><strong>Номер:</strong> ${booking.roomName}</p>
                <p><strong>ID бронювання:</strong> ${booking.id}</p>
                <p><strong>Гість:</strong> ${booking.name}</p>
                <p><strong>Заїзд:</strong> ${formatDate(booking.checkIn)}</p>
                <p><strong>Виїзд:</strong> ${formatDate(booking.checkOut)}</p>
                <p><strong>Тривалість:</strong> ${calculateNights(booking.checkIn, booking.checkOut)} ночі</p>
                <p><strong>Статус:</strong> <span class="status-confirmed">${booking.status}</span></p>
            </div>
            
            <div class="booking-actions">
                <button class="btn" onclick="printBooking('${booking.id}')">🖨️ Друк</button>
                <button class="btn" onclick="closeModal()">OK</button>
            </div>
            
            <div class="booking-note">
                <p>📧 Надіслано підтвердження на: ${booking.email}</p>
                <p>📞 Ми зв'яжемося з вами за телефоном: ${booking.phone}</p>
            </div>
        </div>
    `;
    
    // Оновлюємо модальне вікно
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.innerHTML = modalContent;
        modal.style.display = 'block';
    } else {
        // Якщо модального вікна немає, створюємо
        createModal(modalContent);
    }
}

// Форматування дати
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Розрахунок кількості ночей
function calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
}

// Оновлення статистики
function updateStats() {
    const bookings = getBookings();
    const stats = {
        totalBookings: bookings.length,
        lastUpdate: new Date().toISOString(),
        monthlyBookings: bookings.filter(b => {
            const bookingDate = new Date(b.createdAt);
            const now = new Date();
            return bookingDate.getMonth() === now.getMonth() &&
                   bookingDate.getFullYear() === now.getFullYear();
        }).length
    };
    
    localStorage.setItem('hotelStats', JSON.stringify(stats));
    return stats;
}

// Відображення всіх бронювань (для адмінки)
function displayAllBookings() {
    const bookings = getBookings();
    const container = document.querySelector('.bookings-list') || document.getElementById('bookingsContainer');
    
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-bookings">📭 Жодних бронювань поки немає</p>';
        return;
    }
    
    let html = `
        <div class="bookings-header">
            <h3>📋 Всі бронювання (${bookings.length})</h3>
            <button class="btn btn-small" onclick="exportBookings()">📥 Експорт</button>
        </div>
    `;
    
    bookings.forEach(booking => {
        html += `
            <div class="booking-item">
                <div class="booking-info">
                    <h4>${booking.roomName}</h4>
                    <p><strong>Гість:</strong> ${booking.name}</p>
                    <p><strong>Дата:</strong> ${formatDate(booking.checkIn)} → ${formatDate(booking.checkOut)}</p>
                    <p><strong>Контакт:</strong> ${booking.phone} / ${booking.email}</p>
                </div>
                <div class="booking-actions">
                    <span class="booking-id">ID: ${booking.id}</span>
                    <button class="btn btn-small" onclick="deleteBooking('${booking.id}')">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Видалення бронювання
function deleteBooking(bookingId) {
    if (confirm('Видалити це бронювання?')) {
        const bookings = getBookings();
        const updatedBookings = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem('hotelBookings', JSON.stringify(updatedBookings));
        displayAllBookings();
        updateStats();
    }
}

// Експорт бронювань у JSON
function exportBookings() {
    const bookings = getBookings();
    const dataStr = JSON.stringify(bookings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `bookings_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Друк бронювання
function printBooking(bookingId) {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) return;
    
    const printContent = `
        <html>
            <head>
                <title>Квитанція бронювання</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .details { margin: 20px 0; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Готель "Волинь"</h1>
                    <h2>Підтвердження бронювання</h2>
                </div>
                <div class="details">
                    <p><strong>ID бронювання:</strong> ${booking.id}</p>
                    <p><strong>Номер:</strong> ${booking.roomName}</p>
                    <p><strong>Гість:</strong> ${booking.name}</p>
                    <p><strong>Заїзд:</strong> ${formatDate(booking.checkIn)}</p>
                    <p><strong>Виїзд:</strong> ${formatDate(booking.checkOut)}</p>
                    <p><strong>Телефон:</strong> ${booking.phone}</p>
                    <p><strong>Email:</strong> ${booking.email}</p>
                    <p><strong>Дата бронювання:</strong> ${formatDate(booking.createdAt)}</p>
                </div>
                <div class="footer">
                    <p>Дякуємо за вибір нашого готелю!</p>
                    <p>Телефон для довідок: +38 (044) 123-45-67</p>
                </div>
            </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Перевірка URL на наявність успішного бронювання
function checkUrlForSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('booking') === 'success') {
        // Показати повідомлення про успіх
        alert('🎉 Ваше бронювання успішно створено!');
        // Видалити параметр з URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Закриття модального вікна
function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.style.display = 'none';
}

// Створення модального вікна (якщо не існує)
function createModal(content) {
    const modal = document.createElement('div');
    modal.id = 'successModal';
    modal.className = 'modal';
    modal.innerHTML = content;
    document.body.appendChild(modal);
}

// Закриття при кліку поза контентом
window.addEventListener('click', function(event) {
    const modal = document.getElementById('successModal');
    if (event.target === modal) {
        closeModal();
    }
});

// ==================== CSS для нових елементів ====================

// Додай цей CSS в кінець style.css
const additionalCSS = `
/* Модальне вікно з деталями */
.booking-details {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    margin: 20px 0;
    text-align: left;
}

.booking-details p {
    margin: 10px 0;
    font-size: 16px;
}

.status-confirmed {
    color: #28a745;
    font-weight: bold;
    background: #d4edda;
    padding: 2px 8px;
    border-radius: 4px;
}

.booking-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin: 20px 0;
}

.booking-note {
    background: #fff3cd;
    padding: 15px;
    border-radius: 8px;
    margin-top: 20px;
    font-size: 14px;
}

.booking-note p {
    margin: 5px 0;
}

/* Список бронювань */
.bookings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.booking-item {
    background: white;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.booking-info h4 {
    color: #1a2a6c;
    margin-bottom: 10px;
}

.booking-id {
    font-size: 12px;
    color: #666;
    font-family: monospace;
}

.btn-small {
    padding: 5px 10px !important;
    font-size: 14px !important;
}

.no-bookings {
    text-align: center;
    color: #666;
    font-size: 18px;
    padding: 40px;
}
`;

// Автоматично додати CSS
document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('#additional-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'additional-styles';
        styleElement.textContent = additionalCSS;
        document.head.appendChild(styleElement);
    }
});
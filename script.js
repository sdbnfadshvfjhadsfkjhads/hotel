// Обробка форми бронювання
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                roomType: document.getElementById('roomType').value,
                checkIn: document.getElementById('checkIn').value,
                checkOut: document.getElementById('checkOut').value,
                adults: document.getElementById('adults').value,
                children: document.getElementById('children').value,
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                specialRequests: document.getElementById('specialRequests').value
            };
            
            // Валідація дат
            const checkInDate = new Date(formData.checkIn);
            const checkOutDate = new Date(formData.checkOut);
            
            if (checkOutDate <= checkInDate) {
                alert('Дата виїзду повинна бути пізніше дати заїзду');
                return;
            }
            
            // Відправка на сервер
            try {
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    // Показати модальне вікно успіху
                    document.getElementById('successModal').style.display = 'block';
                    // Очистити форму
                    this.reset();
                } else {
                    alert('Помилка при бронюванні: ' + (result.error || 'Невідома помилка'));
                }
            } catch (error) {
                console.error('Помилка:', error);
                alert('Помилка з\'єднання з сервером');
            }
        });

        // Встановлення мінімальної дати як сьогодні
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('checkIn').min = today;
        document.getElementById('checkOut').min = today;

        // Оновлення мінімальної дати виїзду при зміні дати заїзду
        document.getElementById('checkIn').addEventListener('change', function() {
            document.getElementById('checkOut').min = this.value;
        });
    }
});

// Закриття модального вікна
function closeModal() {
    document.getElementById('successModal').style.display = 'none';
}

// Закриття модального вікна при кліку поза ним
window.addEventListener('click', function(event) {
    const modal = document.getElementById('successModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Додатково: функція для перевірки стану сервера
async function checkServerStatus() {
    try {
        const response = await fetch('/api/stats');
        if (response.ok) {
            console.log('✅ Сервер працює');
        }
    } catch (error) {
        console.log('⚠️ Сервер не доступний');
    }
}

// Перевірити сервер при завантаженні сторінки
window.addEventListener('load', checkServerStatus);
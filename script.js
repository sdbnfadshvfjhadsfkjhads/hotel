// Обробка форми бронювання
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
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
            
            // Показати модальне вікно успіху
            document.getElementById('successModal').style.display = 'block';
            
            // Очистити форму
            this.reset();
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
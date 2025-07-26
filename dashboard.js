// !!! QUAN TRỌNG: Dán URL Web App bạn đã sao chép ở Bước 2 vào đây
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbwdKxIiaT3YFDLDD6D5BkaAWgooaYlytD-EmG7ahn4/dev";

function showLoading(show) {
    document.getElementById('loading-spinner').style.display = show ? 'flex' : 'none';
}

async function loadRandomExercises() {
    showLoading(true);
    const display = document.getElementById('exercise-display');
    display.innerHTML = 'Đang tải bài tập...';

    try {
        // Gọi đến hàm doGet trong Apps Script
        const response = await fetch(`${BACKEND_URL}?action=getRandomExercises`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            display.innerHTML = ''; // Xóa thông báo đang tải
            result.data.forEach((exercise, index) => {
                const exerciseDiv = document.createElement('div');
                exerciseDiv.className = 'exercise-item';
                exerciseDiv.innerHTML = `
                    <h3>Bài tập ${index + 1} (của: ${exercise.studentId})</h3>
                    <p><strong>Loại:</strong> ${exercise.type}</p>
                    <p><strong>Câu hỏi:</strong> ${exercise.question}</p>
                    <details>
                        <summary>Xem lời giải của học sinh</summary>
                        <p>${exercise.solution || 'Chưa có lời giải'}</p>
                    </details>
                    <button onclick="loadRandomExercises()">Đổi bài khác</button>
                `;
                display.appendChild(exerciseDiv);
            });
        } else if (result.success && result.data.length === 0) {
            display.innerHTML = '<p>Chưa có bài tập nào được nộp.</p>';
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error("Lỗi khi tải bài tập:", error);
        display.innerHTML = `<p style="color: red;">Đã có lỗi xảy ra: ${error.message}</p>`;
    } finally {
        showLoading(false);
    }
}
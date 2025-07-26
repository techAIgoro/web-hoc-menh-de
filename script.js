// !!! QUAN TRỌNG: Dán URL Web App bạn đã sao chép ở Bước 2 vào đây
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbwdKxIiaT3YFDLDD6D5BkaAWgooaYlytD-EmG7ahn4/dev";

let learningPath = '';
let studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`; // Tạo ID học sinh tạm thời

// --- CÁC HÀM QUẢN LÝ GIAO DIỆN ---

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showLoading(show) {
    document.getElementById('loading-spinner').style.display = show ? 'flex' : 'none';
}

function startLearning(path) {
    learningPath = path;
    showScreen('learning-screen');
    const chatBox = document.getElementById('ai-chat-box');
    chatBox.innerHTML = ''; // Xóa tin nhắn cũ

    let initialPrompt = '';
    let title = '';

    if (path === 'discover') {
        title = "Chế độ Khám phá";
        initialPrompt = "Chào bạn, hãy bắt đầu nhé. Theo bạn, một 'mệnh đề' trong toán học là gì?";
    } else {
        title = "Chế độ Kể chuyện";
        initialPrompt = "Chào bạn! Để hiểu về mệnh đề, hãy tưởng tượng một câu chuyện nhé. Mệnh đề giống như một lời khẳng định chắc nịch, ví dụ như 'Bầu trời màu xanh'. Lời khẳng định này hoặc là đúng, hoặc là sai. Bạn có muốn nghe thêm về mệnh đề phủ định không?";
    }
    
    document.getElementById('learning-title').textContent = title;
    appendMessage(initialPrompt, 'ai-message');
}

function showExerciseSection() {
    showScreen('exercise-screen');
    generateExerciseFields();
}


// --- CÁC HÀM TƯƠNG TÁC ---

async function askAI(contextOverride = null, inputId = 'user-input') {
    const userInput = document.getElementById(inputId).value.trim();
    if (!userInput) return;

    appendMessage(userInput, 'user-message');
    document.getElementById(inputId).value = ''; // Xóa input
    showLoading(true);

    try {
        const context = contextOverride || learningPath;
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'askAI',
                prompt: userInput,
                context: context
            })
        });

        const result = await response.json();
        if (result.success) {
            appendMessage(result.data, 'ai-message');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error("Lỗi khi gọi AI:", error);
        appendMessage(`Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại. Lỗi: ${error.message}`, 'ai-message');
    } finally {
        showLoading(false);
    }
}

async function submitExercises() {
    showLoading(true);
    const data = {
        studentId: studentId,
        basicQ1: document.getElementById('basic-q-1').value,
        basicA1: document.getElementById('basic-a-1').value,
        basicQ2: document.getElementById('basic-q-2').value,
        basicA2: document.getElementById('basic-a-2').value,
        basicQ3: document.getElementById('basic-q-3').value,
        basicA3: document.getElementById('basic-a-3').value,
        advancedQ1: document.getElementById('advanced-q-1').value,
        advancedA1: document.getElementById('advanced-a-1').value,
        advancedQ2: document.getElementById('advanced-q-2').value,
        advancedA2: document.getElementById('advanced-a-2').value,
    };

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'submitExercises',
                data: data
            })
        });
        const result = await response.json();
        if (result.success) {
            alert(result.data); // Hiển thị thông báo "Nộp bài thành công!"
            showScreen('welcome-screen'); // Quay về màn hình chính
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error("Lỗi khi nộp bài:", error);
        alert(`Đã có lỗi xảy ra khi nộp bài: ${error.message}`);
    } finally {
        showLoading(false);
    }
}


// --- CÁC HÀM TIỆN ÍCH ---

function appendMessage(text, className) {
    const chatBox = document.getElementById('ai-chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${className}`;
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Tự động cuộn xuống
}

function generateExerciseFields() {
    const form = document.getElementById('exercise-form');
    form.innerHTML = ''; // Xóa các trường cũ

    const createField = (type, num) => {
        const idPrefix = `${type}-${num}`;
        return `
            <div class="exercise-item">
                <h3>Bài tập ${type === 'basic' ? 'Cơ bản' : 'Nâng cao'} ${num}</h3>
                <textarea id="${idPrefix}-q" placeholder="Nhập câu hỏi..."></textarea>
                <button onclick="checkWithAI('${idPrefix}-q', 'check_question')">Kiểm tra câu hỏi với AI</button>
                <br><br>
                <textarea id="${idPrefix}-a" placeholder="Nhập lời giải của bạn..."></textarea>
                <button onclick="checkWithAI('${idPrefix}-a', 'check_solution')">Kiểm tra lời giải với AI</button>
                <div id="ai-feedback-${idPrefix}" class="ai-message" style="margin-top: 10px;"></div>
            </div>
        `;
    };

    let content = '';
    for (let i = 1; i <= 3; i++) content += createField('basic', i);
    for (let i = 1; i <= 2; i++) content += createField('advanced', i);
    form.innerHTML = content;
}

// Hàm kiểm tra riêng cho các ô bài tập
async function checkWithAI(inputId, context) {
    const inputElement = document.getElementById(inputId);
    const feedbackElement = document.getElementById(`ai-feedback-${inputId.replace('-q', '').replace('-a', '')}`);
    const userInput = inputElement.value.trim();
    if (!userInput) return;
    
    feedbackElement.textContent = "AI đang suy nghĩ...";
    showLoading(true);

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'askAI', prompt: userInput, context: context })
        });
        const result = await response.json();
        if (result.success) {
            feedbackElement.textContent = result.data;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error("Lỗi khi gọi AI:", error);
        feedbackElement.textContent = `Lỗi: ${error.message}`;
    } finally {
        showLoading(false);
    }
}

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
    showScreen('welcome-screen');
});
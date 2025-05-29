// Variables globales
let currentScenario = '';
let currentQuestion = 0;
let score = 0;
let totalQuestions = 0;
let gameData = {};
let answered = false;

// Datos de los escenarios
const scenarios = {
    redaccion: {
        title: "Redacción Efectiva",
        brief: "Has recibido una solicitud para redactar un correo importante para un cliente potencial. <span class='mission-highlight'>Tu misión:</span> generar un correo profesional de 200 palabras para un cliente del sector tecnológico, enfatizando beneficios y solicitando reunión.",
        details: `
            <ul>
                <li><strong>Audiencia:</strong> CEO de empresa tecnológica mediana.</li>
                <li><strong>Extensión:</strong> exactamente 200 palabras.</li>
                <li><strong>Enfoque:</strong> beneficios y propuesta de reunión.</li>
                <li><strong>Estilo:</strong> profesional pero cercano, evitar jerga técnica.</li>
            </ul>
        `,
        questions: [
            {
                question: "¿Cuál prompt Zero-shot generará un correo profesional eficaz?",
                options: [
                    "Escribe un correo para un cliente.",
                    "Como especialista en comunicación corporativa, redacta un correo de 200 palabras para un CEO de empresa tecnológica, presentando nuestros servicios de consultoría digital, destacando 3 beneficios clave y solicitando una reunión. Tono profesional pero cercano, evitando jerga técnica.",
                    "Dame un email comercial genérico."
                ],
                correct: 1,
                explanation: "La opción B incluye todos los elementos críticos: audiencia específica, extensión exacta, objetivo claro, tono definido y restricciones. Aplica correctamente los principios de prompt engineering para redacción efectiva."
            },
            {
                question: "Para mejorar aún más el prompt, ¿qué técnica adicional sería más efectiva?",
                options: [
                    "Añadir más restricciones sobre el formato",
                    "Incluir un ejemplo de correo exitoso (Few-shot prompting)",
                    "Hacer el prompt más genérico"
                ],
                correct: 1,
                explanation: "El Few-shot prompting (incluir ejemplos) es una técnica poderosa que ayuda al modelo a entender mejor el formato y tono deseado, mejorando significativamente la calidad del output."
            }
        ]
    },
    analisis: {
        title: "Análisis de Datos",
        brief: "Te han entregado un archivo CSV con datos de ventas del último trimestre. <span class='mission-highlight'>Tu misión:</span> extraer insights clave sobre productos más rentables y tendencias por región, presentando resultados en formato ejecutivo.",
        details: `
            <ul>
                <li><strong>Contexto:</strong> Datos de ventas Q4 2024, 500+ registros.</li>
                <li><strong>Objetivo:</strong> identificar productos top y tendencias regionales.</li>
                <li><strong>Formato:</strong> resumen ejecutivo con tablas y conclusiones.</li>
                <li><strong>Profundidad:</strong> análisis detallado con justificaciones.</li>
            </ul>
        `,
        questions: [
            {
                question: "¿Cuál prompt generará un análisis de datos más efectivo?",
                options: [
                    "Analiza estos datos de ventas.",
                    "Revisa la información y dime qué ves.",
                    "Contexto: Datos de ventas Q4 2024 de empresa retail. Objetivo: identificar los 5 productos más rentables y tendencias por región. Métricas clave: ingresos, margen, unidades vendidas. Formato: resumen ejecutivo con tablas en markdown y 3 conclusiones accionables. Justifica cada insight con evidencia numérica."
                ],
                correct: 2,
                explanation: "La opción C sigue la estructura completa para análisis de datos: contexto específico, objetivo claro, métricas definidas, formato solicitado y nivel de razonamiento. Esto garantiza un análisis estructurado y accionable."
            },
            {
                question: "¿Qué elemento es más crítico para obtener insights accionables?",
                options: [
                    "Especificar el formato de salida detalladamente",
                    "Definir métricas específicas y pedir justificación con evidencia",
                    "Hacer preguntas muy generales"
                ],
                correct: 1,
                explanation: "Definir métricas específicas y pedir justificación con evidencia es fundamental para obtener insights accionables y confiables, no solo observaciones superficiales."
            }
        ]
    },
    creatividad: {
        title: "Creatividad e Ideas",
        brief: "Una startup de café necesita un naming innovador para su nueva línea de productos. <span class='mission-highlight'>Tu misión:</span> generar 5 nombres creativos que sugieran innovación, sean memorables y funcionen en redes sociales.",
        details: `
            <ul>
                <li><strong>Cliente:</strong> Cafetería boutique con métodos experimentales.</li>
                <li><strong>Ubicación:</strong> distrito histórico, clientela joven y sofisticada.</li>
                <li><strong>Restricciones:</strong> evitar clichés como 'bean', 'brew', 'cup'.</li>
                <li><strong>Entregable:</strong> 5 nombres con justificación y tagline.</li>
            </ul>
        `,
        questions: [
            {
                question: "¿Cuál prompt estimulará mejor la creatividad original?",
                options: [
                    "Dame nombres para una marca de café.",
                    "Necesito ideas creativas para una cafetería.",
                    "Actúa como director creativo especializado en naming disruptivo. Crea 5 nombres para cafetería boutique en distrito histórico, clientela joven sofisticada, métodos experimentales. Restricciones: evitar 'bean/brew/cup', funcionar en redes sociales, sugerir innovación+tradición. Para cada nombre: justificación breve y tagline memorable. Inspírate en elementos arquitectónicos históricos mezclados con ciencia gastronómica."
                ],
                correct: 2,
                explanation: "La opción C combina role prompting (director creativo), restricciones productivas, contexto multidimensional y estímulos creativos (arquitectura + ciencia). Incluye deliverables específicos y elementos inesperados que fuerzan conexiones originales."
            },
            {
                question: "¿Qué técnica de prompt engineering es más efectiva para generar ideas innovadoras?",
                options: [
                    "Dar instrucciones muy simples y directas",
                    "Combinar conceptos aparentemente no relacionados (Cross-domain inspiration)",
                    "Pedir muchas opciones sin contexto específico"
                ],
                correct: 1,
                explanation: "La inspiración cross-domain (combinar conceptos de diferentes campos) es una técnica poderosa para generar ideas verdaderamente innovadoras, forzando al modelo a crear conexiones únicas."
            }
        ]
    }
};

// Funciones de utilidad para animaciones
function addAnimationClass(element, animationClass, duration = 1000) {
    element.classList.add(animationClass);
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, duration);
}

function createConfetti() {
    const colors = ['#ff9800', '#1e88e5', '#4caf50', '#e91e63', '#9c27b0'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, 5000);
    }
}

function typeWriter(element, text, speed = 50) {
    element.innerHTML = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

function createSparkle(element) {
    const sparkle = document.createElement('div');
    sparkle.className = 'success-sparkle';
    sparkle.innerHTML = '✨';
    element.style.position = 'relative';
    element.appendChild(sparkle);
    
    setTimeout(() => {
        if (sparkle.parentNode) {
            sparkle.remove();
        }
    }, 1000);
}

// Funciones de navegación
function selectScenario(scenarioKey) {
    currentScenario = scenarioKey;
    gameData = scenarios[scenarioKey];
    totalQuestions = gameData.questions.length;
    currentQuestion = 0;
    score = 0;
    answered = false;
    
    showBriefScreen();
}

function showBriefScreen() {
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('brief-screen').classList.remove('hidden');
    
    // Actualizar contenido
    document.getElementById('brief-scenario-title').textContent = gameData.title;
    document.getElementById('breadcrumb-scenario').textContent = gameData.title;
    document.getElementById('brief-title').textContent = gameData.title;
    document.getElementById('brief-content').innerHTML = gameData.brief + gameData.details;
    
    // Agregar animaciones
    addAnimationClass(document.getElementById('brief-screen'), 'fade-in');
}

function startQuiz() {
    document.getElementById('brief-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    
    // Actualizar headers
    document.getElementById('quiz-scenario-title').textContent = gameData.title;
    document.getElementById('breadcrumb-quiz').textContent = gameData.title;
    
    loadQuestion();
    addAnimationClass(document.getElementById('quiz-screen'), 'fade-in');
}

function loadQuestion() {
    answered = false;
    const question = gameData.questions[currentQuestion];
    
    // Limpiar feedback anterior
    document.getElementById('feedback-container').innerHTML = '';
    
    // Actualizar texto de pregunta
    const questionElement = document.getElementById('question-text');
    questionElement.textContent = question.question;
    addAnimationClass(questionElement, 'slide-down');
    
    // Crear opciones
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.onclick = () => selectOption(index);
        
        const optionLetter = document.createElement('div');
        optionLetter.className = 'option-letter';
        optionLetter.textContent = String.fromCharCode(65 + index); // A, B, C
        
        const optionText = document.createElement('div');
        optionText.className = 'option-text';
        optionText.textContent = option;
        
        optionElement.appendChild(optionLetter);
        optionElement.appendChild(optionText);
        optionsContainer.appendChild(optionElement);
        
        // Animación escalonada
        setTimeout(() => {
            addAnimationClass(optionElement, 'slide-in-bottom');
        }, index * 200);
    });
    
    updateScoreDisplay();
}

function selectOption(selectedIndex) {
    if (answered) return;
    
    answered = true;
    const question = gameData.questions[currentQuestion];
    const options = document.querySelectorAll('.option');
    const isCorrect = selectedIndex === question.correct;
    
    // Marcar la opción seleccionada
    options[selectedIndex].classList.add('selected');
    
    if (isCorrect) {
        score++;
        options[selectedIndex].classList.add('correct');
        createSparkle(options[selectedIndex]);
        createConfetti();
    } else {
        options[selectedIndex].classList.add('incorrect');
        options[question.correct].classList.add('correct');
        addAnimationClass(options[selectedIndex], 'shake');
    }
    
    // Mostrar explicación
    showFeedback(question.explanation, isCorrect);
    
    // Continuar después de 3 segundos
    setTimeout(() => {
        nextQuestion();
    }, 3000);
}

function showFeedback(explanation, isCorrect) {
    const feedbackContainer = document.getElementById('feedback-container');
    const feedback = document.createElement('div');
    feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedback.innerHTML = `
        <h4>${isCorrect ? '¡Correcto!' : 'Incorrecto'}</h4>
        <p>${explanation}</p>
    `;
    
    feedbackContainer.innerHTML = '';
    feedbackContainer.appendChild(feedback);
    addAnimationClass(feedback, 'slide-in-bottom');
}

function nextQuestion() {
    currentQuestion++;
    
    if (currentQuestion < totalQuestions) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    const percentage = Math.round((score / totalQuestions) * 100);
    let message = '';
    let emoji = '';
    
    if (percentage >= 90) {
        message = '¡Excelente! Dominas el Prompt Engineering';
        emoji = '🏆';
    } else if (percentage >= 70) {
        message = '¡Bien hecho! Tienes una buena comprensión';
        emoji = '🎉';
    } else if (percentage >= 50) {
        message = 'Progreso aceptable. Sigue practicando';
        emoji = '📚';
    } else {
        message = 'Necesitas más práctica. ¡No te rindas!';
        emoji = '💪';
    }
    
    const resultsHTML = `
        <div class="results-container bounce-in">
            <div class="final-score">${emoji} ${score}/${totalQuestions}</div>
            <div class="performance-message">${message}</div>
            <div style="margin-bottom: 20px;">
                <strong>Puntuación: ${percentage}%</strong>
            </div>
            <button class="restart-btn" onclick="goHome()">Elegir Otro Escenario</button>
            <button class="restart-btn" onclick="restartCurrentScenario()">Repetir Este Escenario</button>
        </div>
    `;
    
    document.getElementById('quiz-screen').innerHTML = `
        <div class="header">
            <h1 class="slide-down">¡Escenario Completado!</h1>
        </div>
        <div class="container">
            <div class="game-content">
                ${resultsHTML}
            </div>
        </div>
    `;
    
    createConfetti();
}

function updateScoreDisplay() {
    const scoreContainer = document.getElementById('score-container');
    const progress = Math.round((currentQuestion / totalQuestions) * 100);
    
    scoreContainer.innerHTML = `
        <div class="score-display">
            <h3>Pregunta ${currentQuestion + 1} de ${totalQuestions}</h3>
            <p>Puntuación Actual: ${score}/${currentQuestion > 0 ? currentQuestion : 1}</p>
            <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; margin-top: 10px;">
                <div style="background: white; height: 100%; width: ${progress}%; border-radius: 4px; transition: width 0.3s ease;"></div>
            </div>
        </div>
    `;
}

function goHome() {
    document.getElementById('brief-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    
    // Reset variables
    currentScenario = '';
    currentQuestion = 0;
    score = 0;
    totalQuestions = 0;
    answered = false;
    
    addAnimationClass(document.getElementById('home-screen'), 'fade-in');
}

function goToBrief() {
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('brief-screen').classList.remove('hidden');
    addAnimationClass(document.getElementById('brief-screen'), 'fade-in');
}

function restartCurrentScenario() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    startQuiz();
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Agregar eventos de teclado para navegación
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            goHome();
        }
    });
    
    // Efectos visuales adicionales
    const header = document.querySelector('.header');
    if (header) {
        header.addEventListener('mousemove', function(e) {
            const rect = header.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            header.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.1) 0%, transparent 50%), linear-gradient(135deg, #1e88e5, #1565c0)`;
        });
    }
    
    console.log('🚀 Prompt Engineering Challenge iniciado correctamente');
});
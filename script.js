document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. ENGINE DE ANIMACIÓN POR SCROLL (REVEAL)
    // ==========================================
    const elementosReveal = document.querySelectorAll('.reveal');
    const opcionesObserver = { root: null, threshold: 0.02, rootMargin: "0px 0px -20px 0px" };

    const arrancarEfecto = new IntersectionObserver((entradas, observador) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('active');
                observador.unobserve(entrada.target);
            }
        });
    }, opcionesObserver);

    elementosReveal.forEach(elemento => arrancarEfecto.observe(elemento));

    // =================================================================
    // 🚀 ENGINE DE REVEAL TIPOGRÁFICO SINCRO: KINETIC CHARACTER STAGGER
    // =================================================================
    const tituloNodo = document.getElementById('animar-titulo');
    if (tituloNodo) {
        const textoOriginal = tituloNodo.innerText.trim();
        tituloNodo.innerHTML = ''; 

        for (let i = 0; i < textoOriginal.length; i++) {
            const char = textoOriginal[i];
            const span = document.createElement('span');
            
            if (char === ' ') {
                span.classList.add('espacio-letra');
                span.innerHTML = '&nbsp;';
            } else {
                span.innerText = char;
            }
            
            span.style.animationDelay = `${i * 0.05}s`;
            tituloNodo.appendChild(span);
        }
    }

    // =================================================================
    // 🔄 LÓGICA DEL SIMULADOR ANTES/DESPUÉS CON CAPAS MÁSCARA CLIP-PATH
    // =================================================================
    const sliderContainer = document.getElementById('parallax-slider');
    const beforeLayer = document.getElementById('before-layer');
    const sliderHandle = document.getElementById('slider-handle');

    if (sliderContainer && beforeLayer && sliderHandle) {
        const moverSlider = (clientX) => {
            const rect = sliderContainer.getBoundingClientRect();
            const posicionX = clientX - rect.left;
            let porcentaje = (posicionX / rect.width) * 100;

            // Bloqueamos bordes físicos del lienzo
            if (porcentaje < 0) porcentaje = 0;
            if (porcentaje > 100) porcentaje = 100;

            // Movemos la aguja central de control
            sliderHandle.style.left = `${porcentaje}%`;

            // Máscara matemática exacta: Recorta el "Antes" para revelar el fondo
            const clipRight = 100 - porcentaje;
            beforeLayer.style.clipPath = `inset(0 ${clipRight}% 0 0)`;
            beforeLayer.style.webkitClipPath = `inset(0 ${clipRight}% 0 0)`;
        };

        // Evento Escritorio
        sliderContainer.addEventListener('mousemove', (e) => {
            moverSlider(e.clientX);
        });

        // Evento Celulares
        sliderContainer.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                e.preventDefault(); 
                moverSlider(e.touches[0].clientX);
            }
        }, { passive: false });
    }

    // ==========================================
    // 3. LÓGICA DEL ACCORDION DE PREGUNTAS (FAQ)
    // ==========================================
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const answer = question.nextElementSibling;

            if (item.classList.contains('open')) {
                answer.style.maxHeight = null;
                item.classList.remove('open');
            } else {
                document.querySelectorAll('.faq-item.open').forEach(openItem => {
                    openItem.querySelector('.faq-answer').style.maxHeight = null;
                    openItem.classList.remove('open');
                });

                answer.style.maxHeight = answer.scrollHeight + "px";
                item.classList.add('open');
            }
        });
    });

    // ==========================================
    // 4. LÓGICA DEL QUIZ DE LOOK PERSONALIZADO
    // ==========================================
    const pasosQuiz = document.querySelectorAll('.quiz-step');
    let respuestasQuiz = {};

    pasosQuiz.forEach(paso => {
        const botones = paso.querySelectorAll('.btn-quiz-opt');
        botones.forEach(btn => {
            btn.addEventListener('click', () => {
                const pasoActual = parseInt(paso.getAttribute('data-step'));
                const valorSeleccionado = btn.getAttribute('data-value');
                
                if (pasoActual === 1) respuestasQuiz.efecto = valorSeleccionado;
                if (pasoActual === 2) respuestasQuiz.enfoque = valorSeleccionado;
                if (pasoActual === 3) respuestasQuiz.prioridad = valorSeleccionado;

                paso.classList.remove('active');
                
                const siguientePaso = document.querySelector(`[data-step="${pasoActual + 1}"]`);
                if (siguientePaso) {
                    siguientePaso.classList.add('active');
                } else {
                    const resultadoBox = document.getElementById('quiz-resultado');
                    const resultadoTexto = document.getElementById('resultado-texto');
                    resultadoBox.classList.add('active');

                    if (respuestasQuiz.efecto === 'natural' && respuestasQuiz.enfoque === 'pestanas') {
                        resultadoTexto.innerText = "Lash Lifting ✨";
                        respuestasQuiz.matchVal = "Lash Lifting ($300)";
                    } else if (respuestasQuiz.efecto === 'rimel') {
                        resultadoTexto.innerText = "Extensiones Efecto Máscara 🖤";
                        respuestasQuiz.matchVal = "Efecto Máscara ($500)";
                    } else if (respuestasQuiz.efecto === 'volumen' && respuestasQuiz.enfoque === 'cejas') {
                        resultadoTexto.innerText = "Cejas 4K (Lamination + Henna) 👑";
                        respuestasQuiz.matchVal = "Cejas 4K ($400)";
                    } else if (respuestasQuiz.enfoque === 'todo') {
                        resultadoTexto.innerText = "Ritual Magic (Lashes + Brows) 🧚‍♀️";
                        respuestasQuiz.matchVal = "Combo Magic ($500)";
                    } else {
                        resultadoTexto.innerText = "Teddy Lashes 🌸";
                        respuestasQuiz.matchVal = "Teddy Lashes ($500)";
                    }
                }
            });
        });
    });

    document.getElementById('btn-aplicar-quiz')?.addEventListener('click', () => {
        const selectServicio = document.getElementById('servicio');
        if (selectServicio && respuestasQuiz.matchVal) {
            selectServicio.value = respuestasQuiz.matchVal;
            selectServicio.dispatchEvent(new Event('change'));
            document.getElementById('agendar').scrollIntoView({ behavior: 'smooth' });
        }
    });

    // ==========================================
    // 5. RECOMENDADOR DINÁMICO DE TIPS
    // ==========================================
    const selectServicio = document.getElementById('servicio');
    const tipBox = document.getElementById('smart-tip-box');
    const tipText = document.getElementById('smart-tip-text');

    const tipsCuidados = {
        "Lash Lifting ($300)": "Para el Lash Lifting, acudir con tus pestañas totalmente limpias y sin rímel agiliza el proceso.",
        "Extensiones Clásicas ($500)": "Evita aplicar productos oleosos o rímel en los ojos 24 horas antes para garantizar la máxima retención del set.",
        "Volumen Hawaiano ($430)": "¡Una gran elección! Agenda tus retoques entre los 15 y 18 días para mantener tu mirada densa y perfecta.",
        "Teddy Lashes ($500)": "Al elegir Teddy Lashes color café, recuerda que los retoques sugeridos son entre los 15 y 18 días ($350) para mantener ese volumen sutil e impecable.",
        "Efecto Máscara ($500)": "Este diseño aporta un fondo oscuro genial. Recuerda no mojar tus ojos durante las primeras 24 horas de la aplicación.",
        "Cejas 4K ($400)": "Evita desmaquillantes bifásicos o exfoliantes sobre la ceja para prolongar el sombreado de la henna orgánica.",
        "Combo Magic ($500)": "Al ser un servicio de aplicación simultánea doble, optimizamos tu tiempo al máximo. ¡Ven lista para relajarte!"
    };

    selectServicio?.addEventListener('change', (e) => {
        const servicio = e.target.value;
        if (tipsCuidados[servicio]) {
            tipText.innerText = tipsCuidados[servicio];
            tipBox.classList.remove('hidden');
        } else {
            tipText.innerText = "Recuerda que para cuidar los resultados debes evitar consumir cafeína el día de tu cita.";
            tipBox.classList.remove('hidden');
        }
    });

    // ==========================================
    // 6. ENVIAR FORMULARIO A WHATSAPP
    // ==========================================
    document.getElementById('formulario-cita')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const numeroWhatsAppSariStudio = "527226899514"; 

        const nombreCliente = document.getElementById('nombre').value.trim();
        const whatsappCliente = document.getElementById('whatsapp').value.trim();
        const servicioSeleccionado = document.getElementById('servicio').value;
        const fechaCita = document.getElementById('fecha').value;
        const horaCita = document.getElementById('hora').value;

        const fechaLimpia = fechaCita.split('-').reverse().join('/');

        const textoMensaje = 
            `✨ *NUEVA SOLICITUD DE CITA* ✨%0A%0A` +
            `👤 *Cliente:* ${nombreCliente}%0A` +
            `📱 *WhatsApp:* ${whatsappCliente}%0A` +
            `💆‍♀️ *Servicio:* ${servicioSeleccionado}%0A` +
            `📅 *Fecha:* ${fechaLimpia}%0A` +
            `⏰ *Hora:* ${horaCita} hrs%0A%0A` +
            `_Quedo a la espera de tu confirmación para agendar and realizar el anticipo._`;

        window.open(`https://wa.me/${numeroWhatsAppSariStudio}?text=${textoMensaje}`, '_blank');
    });
});

// ==========================================
// 7. FUNCIÓN GLOBAL NAVEGACIÓN DE TABS
// ==========================================
function openCategory(evt, categoryName) {
    const tabcontents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontents.length; i++) {
        tabcontents[i].classList.remove("active-content");
    }

    const tablinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    document.getElementById(categoryName).classList.add("active-content");
    evt.currentTarget.classList.add("active");
}
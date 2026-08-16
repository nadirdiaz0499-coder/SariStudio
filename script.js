document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 0. BANNER DE AVISO: precios vigentes solo hasta septiembre
    // ==========================================
    const bannerPrecios = document.getElementById('banner-precios');
    const cerrarBannerBtn = document.getElementById('cerrar-banner-precios');
    let alturaBannerPx = 0;
    let tickProgramado = false;

    // El header es "fixed", así que su offset no se ajusta solo con el scroll
    // (a diferencia de un elemento "sticky"). Simulamos ese comportamiento:
    // el offset del header baja 1 a 1 con el scroll hasta llegar a 0, en vez
    // de quedarse fijo a la altura original del banner para siempre.
    const actualizarOffsetHeader = () => {
        tickProgramado = false;
        const scrollActual = window.scrollY || window.pageYOffset;
        const offset = Math.max(0, alturaBannerPx - scrollActual);
        document.documentElement.style.setProperty('--banner-height', `${offset}px`);
    };

    const pedirActualizarOffset = () => {
        if (!tickProgramado) {
            tickProgramado = true;
            requestAnimationFrame(actualizarOffsetHeader);
        }
    };

    const medirAlturaBanner = () => {
        if (!bannerPrecios) return;
        alturaBannerPx = bannerPrecios.offsetParent !== null ? bannerPrecios.offsetHeight : 0;
        actualizarOffsetHeader();
    };

    if (bannerPrecios) {
        // Se recuerda solo durante la sesión del navegador: si lo cierran, no vuelve
        // a aparecer mientras sigan navegando, pero si regresan otro día sí lo verán de nuevo
        if (sessionStorage.getItem('bannerPreciosCerrado') === 'true') {
            bannerPrecios.style.display = 'none';
        }

        medirAlturaBanner();
        window.addEventListener('resize', medirAlturaBanner);
        window.addEventListener('scroll', pedirActualizarOffset, { passive: true });

        cerrarBannerBtn?.addEventListener('click', () => {
            bannerPrecios.style.display = 'none';
            medirAlturaBanner();
            sessionStorage.setItem('bannerPreciosCerrado', 'true');
        });
    }

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
        // Cacheamos el rect del contenedor y solo lo recalculamos cuando
        // realmente puede haber cambiado (al iniciar el movimiento o al
        // redimensionar), en vez de en cada evento de mouse/touch.
        let rectCache = sliderContainer.getBoundingClientRect();
        let clientXPendiente = null;
        let frameProgramado = false;

        const actualizarRect = () => {
            rectCache = sliderContainer.getBoundingClientRect();
        };
        window.addEventListener('resize', actualizarRect);

        const aplicarPosicion = () => {
            frameProgramado = false;
            const posicionX = clientXPendiente - rectCache.left;
            let porcentaje = (posicionX / rectCache.width) * 100;

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

        // En vez de recalcular y pintar en cada evento (que puede disparar
        // decenas de veces por segundo), guardamos la última posición y
        // solo pintamos una vez por frame con requestAnimationFrame.
        const moverSlider = (clientX) => {
            clientXPendiente = clientX;
            if (!frameProgramado) {
                frameProgramado = true;
                requestAnimationFrame(aplicarPosicion);
            }
        };

        // Evento Escritorio
        sliderContainer.addEventListener('mousemove', (e) => {
            moverSlider(e.clientX);
        }, { passive: true });

        // Al entrar con el mouse, refrescamos el rect por si hubo scroll/resize
        sliderContainer.addEventListener('mouseenter', actualizarRect);

        // Evento Celulares
        sliderContainer.addEventListener('touchstart', actualizarRect, { passive: true });
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
    // 5.5 RESTRICCIÓN DE HORARIOS (Lun-Vie 9:00-18:30, Sáb 9:00-14:30, Dom cerrado)
    // ==========================================
    const inputFecha = document.getElementById('fecha');
    const selectHora = document.getElementById('hora');
    const fechaPlaceholderTexto = document.getElementById('fecha-placeholder-texto');
    // Solo iOS (Safari) no dibuja ningún texto nativo en el input de fecha vacío;
    // Chrome/Edge/Firefox en escritorio y Android SÍ muestran su propio "mm/dd/aaaa",
    // así que ahí no debemos mostrar nuestro texto o se encima con el nativo
    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Oculta/muestra el texto de ayuda "Selecciona una fecha" según si el campo ya tiene valor
    const actualizarPlaceholderFecha = () => {
        if (!fechaPlaceholderTexto) return;
        fechaPlaceholderTexto.style.display = (esIOS && !inputFecha.value) ? 'block' : 'none';
    };
    if (inputFecha) {
        actualizarPlaceholderFecha();
        // Solo "change" (se dispara al confirmar la fecha), no "input" (se dispara
        // en cada giro de la rueda del selector en iOS, antes de confirmar)
        inputFecha.addEventListener('change', actualizarPlaceholderFecha);
    }

    if (inputFecha && selectHora) {
        const fechaErrorTexto = document.getElementById('fecha-error-texto');

        // Guardamos las opciones de hora originales (rango completo Lun-Vie 9:00-18:30)
        const opcionesHoraOriginales = Array.from(selectHora.options).map(opt => ({
            value: opt.value,
            texto: opt.textContent
        }));

        const repintarOpcionesHora = (opciones) => {
            selectHora.innerHTML = '';
            opciones.forEach(opt => {
                const nuevaOpcion = document.createElement('option');
                nuevaOpcion.value = opt.value;
                nuevaOpcion.textContent = opt.texto;
                if (opt.value === '') {
                    nuevaOpcion.disabled = true;
                    nuevaOpcion.selected = true;
                }
                selectHora.appendChild(nuevaOpcion);
            });
        };

        const mostrarErrorFecha = (mostrar) => {
            if (!fechaErrorTexto) return;
            fechaErrorTexto.textContent = mostrar
                ? 'Los domingos el estudio permanece cerrado. Elige un día de lunes a sábado ✨'
                : '';
            fechaErrorTexto.classList.toggle('visible', mostrar);
        };

        const validarYFiltrarFecha = () => {
            if (!inputFecha.value) { mostrarErrorFecha(false); return true; }

            // Parseamos "YYYY-MM-DD" manualmente para evitar corrimientos de zona horaria
            const [anio, mes, dia] = inputFecha.value.split('-').map(Number);
            const fechaSeleccionada = new Date(anio, mes - 1, dia);
            const diaSemana = fechaSeleccionada.getDay(); // 0 = Domingo ... 6 = Sábado

            if (diaSemana === 0) {
                // Aviso NO bloqueante: en iOS el alert() se disparaba de inmediato porque
                // el selector nativo arranca mostrando el día de hoy antes de que el usuario
                // toque nada, y el alert() congelaba la pantalla impidiendo elegir otra fecha
                mostrarErrorFecha(true);
                inputFecha.value = '';
                actualizarPlaceholderFecha();
                repintarOpcionesHora(opcionesHoraOriginales);
                return false;
            }

            mostrarErrorFecha(false);

            // Sábado cierra a las 14:30, el resto de la semana (Lun-Vie) a las 18:30
            const horaLimite = diaSemana === 6 ? '14:30' : '18:30';
            const opcionesFiltradas = opcionesHoraOriginales.filter(opt => opt.value === '' || opt.value <= horaLimite);
            repintarOpcionesHora(opcionesFiltradas);
            return true;
        };

        // Solo "change": se dispara hasta que el usuario confirma la fecha, no
        // mientras aún está girando la rueda del selector (evita interrumpirlo a medias)
        inputFecha.addEventListener('change', validarYFiltrarFecha);
    }

    // ==========================================
    // 6. ENVIAR FORMULARIO A WHATSAPP
    // ==========================================
    document.getElementById('formulario-cita')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const numeroWhatsAppSariStudio = "527224173650"; 

        const nombreCliente = document.getElementById('nombre').value.trim();
        const whatsappCliente = document.getElementById('whatsapp').value.trim();
        const servicioSeleccionado = document.getElementById('servicio').value;
        const fechaCita = document.getElementById('fecha').value;
        const horaCita = document.getElementById('hora').value;

        // Candado de seguridad: si por alguna razón la fecha llegó siendo domingo, no dejamos enviar
        if (fechaCita) {
            const [anioChk, mesChk, diaChk] = fechaCita.split('-').map(Number);
            if (new Date(anioChk, mesChk - 1, diaChk).getDay() === 0) {
                const fechaErrorTexto = document.getElementById('fecha-error-texto');
                if (fechaErrorTexto) {
                    fechaErrorTexto.textContent = 'Los domingos el estudio permanece cerrado. Elige un día de lunes a sábado ✨';
                    fechaErrorTexto.classList.add('visible');
                }
                document.getElementById('fecha')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
        }

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
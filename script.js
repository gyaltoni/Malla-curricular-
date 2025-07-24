const mensajeInformativo = document.getElementById('mensaje-informativo');
let timeoutId = null;

function toggleAprobado(element) {
    // 1. Revisa si el ramo está bloqueado
    if (element.classList.contains('bloqueado')) {
        mostrarMensajeBloqueado(element);
        return; // Detiene la función si está bloqueado
    }

    const yaEstabaAprobado = element.classList.contains("aprobado");
    element.classList.toggle("aprobado");

    if (!yaEstabaAprobado) {
        mostrarFelicitacion();
        animacionPop(element);
    }

    // 2. Actualiza el estado de todos los ramos y luego guarda
    actualizarEstadoRamos();
}

function mostrarFelicitacion() {
    mensajeInformativo.textContent = "✨ ¡Felicidades Antonia, eres la mejor! ✨";
    mensajeInformativo.className = 'mensaje-informativo visible felicitacion'; // Clase para estilo verde

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        mensajeInformativo.classList.remove('visible');
    }, 3000);
}

function mostrarMensajeBloqueado(element) {
    const requisitos = element.dataset.requisitos.split(',');
    const nombresRequisitos = [];

    requisitos.forEach(reqId => {
        const reqElemento = document.querySelector(`[data-id='${reqId}']`);
        // Solo muestra como faltante si el ramo existe y NO está aprobado
        if (reqElemento && !reqElemento.classList.contains('aprobado')) {
            nombresRequisitos.push(`"${reqElemento.textContent}"`);
        }
    });
    
    if (nombresRequisitos.length > 0) {
        mensajeInformativo.textContent = `❌ Requiere aprobar: ${nombresRequisitos.join(', ')}`;
        mensajeInformativo.className = 'mensaje-informativo visible error'; // Clase para estilo rojo

        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            mensajeInformativo.classList.remove('visible');
        }, 4000);
    }
}

function animacionPop(element) {
    element.style.animation = 'pop 0.25s ease';
    element.addEventListener('animationend', () => {
        element.style.animation = '';
    }, { once: true });
}

function actualizarEstadoRamos() {
    const todosLosRamos = document.querySelectorAll('.ramo');

    todosLosRamos.forEach(ramo => {
        const requisitos = ramo.dataset.requisitos;
        if (!requisitos) return; // Si no tiene requisitos, no hace nada.

        const listaRequisitos = requisitos.split(',');
        let todosCumplidos = true;

        for (const reqId of listaRequisitos) {
            const reqElemento = document.querySelector(`[data-id='${reqId}']`);
            if (!reqElemento || !reqElemento.classList.contains('aprobado')) {
                todosCumplidos = false;
                break;
            }
        }

        if (todosCumplidos) {
            ramo.classList.remove('bloqueado');
        } else {
            ramo.classList.add('bloqueado');
            // Si se bloquea, también debe quitarse el estado 'aprobado' por si acaso
            ramo.classList.remove('aprobado');
        }
    });

    // Guardar el estado después de cada actualización
    guardarEstado();
}


function guardarEstado() {
    const estados = Array.from(document.querySelectorAll('.ramo')).map(div => ({
        id: div.dataset.id,
        aprobado: div.classList.contains('aprobado')
    }));
    localStorage.setItem('estadoRamosAntonia', JSON.stringify(estados));
}

function cargarEstado() {
    const estados = JSON.parse(localStorage.getItem('estadoRamosAntonia') || '[]');
    if (estados.length === 0) {
        actualizarEstadoRamos(); // Si no hay nada guardado, corre la comprobación inicial
        return;
    }

    estados.forEach(estado => {
        const ramo = document.querySelector(`[data-id='${estado.id}']`);
        if (ramo && estado.aprobado) {
            ramo.classList.add('aprobado');
        }
    });

    // Después de cargar los aprobados, actualiza los bloqueados
    actualizarEstadoRamos();
}

cargarEstado();

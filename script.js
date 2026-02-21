// ---------- ESTADO GLOBAL ----------
let etapaActual = 1;
const totalEtapas = 8;
let respuestas = {
    especie: null,
    genero: null,
    peso: null,
    edad: null,
    raza: '',
    estadoFisico: '',
    procedimiento: null,
    remitido: null,
    veterinario: '',
    propietario: '',
    email: '',
    telefono: '',
    nombreMascota: '',
    formaPago: null
};
let precioCalculado = 0;

// ---------- PRECIOS (MODIFICA AQUÍ) ----------
const PRECIOS = {
    esterilizacion: {
        perro: {
            macho: { '<5': 120, '5-15': 150, '15-30': 180, '>30': 210 },
            hembra: { '<5': 150, '5-15': 180, '15-30': 210, '>30': 240 }
        },
        gato: {
            macho: { '<5': 80, '5-15': 100, '15-30': 130, '>30': 160 },
            hembra: { '<5': 100, '5-15': 120, '15-30': 150, '>30': 180 }
        },
        exotico: { base: 200 }
    },
    profilaxis: {
        perro: { base: 200, suplementoPeso: { '<5': 1, '5-15': 1.1, '15-30': 1.2, '>30': 1.3 } },
        gato: { base: 150 },
        exotico: { base: 250 }
    },
    vacunacion: {
        perro: { base: 50 },
        gato: { base: 45 },
        exotico: { base: 80 }
    },
    tumores: {
        perro: { base: 300, suplementoRaza: 1.5 },
        gato: { base: 250 },
        exotico: { base: 350 }
    },
    calculos: {
        perro: { base: 280 },
        gato: { base: 220 },
        exotico: { base: 320 }
    },
    otros: {
        perro: { base: 150 },
        gato: { base: 130 },
        exotico: { base: 200 }
    },
    razasEspeciales: {
        'bulldog': 1.5,
        'pug': 1.4,
        'carlino': 1.4,
        'persa': 1.2,
        'boxer': 1.3,
        'shih tzu': 1.2
    }
};

// Función para calcular precio
function calcularPrecio() {
    const { especie, genero, peso, procedimiento, raza } = respuestas;
    if (!especie || !genero || !peso || !procedimiento) return 0;

    let precio = 0;
    const proc = procedimiento.toLowerCase();
    const procData = PRECIOS[proc];

    if (!procData) return 0;

    if (especie === 'perro' || especie === 'gato') {
        if (proc === 'esterilizacion') {
            precio = procData[especie][genero][peso] || 0;
        } else {
            const base = procData[especie]?.base || 0;
            let suplemento = 1;
            if (procData[especie]?.suplementoPeso && procData[especie].suplementoPeso[peso]) {
                suplemento = procData[especie].suplementoPeso[peso];
            }
            precio = base * suplemento;
        }
    } else {
        precio = procData.exotico?.base || 200;
    }

    if (raza) {
        const razaLower = raza.toLowerCase();
        for (let [razaClave, multi] of Object.entries(PRECIOS.razasEspeciales)) {
            if (razaLower.includes(razaClave)) {
                precio *= multi;
                break;
            }
        }
    }

    return Math.round(precio);
}

// ---------- ELEMENTOS DOM ----------
const stages = document.querySelectorAll('.pregunta-stage');
const steps = document.querySelectorAll('.step');
const progressFill = document.getElementById('progress-fill');
const sections = {
    preguntas: document.getElementById('preguntas-section'),
    datos: document.getElementById('datos-section'),
    confirmacion: document.getElementById('confirmacion-section')
};

// ---------- FUNCIONES DE NAVEGACIÓN ----------
function irAEtapa(numero) {
    stages.forEach(s => s.style.display = 'none');
    document.getElementById(`stage-${numero}`).style.display = 'block';
    
    steps.forEach((step, idx) => {
        if (idx + 1 <= numero) step.classList.add('active');
        else step.classList.remove('active');
    });
    
    const progreso = ((numero - 1) / (totalEtapas - 1)) * 100;
    progressFill.style.width = `${progreso}%`;
    etapaActual = numero;
}

function siguienteEtapa() {
    if (etapaActual < totalEtapas) {
        irAEtapa(etapaActual + 1);
    } else {
        sections.preguntas.classList.remove('active');
        sections.datos.classList.add('active');
        actualizarPrecioMostrado();
    }
}

function actualizarPrecioMostrado() {
    precioCalculado = calcularPrecio();
    document.getElementById('valor-precio').textContent = precioCalculado + '€';
}

// ---------- MANEJAR SELECCIÓN DE OPCIONES ----------
document.querySelectorAll('.opcion').forEach(op => {
    op.addEventListener('click', function(e) {
        if (this.id === 'confirmar-edad' || this.id === 'confirmar-raza' || this.id === 'confirmar-estado' || this.id === 'confirmar-remitido') return;

        const padre = this.closest('.pregunta-stage');
        const stageId = padre.id;
        const valor = this.dataset.valor;

        const siblings = this.parentElement.children;
        Array.from(siblings).forEach(s => s.classList.remove('selected'));
        this.classList.add('selected');

        if (stageId === 'stage-1') respuestas.especie = valor;
        if (stageId === 'stage-2') respuestas.genero = valor;
        if (stageId === 'stage-3') respuestas.peso = valor;
        if (stageId === 'stage-7') respuestas.procedimiento = valor;
        if (stageId === 'stage-8') {
            respuestas.remitido = valor;
            if (valor === 'si') {
                document.getElementById('campo-remitido').style.display = 'block';
            } else {
                document.getElementById('campo-remitido').style.display = 'none';
                respuestas.veterinario = '';
            }
        }

        this.style.transform = 'scale(0.98)';
        setTimeout(() => this.style.transform = 'scale(1)', 150);

        setTimeout(() => {
            if (etapaActual < totalEtapas) {
                siguienteEtapa();
            } else {
                if (stageId === 'stage-8' && valor === 'no') {
                    siguienteEtapa();
                }
            }
        }, 800);
    });
});

document.getElementById('confirmar-edad')?.addEventListener('click', function() {
    const edad = document.getElementById('edad-input').value;
    if (edad) {
        respuestas.edad = edad;
        siguienteEtapa();
    }
});

document.getElementById('confirmar-raza')?.addEventListener('click', function() {
    const raza = document.getElementById('raza-input').value.trim();
    if (raza) {
        respuestas.raza = raza;
        siguienteEtapa();
    }
});

document.getElementById('confirmar-estado')?.addEventListener('click', function() {
    const estado = document.getElementById('estado-input').value.trim();
    respuestas.estadoFisico = estado || 'Ninguno';
    siguienteEtapa();
});

document.getElementById('confirmar-remitido')?.addEventListener('click', function() {
    const vet = document.getElementById('veterinario-input').value.trim();
    if (vet) {
        respuestas.veterinario = vet;
        siguienteEtapa();
    }
});

// ---------- FORMULARIO DE DATOS (MODIFICADO PARA WEBHOOK) ----------
document.getElementById('formulario-datos').addEventListener('submit', async function(e) {
    e.preventDefault();

    respuestas.propietario = document.getElementById('propietario').value;
    respuestas.email = document.getElementById('email').value;
    respuestas.telefono = document.getElementById('telefono').value;
    respuestas.nombreMascota = document.getElementById('nombre-mascota').value;

    if (!respuestas.formaPago) {
        alert('Por favor selecciona una forma de pago.');
        return;
    }

    // Preparamos el objeto completo para enviar
    const datosParaEnvio = {
        // Datos del propietario
        propietario: respuestas.propietario,
        email: respuestas.email,
        telefono: respuestas.telefono,
        nombreMascota: respuestas.nombreMascota,
        formaPago: respuestas.formaPago,
        precioEstimado: precioCalculado,
        // Todas las respuestas de la mascota
        especie: respuestas.especie,
        genero: respuestas.genero,
        peso: respuestas.peso,
        edad: respuestas.edad,
        raza: respuestas.raza,
        estadoFisico: respuestas.estadoFisico,
        procedimiento: respuestas.procedimiento,
        remitido: respuestas.remitido,
        veterinario: respuestas.veterinario || '',
        // Metadatos
        timestamp: new Date().toISOString(),
        fuente: 'Impacto Animal Web'
    };

    // --- ENVÍO A WEBHOOK (GHL) ---
    const webhookURL = 'https://services.leadconnectorhq.com/hooks/HFgqPVifwNR2SxrzGwEG/webhook-trigger/EQCHCH96UNHVb5zaNfQp'; // ← REEMPLAZA ESTA URL
    try {
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosParaEnvio)
        });
        if (response.ok) {
            console.log('✅ Datos enviados a GHL correctamente');
        } else {
            console.error('❌ Error al enviar a GHL, código:', response.status);
        }
    } catch (error) {
        console.error('❌ Error de conexión con el webhook:', error);
    }
    // --- FIN ENVÍO WEBHOOK ---

    // Generar mensaje para WhatsApp (continuamos igual)
    const mensaje = generarMensajeWhatsApp();
    const url = `https://wa.me/573022853080?text=${encodeURIComponent(mensaje)}`;
    document.getElementById('whatsapp-link').href = url;

    // Cambiar a pantalla de confirmación
    sections.datos.classList.remove('active');
    sections.confirmacion.classList.add('active');
});

// Selección de forma de pago
document.querySelectorAll('.opcion-pago').forEach(op => {
    op.addEventListener('click', function() {
        document.querySelectorAll('.opcion-pago').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        respuestas.formaPago = this.dataset.pago;
    });
});

// Función para generar mensaje de WhatsApp
function generarMensajeWhatsApp() {
    const r = respuestas;
    let mensaje = `Hola, soy ${r.propietario}. Agendé una cita para ${r.nombreMascota}.\n\n`;
    mensaje += `*Datos de la mascota:*\n`;
    mensaje += `Especie: ${r.especie}\n`;
    mensaje += `Género: ${r.genero}\n`;
    mensaje += `Peso: ${r.peso} kg\n`;
    mensaje += `Edad: ${r.edad} años\n`;
    mensaje += `Raza: ${r.raza}\n`;
    mensaje += `Estado físico: ${r.estadoFisico || 'Ninguno'}\n`;
    mensaje += `Procedimiento: ${r.procedimiento}\n`;
    mensaje += `Remitido por: ${r.remitido === 'si' ? r.veterinario : 'No'}\n`;
    mensaje += `\n*Datos del propietario:*\n`;
    mensaje += `Nombre: ${r.propietario}\n`;
    mensaje += `Email: ${r.email}\n`;
    mensaje += `Teléfono: ${r.telefono}\n`;
    mensaje += `\n*Pago:*\n`;
    mensaje += `Forma de pago: ${r.formaPago}\n`;
    mensaje += `Precio estimado: ${precioCalculado}€\n`;
    mensaje += `\n*Por favor, adjunta una foto de tu mascota (de lado, cuerpo completo) para que el veterinario la evalúe.*\n`;
    mensaje += `Recuerda que el depósito debe confirmarse en 24h, o la cita se liberará.`;
    return mensaje;
}

// ---------- MÚSICA ----------
const music = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
const musicStatus = document.getElementById('music-status');
let musicPlaying = true;

function initMusic() {
    if (!music) return;
    music.volume = 0.3;
    music.play().catch(() => {
        musicPlaying = false;
        musicStatus.textContent = 'Música: OFF';
        musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i><span>Música: OFF</span>';
    });

    musicToggle.addEventListener('click', () => {
        if (musicPlaying) {
            music.pause();
            musicStatus.textContent = 'Música: OFF';
            musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i><span>Música: OFF</span>';
        } else {
            music.play();
            musicStatus.textContent = 'Música: ON';
            musicToggle.innerHTML = '<i class="fas fa-music"></i><span>Música: ON</span>';
        }
        musicPlaying = !musicPlaying;
    });
}

// ---------- INICIALIZACIÓN ----------
document.addEventListener('DOMContentLoaded', () => {
    stages.forEach((s, i) => s.style.display = i === 0 ? 'block' : 'none');
    initMusic();

    const inputsQueAfectanPrecio = ['#raza-input', '#edad-input', '#estado-input'];
    inputsQueAfectanPrecio.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.addEventListener('input', actualizarPrecioMostrado);
    });
});

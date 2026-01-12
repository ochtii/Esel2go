// Debug-Konsole für globale Fehler- und Loganzeige
// Fügt sich als Modul in alle Seiten ein

let debugConsoleVisible = false;
let debugConsolePosition = 'bottom'; // 'top' oder 'bottom'

function createDebugConsole() {
    if (document.getElementById('debugConsoleContainer')) return;
    
    const container = document.createElement('div');
    container.id = 'debugConsoleContainer';
    container.className = 'fixed left-0 w-full z-[9999] pointer-events-none';
    container.style.maxHeight = '40vh';
    container.style.transition = 'top 0.3s, bottom 0.3s';
    container.style.display = 'none';
    
    container.innerHTML = `
        <div id="debugConsole" class="max-w-4xl mx-auto bg-black/90 text-white rounded-t-xl rounded-b-xl shadow-2xl border border-gray-700 overflow-hidden pointer-events-auto flex flex-col"
            style="font-family: monospace; font-size: 0.95em; max-height: 40vh;">
            <div class="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
                <div class="flex items-center gap-3">
                    <span class="font-bold">Debug-Konsole</span>
                    <button id="debugConsoleTogglePos" class="text-xs bg-gray-700 hover:bg-gray-600 rounded px-2 py-1 ml-2">Oben/Unten</button>
                </div>
                <button id="debugConsoleClose" class="text-xs bg-gray-700 hover:bg-gray-600 rounded px-2 py-1">Schließen</button>
            </div>
            <div id="debugConsoleLog" class="overflow-y-auto px-4 py-2" style="max-height: 30vh;"></div>
        </div>
    `;
    document.body.appendChild(container);

    // Toggle-Button im Footer
    let toggleBtn = document.getElementById('debugConsoleToggleBtn');
    if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.id = 'debugConsoleToggleBtn';
        toggleBtn.className = 'text-xs text-blue-500 hover:text-blue-700 underline ml-4';
        toggleBtn.innerHTML = '<span>🐞 Debug-Konsole</span>';
        toggleBtn.style.cursor = 'pointer';
        const footer = document.querySelector('footer .flex.flex-col') || document.querySelector('footer');
        if (footer) {
            footer.appendChild(toggleBtn);
        }
    }

    // Event-Listener
    toggleBtn.onclick = () => toggleDebugConsole();
    document.getElementById('debugConsoleClose').onclick = () => toggleDebugConsole(false);
    document.getElementById('debugConsoleTogglePos').onclick = () => toggleDebugConsolePosition();
}

function toggleDebugConsole(force) {
    debugConsoleVisible = typeof force === 'boolean' ? force : !debugConsoleVisible;
    const container = document.getElementById('debugConsoleContainer');
    if (!container) return;
    container.style.display = debugConsoleVisible ? 'block' : 'none';
    setDebugConsolePosition();
}

function toggleDebugConsolePosition() {
    debugConsolePosition = debugConsolePosition === 'bottom' ? 'top' : 'bottom';
    setDebugConsolePosition();
}

function setDebugConsolePosition() {
    const container = document.getElementById('debugConsoleContainer');
    if (!container) return;
    container.style.top = debugConsoleVisible && debugConsolePosition === 'top' ? '0' : '';
    container.style.bottom = debugConsoleVisible && debugConsolePosition === 'bottom' ? '0' : '';
    container.style.top = debugConsoleVisible && debugConsolePosition === 'top' ? '0' : '';
    container.style.bottom = debugConsoleVisible && debugConsolePosition === 'bottom' ? '0' : '';
}

function appendToDebugConsole(type, ...args) {
    const log = document.getElementById('debugConsoleLog');
    if (!log) return;
    const msg = args.map(a => {
        if (typeof a === 'object') {
            try { return JSON.stringify(a, null, 2); } catch { return '[Objekt]'; }
        }
        return String(a);
    }).join(' ');
    const color = type === 'error' ? 'text-red-400' : type === 'warn' ? 'text-yellow-300' : 'text-blue-200';
    const time = new Date().toLocaleTimeString();
    log.innerHTML += `<div class="${color} whitespace-pre-wrap"><span class="text-xs text-gray-400">[${time}]</span> <span class="font-bold">${type}:</span> ${msg}</div>`;
    log.scrollTop = log.scrollHeight;
}

// Hook browser console
(function hookConsole() {
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;
    const origInfo = console.info;

    console.log = function(...args) {
        appendToDebugConsole('log', ...args);
        origLog.apply(console, args);
    };
    console.warn = function(...args) {
        appendToDebugConsole('warn', ...args);
        origWarn.apply(console, args);
    };
    console.error = function(...args) {
        appendToDebugConsole('error', ...args);
        origError.apply(console, args);
    };
    console.info = function(...args) {
        appendToDebugConsole('info', ...args);
        origInfo.apply(console, args);
    };

    window.addEventListener('error', function(e) {
        appendToDebugConsole('error', e.message, e.filename + ':' + e.lineno);
    });
    window.addEventListener('unhandledrejection', function(e) {
        appendToDebugConsole('error', 'Unhandled Promise rejection:', e.reason);
    });
})();

// Init on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createDebugConsole);
} else {
    createDebugConsole();
}

// Export for manual use
export { toggleDebugConsole, appendToDebugConsole };

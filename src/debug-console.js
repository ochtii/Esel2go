// Debug-Konsole für globale Fehler- und Loganzeige
// Fügt sich als Modul in alle Seiten ein

let debugConsoleVisible = false;
let debugConsolePosition = 'bottom'; // 'top' oder 'bottom'
let debugConsoleFilter = { log: true, info: true, warn: true, error: true };
let debugConsoleLogHistory = [];

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
                <div class="flex items-center gap-2">
                    <button id="debugConsoleOptionsBtn" class="text-xs bg-gray-700 hover:bg-gray-600 rounded p-1" title="Optionen">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        <span class="sr-only">Optionen</span>
                    </button>
                    <button id="debugConsoleClose" class="text-xs bg-gray-700 hover:bg-gray-600 rounded px-2 py-1">Schließen</button>
                </div>
            </div>
            <div id="debugConsoleOptionsMenu" class="hidden absolute right-8 top-12 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 z-50 text-xs space-y-2">
                <div class="font-bold mb-2">Anzeigen:</div>
                <label class="flex items-center gap-2"><input type="checkbox" id="debugOptLog" checked> log</label>
                <label class="flex items-center gap-2"><input type="checkbox" id="debugOptInfo" checked> info</label>
                <label class="flex items-center gap-2"><input type="checkbox" id="debugOptWarn" checked> warn</label>
                <label class="flex items-center gap-2"><input type="checkbox" id="debugOptError" checked> error</label>
            </div>
            <div id="debugConsoleLog" class="overflow-y-auto px-4 py-2" style="max-height: 30vh;"></div>
        </div>
    `;
    // Optionen-Button & Menü
    setTimeout(() => {
        const optionsBtn = document.getElementById('debugConsoleOptionsBtn');
        const optionsMenu = document.getElementById('debugConsoleOptionsMenu');
        if (optionsBtn && optionsMenu) {
            optionsBtn.onclick = (e) => {
                e.stopPropagation();
                optionsMenu.classList.toggle('hidden');
            };
            document.addEventListener('click', (e) => {
                if (!optionsMenu.classList.contains('hidden')) {
                    if (!optionsMenu.contains(e.target) && e.target !== optionsBtn) {
                        optionsMenu.classList.add('hidden');
                    }
                }
            });
        }
    }, 0);
    // Filter-Optionen initialisieren, sobald Menü im DOM ist
    setTimeout(setupDebugConsoleFilter, 100);
    function setupDebugConsoleFilter() {
        const types = ['log', 'info', 'warn', 'error'];
        types.forEach(type => {
            const cb = document.getElementById('debugOpt' + type.charAt(0).toUpperCase() + type.slice(1));
            if (cb) {
                cb.checked = debugConsoleFilter[type];
                cb.onchange = () => {
                    debugConsoleFilter[type] = cb.checked;
                    rerenderDebugConsoleLog();
                };
            }
        });
    }

    function rerenderDebugConsoleLog() {
        const log = document.getElementById('debugConsoleLog');
        if (!log) return;
        log.innerHTML = '';
        debugConsoleLogHistory.forEach(entry => {
            if (debugConsoleFilter[entry.type]) {
                // Nur anzeigen, wenn Filter aktiv
                const msg = entry.args.map(a => {
                    if (typeof a === 'object') {
                        try { return JSON.stringify(a, null, 2); } catch { return '[Objekt]'; }
                    }
                    return String(a);
                }).join(' ');
                const color = entry.type === 'error' ? 'text-red-400' : entry.type === 'warn' ? 'text-yellow-300' : 'text-blue-200';
                const time = new Date().toLocaleTimeString();
                const copyId = 'debugCopyBtn_' + Math.random().toString(36).substr(2, 9);
                log.innerHTML += `<div class="${color} whitespace-pre-wrap group flex items-start gap-2"><span class="text-xs text-gray-400">[${time}]</span> <span class="font-bold">${entry.type}:</span> <span class="flex-1">${msg}</span><button id="${copyId}" class="ml-2 text-xs text-gray-400 hover:text-blue-400 opacity-60 group-hover:opacity-100 transition" title="Meldung kopieren">📋</button></div>`;
                setTimeout(() => {
                    const btn = document.getElementById(copyId);
                    if (btn) {
                        btn.onclick = () => {
                            navigator.clipboard.writeText(msg);
                            btn.textContent = '✅';
                            setTimeout(() => { btn.textContent = '📋'; }, 1000);
                        };
                    }
                }, 0);
            }
        });
        log.scrollTop = log.scrollHeight;
    }
    document.body.appendChild(container);

    // Event-Listener
    document.getElementById('debugConsoleClose').onclick = () => toggleDebugConsole(false);
    document.getElementById('debugConsoleTogglePos').onclick = () => toggleDebugConsolePosition();
    
    // Toggle-Button im Footer (bereits im HTML vorhanden) - mit Retry falls Footer noch nicht geladen
    setupToggleButton();
}

function setupToggleButton(retryCount = 0) {
    const toggleBtn = document.getElementById('debugConsoleToggleBtn');
    if (toggleBtn) {
        toggleBtn.onclick = () => toggleDebugConsole();
    } else if (retryCount < 20) {
        // Footer noch nicht geladen, nochmal versuchen
        setTimeout(() => setupToggleButton(retryCount + 1), 100);
    }
}

function toggleDebugConsole(force) {
    debugConsoleVisible = typeof force === 'boolean' ? force : !debugConsoleVisible;
    const container = document.getElementById('debugConsoleContainer');
    if (!container) return;
    container.style.display = debugConsoleVisible ? 'block' : 'none';
    setDebugConsolePosition();
    // Sichtfeld begrenzen: body-margin anpassen
    const marginSize = container.offsetHeight || 180;
    if (debugConsoleVisible) {
        if (debugConsolePosition === 'bottom') {
            document.body.style.marginBottom = marginSize + 'px';
            document.body.style.marginTop = '';
        } else {
            document.body.style.marginTop = marginSize + 'px';
            document.body.style.marginBottom = '';
        }
    } else {
        document.body.style.marginBottom = '';
        document.body.style.marginTop = '';
    }
}

function toggleDebugConsolePosition() {
    debugConsolePosition = debugConsolePosition === 'bottom' ? 'top' : 'bottom';
    setDebugConsolePosition();
}

function setDebugConsolePosition() {
    const container = document.getElementById('debugConsoleContainer');
    if (!container) return;
    // Reset
    container.style.top = '';
    container.style.bottom = '';
    if (debugConsoleVisible && debugConsolePosition === 'top') {
        container.style.top = '0';
    }
    if (debugConsoleVisible && debugConsolePosition === 'bottom') {
        container.style.bottom = '0';
    }
    // Sichtfeld anpassen, falls Position geändert wird
    if (debugConsoleVisible) {
        const marginSize = container.offsetHeight || 180;
        if (debugConsolePosition === 'bottom') {
            document.body.style.marginBottom = marginSize + 'px';
            document.body.style.marginTop = '';
        } else {
            document.body.style.marginTop = marginSize + 'px';
            document.body.style.marginBottom = '';
        }
    }
}

function appendToDebugConsole(type, ...args) {
    const log = document.getElementById('debugConsoleLog');
    if (!log) return;
    debugConsoleLogHistory.push({ type, args });
    if (!debugConsoleFilter[type]) return;
    const msg = args.map(a => {
        if (typeof a === 'object') {
            try { return JSON.stringify(a, null, 2); } catch { return '[Objekt]'; }
        }
        return String(a);
    }).join(' ');
    const color = type === 'error' ? 'text-red-400' : type === 'warn' ? 'text-yellow-300' : 'text-blue-200';
    const time = new Date().toLocaleTimeString();
    const copyId = 'debugCopyBtn_' + Math.random().toString(36).substr(2, 9);
    log.innerHTML += `<div class="${color} whitespace-pre-wrap group flex items-start gap-2"><span class="text-xs text-gray-400">[${time}]</span> <span class="font-bold">${type}:</span> <span class="flex-1">${msg}</span><button id="${copyId}" class="ml-2 text-xs text-gray-400 hover:text-blue-400 opacity-60 group-hover:opacity-100 transition" title="Meldung kopieren">📋</button></div>`;
    log.scrollTop = log.scrollHeight;
    setTimeout(() => {
        const btn = document.getElementById(copyId);
        if (btn) {
            btn.onclick = () => {
                navigator.clipboard.writeText(msg);
                btn.textContent = '✅';
                setTimeout(() => { btn.textContent = '📋'; }, 1000);
            };
        }
    }, 0);
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

// Debug-Konsole für globale Fehler- und Loganzeige
// Fügt sich als Modul in alle Seiten ein

let debugConsoleVisible = false;
let debugConsolePosition = 'bottom'; // 'top' oder 'bottom'
let debugConsoleFilter = { log: true, info: true, warn: true, error: true };
let debugConsoleLogHistory = [];
let debugConsoleSizeLocked = false;

function createDebugConsole() {
    if (document.getElementById('debugConsoleContainer')) return;
    
    const container = document.createElement('div');
    container.id = 'debugConsoleContainer';
    container.className = 'fixed left-0 w-full z-[9999] pointer-events-none';
    container.style.maxHeight = '40vh';
    container.style.transition = 'top 0.3s, bottom 0.3s';
    container.style.display = 'none';
    
    container.innerHTML = `
        <div id="debugConsole" class="max-w-4xl mx-auto bg-black/90 text-white rounded-t-xl rounded-b-xl shadow-2xl border border-gray-700 overflow-hidden pointer-events-auto flex flex-col resize-y"
            style="font-family: monospace; font-size: 0.95em; height: 300px; min-height: 150px; max-height: 80vh;">
            <div class="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700 cursor-move" id="debugConsoleHeader">
                <div class="flex items-center gap-3">
                    <span class="font-bold">🐞 Debug</span>
                </div>
                <div class="flex items-center gap-2">
                    <button id="debugConsoleOptionsBtn" class="text-xs bg-gray-700 hover:bg-gray-600 rounded p-1" title="Einstellungen">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </button>
                    <button id="debugConsoleSizeLock" class="text-xs bg-gray-700 hover:bg-gray-600 rounded p-1" title="Größe sperren/entsperren">
                        <svg id="debugConsoleLockIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                    </button>
                    <button id="debugConsoleClose" class="text-xs bg-gray-700 hover:bg-gray-600 rounded p-1" title="Schließen">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>
            <div id="debugConsoleOptionsMenu" class="hidden absolute right-8 top-12 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 z-50 text-xs space-y-3 w-48">
                <div class="font-bold mb-2">Einstellungen</div>
                <div class="space-y-2">
                    <div class="font-semibold text-gray-400">Position:</div>
                    <label class="flex items-center gap-2"><input type="radio" name="debugPos" value="top" id="debugPosTop"> Oben</label>
                    <label class="flex items-center gap-2"><input type="radio" name="debugPos" value="bottom" id="debugPosBottom" checked> Unten</label>
                </div>
                <div class="border-t border-gray-700 pt-2 space-y-2">
                    <div class="font-semibold text-gray-400">Anzeigen:</div>
                    <label class="flex items-center gap-2"><input type="checkbox" id="debugOptLog" checked> log</label>
                    <label class="flex items-center gap-2"><input type="checkbox" id="debugOptInfo" checked> info</label>
                    <label class="flex items-center gap-2"><input type="checkbox" id="debugOptWarn" checked> warn</label>
                    <label class="flex items-center gap-2"><input type="checkbox" id="debugOptError" checked> error</label>
                </div>
            </div>
            <div id="debugConsoleLog" class="overflow-y-auto px-4 py-2 flex-1"></div>
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
        
        // Position Radio-Buttons
        const posTop = document.getElementById('debugPosTop');
        const posBottom = document.getElementById('debugPosBottom');
        if (posTop && posBottom) {
            posTop.checked = debugConsolePosition === 'top';
            posBottom.checked = debugConsolePosition === 'bottom';
            posTop.onchange = () => { if (posTop.checked) toggleDebugConsolePosition('top'); };
            posBottom.onchange = () => { if (posBottom.checked) toggleDebugConsolePosition('bottom'); };
        }
        
        // Size Lock Button
        const lockBtn = document.getElementById('debugConsoleSizeLock');
        const lockIcon = document.getElementById('debugConsoleLockIcon');
        const consoleEl = document.getElementById('debugConsole');
        if (lockBtn && consoleEl) {
            lockBtn.onclick = () => {
                debugConsoleSizeLocked = !debugConsoleSizeLocked;
                consoleEl.style.resize = debugConsoleSizeLocked ? 'none' : 'vertical';
                // Update icon
                if (lockIcon) {
                    lockIcon.innerHTML = debugConsoleSizeLocked 
                        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>'
                        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>';
                }
            };
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
                // Extract source location if first arg looks like "file.js:123"
                let source = '';
                let messageArgs = entry.args;
                if (entry.args.length > 0 && typeof entry.args[0] === 'string' && /^[^:]+:\d+$/.test(entry.args[0])) {
                    source = entry.args[0];
                    messageArgs = entry.args.slice(1);
                }
                
                const msg = messageArgs.map(a => {
                    if (typeof a === 'object') {
                        try { return JSON.stringify(a, null, 2); } catch { return '[Objekt]'; }
                    }
                    return String(a);
                }).join(' ');
                const color = entry.type === 'error' ? 'text-red-400' : entry.type === 'warn' ? 'text-yellow-300' : 'text-blue-200';
                const time = new Date().toLocaleTimeString();
                const copyId = 'debugCopyBtn_' + Math.random().toString(36).substr(2, 9);
                // Source-Tag: auf mobil versteckt, auf Desktop sichtbar
                const sourceTag = source ? `<span class="hidden sm:inline text-xs text-gray-500 font-mono">[${source}]</span> ` : '';
                // Vollständige Nachricht für Kopieren (mit Source)
                const fullMessage = source ? `[${source}] ${msg}` : msg;
                log.innerHTML += `<div class="${color} whitespace-pre-wrap group flex items-start gap-2"><span class="text-xs text-gray-400">[${time}]</span> ${sourceTag}<span class="font-bold">${entry.type}:</span> <span class="flex-1">${msg}</span><button id="${copyId}" class="ml-2 text-xs text-gray-400 hover:text-blue-400 opacity-60 group-hover:opacity-100 transition" title="Meldung kopieren">📋</button></div>`;
                setTimeout(() => {
                    const btn = document.getElementById(copyId);
                    if (btn) {
                        btn.onclick = () => {
                            navigator.clipboard.writeText(fullMessage);
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

function toggleDebugConsolePosition(newPos) {
    if (newPos) {
        debugConsolePosition = newPos;
    } else {
        debugConsolePosition = debugConsolePosition === 'bottom' ? 'top' : 'bottom';
    }
    setDebugConsolePosition();
    // Update radio buttons
    const posTop = document.getElementById('debugPosTop');
    const posBottom = document.getElementById('debugPosBottom');
    if (posTop && posBottom) {
        posTop.checked = debugConsolePosition === 'top';
        posBottom.checked = debugConsolePosition === 'bottom';
    }
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
    
    // Extract source location if first arg looks like "file.js:123"
    let source = '';
    let messageArgs = args;
    if (args.length > 0 && typeof args[0] === 'string' && /^[^:]+:\d+$/.test(args[0])) {
        source = args[0];
        messageArgs = args.slice(1);
    }
    
    const msg = messageArgs.map(a => {
        if (typeof a === 'object') {
            try { return JSON.stringify(a, null, 2); } catch { return '[Objekt]'; }
        }
        return String(a);
    }).join(' ');
    const color = type === 'error' ? 'text-red-400' : type === 'warn' ? 'text-yellow-300' : 'text-blue-200';
    const time = new Date().toLocaleTimeString();
    const copyId = 'debugCopyBtn_' + Math.random().toString(36).substr(2, 9);
    // Source-Tag: auf mobil versteckt, auf Desktop sichtbar
    const sourceTag = source ? `<span class="hidden sm:inline text-xs text-gray-500 font-mono">[${source}]</span> ` : '';
    // Vollständige Nachricht für Kopieren (mit Source)
    const fullMessage = source ? `[${source}] ${msg}` : msg;
    log.innerHTML += `<div class="${color} whitespace-pre-wrap group flex items-start gap-2"><span class="text-xs text-gray-400">[${time}]</span> ${sourceTag}<span class="font-bold">${type}:</span> <span class="flex-1">${msg}</span><button id="${copyId}" class="ml-2 text-xs text-gray-400 hover:text-blue-400 opacity-60 group-hover:opacity-100 transition" title="Meldung kopieren">📋</button></div>`;
    log.scrollTop = log.scrollHeight;
    setTimeout(() => {
        const btn = document.getElementById(copyId);
        if (btn) {
            btn.onclick = () => {
                navigator.clipboard.writeText(fullMessage);
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

    function getCallerInfo() {
        try {
            const stack = new Error().stack;
            if (!stack) return '';
            const lines = stack.split('\n');
            // Skip first 3 lines (Error, getCallerInfo, console hook)
            for (let i = 3; i < lines.length; i++) {
                const line = lines[i];
                // Match file:line:column pattern
                const match = line.match(/\((.*):(\d+):(\d+)\)/) || line.match(/at (.*):(\d+):(\d+)/);
                if (match) {
                    const fullPath = match[1];
                    const lineNum = match[2];
                    // Extract filename from full path
                    const fileName = fullPath.split('/').pop().split('?')[0];
                    return `${fileName}:${lineNum}`;
                }
            }
        } catch (e) {
            return '';
        }
        return '';
    }

    console.log = function(...args) {
        const source = getCallerInfo();
        appendToDebugConsole('log', source, ...args);
        origLog.apply(console, args);
    };
    console.warn = function(...args) {
        const source = getCallerInfo();
        appendToDebugConsole('warn', source, ...args);
        origWarn.apply(console, args);
    };
    console.error = function(...args) {
        const source = getCallerInfo();
        appendToDebugConsole('error', source, ...args);
        origError.apply(console, args);
    };
    console.info = function(...args) {
        const source = getCallerInfo();
        appendToDebugConsole('info', source, ...args);
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

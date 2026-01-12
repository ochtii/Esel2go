# esel2go 🫏

**Die Wiener Lieferservice App für echte Esel, Oida!**

Eine moderne, vollständig funktionsfähige Single-Page-Application (SPA) für einen österreichischen Online-Lieferservice, entwickelt mit HTML5, Vanilla JavaScript (ES6+ Modules) und Tailwind CSS.

---

## 🚀 Features

### Kern-Funktionalität
- **Produktkatalog** mit Kategoriefilter (Begattungsgut, Fettn, Zubehör)
- **Intelligenter Warenkorb** mit LocalStorage-Persistenz
- **Automatische Versandberechnung**:
  - €9,90 Standard-Versand
  - Kostenlos ab €420 Warenwert
- **Bonus-System**: Gratis Seminar "Kamel abwixxen Einsteigerkurs" ab €1000
- **Mehrsprachigkeit**: Deutsch & Englisch (erweiterbar)
- **Responsives Design**: Mobile-first, alle Auflösungen

### Design & Ästhetik
- **3 Themes**:
  - 🌞 **Light** - Klassisches helles Design
  - 🌙 **Dark** - Modernes dunkles Theme
  - 🫏 **Esel Oida** - Das Wiener Original mit Charakter
- **Tailwind CSS** mit Custom Colors & Konfiguration
- **Smooth Transitions** & moderne Animations
- **Custom Scrollbar** Styling

### Technische Highlights
- **Modulare Architektur**: Saubere ES6-Module mit klarer Separation of Concerns
- **Keine Abhängigkeiten**: 100% Vanilla JavaScript
- **JSON-basierte Daten**: Einfach erweiterbar
- **Clean Code**: Umfassend kommentiert, <1000 Zeilen pro Datei
- **Barrierefreiheit**: Keyboard Navigation, Focus States

---

## 📂 Projektstruktur

```
esel2go/
├── index.html                 # HTML5 Structure mit Tailwind CDN
├── server.py                  # Development Server (No-Cache)
├── README.md                  # Diese Datei
├── build-info.json           # Build-Timestamp für Footer
├── assets/
│   └── css/
│       └── style.css         # Custom CSS & Theme-Definitionen
├── data/
│   ├── categories.json       # Kategorien (3x)
│   ├── products.json         # Produkte (36x mit Unsplash-Bildern)
│   └── translations.json     # i18n Strings (DE/EN)
└── src/
    ├── main.js              # App-Initialization
    ├── api.js               # Datenabruf & Caching
    ├── cart.js              # Warenkorb-Logik & Berechnungen
    ├── ui.js                # DOM-Manipulation & Events
    ├── i18n.js              # Sprachverwaltung
    └── theme.js             # Theme-Management
```

---

## 🎨 Themes

### Esel Oida Theme (Standard)
```css
Primary: Burnt Orange (#f97316)
Accent: Deep Burgundy (#7c2d12)
Text: Rustic Brown (#44280c)
Background: Cream (#fef3c7)
```

### Light Theme
```css
Primary: Sky Blue (#0ea5e9)
Accent: Orange (#f97316)
Text: Dark Gray (#1f2937)
Background: White (#ffffff)
```

### Dark Theme
```css
Primary: Cyan (#06b6d4)
Accent: Lime (#84cc16)
Text: Light Gray (#f3f4f6)
Background: Dark Slate (#0f172a)
```

**Theme-Switcher** in der Header-Leiste - wähle dein Lieblings-Theme!

---

## 🛠️ Installation & Entwicklung

### Voraussetzungen
- Moderner Browser (Chrome, Firefox, Safari, Edge)
- VS Code (optional, für beste DX)
- HTTP Server (für lokales Testen mit Fetch-API)

### Lokal starten

```bash
# Repository klonen
git clone https://github.com/ochtii/Esel2go.git
cd Esel2go

# EMPFOHLEN: Mit NO-CACHE Development Server (sofortige Updates!)
python3 server.py

# Alternativ: Mit Standard Python Server
python -m http.server 8000

# Mit Node.js (http-server)
npx http-server

# Mit VS Code Live Server
# -> Rechtsklick auf index.html → "Open with Live Server"
```

Dann öffne: **http://localhost:8080** (mit server.py) oder **http://localhost:8000**

**⚡ Tipp**: Nutze `server.py` für sofortige Änderungen ohne Browser-Cache!

---

## 💻 Technologie-Stack

| Layer | Technologie |
|-------|-----------|
| **Markup** | HTML5 Semantic |
| **Styling** | Tailwind CSS (CDN) + Custom CSS |
| **Scripting** | Vanilla JavaScript ES6+ |
| **State Management** | LocalStorage + Modules |
| **Data Format** | JSON |
| **Build Tool** | None (Zero Bundler) |

---

## 🎯 Business Logic Details

### Warenkorb-Berechnung
```javascript
// Subtotal: Sum aller Positionen
subtotal = Σ(price × quantity)

// Versand
shipping = subtotal >= 420 ? 0 : 9.90

// Bonus-Item (kostenlos)
IF subtotal >= 1000 THEN add free "Seminar" item

// Total
total = subtotal + shipping
```

### Cart-Persistenz
- Warenkorb wird automatisch in `localStorage` gespeichert
- Überdauert Browser-Neuladen
- `cart:clear()` für manuelles Löschen

---

## 🌐 Mehrsprachigkeit

### Unterstützte Sprachen
- 🇩🇪 Deutsch (Standard)
- 🇬🇧 English

### Sprache ändern
1. Dropdown in der Header-Leiste nutzen
2. Auswahl wird in `localStorage` gespeichert
3. Bei nächstem Besuch wird Sprache wiederhergestellt

### Neue Sprache hinzufügen
1. `data/translations.json` erweitern:
```json
{
  "de": {...},
  "en": {...},
  "fr": {
    "appTitle": "esel2go",
    "cartTitle": "Ton Panier",
    ...
  }
}
```

2. Dropdown in `index.html` aktualisieren

---

## 📦 Module & API

### `src/api.js`
```javascript
await fetchCategories()          // Alle Kategorien
await fetchProducts()            // Alle Produkte
await getProductsByCategory(id)  // Gefilterte Produkte
await getProductById(id)         // Einzelnes Produkt
await getCategoryById(id)        // Kategorie Details
```

### `src/cart.js`
```javascript
addToCart(product, quantity)     // Zum Warenkorb
removeFromCart(productId)        // Entfernen
updateQuantity(productId, qty)   // Menge ändern
calculateSubtotal()              // Summe ohne Versand
calculateShippingCost()          // Versand berechnen
calculateTotal()                 // Gesamtsumme
getCartSummary()                 // Komplette Info
```

### `src/i18n.js`
```javascript
setLanguage(lang)                // Sprache setzen
getCurrentLanguage()             // Aktuelle Sprache
t(key, fallback)                 // Übersetzen
getAvailableLanguages()          // Verfügbare Sprachen
```

### `src/theme.js`
```javascript
setTheme(themeName)              // Theme wechseln
getCurrentTheme()                // Aktives Theme
getAvailableThemes()             // Alle Themes
initializeTheme()                // Init mit Speicher
```

---

## 🐛 Debugging

### Browser Console
```javascript
// Cart ansehen
import * as cart from './src/cart.js';
cart.getCartSummary()

// Themes testen
import * as theme from './src/theme.js';
theme.setTheme('dark')

// LocalStorage löschen
localStorage.clear()
```

### Build Info
Die Datei `build-info.json` enthält das Datum der letzten Änderung:
- Wird automatisch aktualisiert bei jedem Commit (via Pre-Commit Hook)
- Zeigt das echte Commit-Datum im Footer
- Hat Fallback zu GitHub API falls nicht verfügbar

### Häufige Probleme

| Problem | Lösung |
|---------|--------|
| **CORS Error** | HTTP Server verwenden, nicht `file://` |
| **Module nicht geladen** | Browser-Konsole auf Errors prüfen |
| **Daten nicht angezeigt** | `/data/` Ordner im Root-Verzeichnis? |
| **Styles nicht korrekt** | Browser-Cache leeren (Ctrl+Shift+Delete) |
| **Footer Zeit falsch** | `build-info.json` wurde aktualisiert? |

---

## 🚀 Deployment

### Zu GitHub Pages
```bash
git add .
git commit -m "feat: esel2go v1.0"
git push origin main

# In GitHub: Settings → Pages → Deploy from branch (main)
```

Die App ist sofort unter `https://ochtii.github.io/Esel2go` erreichbar!

### Alternative Hosting
- **Vercel**: `vercel --prod`
- **Netlify**: Einfach Repository verbinden
- **Heroku**: Kostenlos (mit `Procfile`)

---

## 📝 Lizenz

MIT - Frei verwendbar, Änderungen willkommen!

---

## 🤝 Beitragen

Gerne Issues eröffnen oder Pull Requests einreichen für:
- Neue Themes
- Zusätzliche Sprachen
- Bug-Fixes
- Feature-Requests
- Performance-Optimierungen

---

## 📧 Kontakt

**Ersteller**: [@ochtii](https://github.com/ochtii)

---

<div align="center">

**🫏 Viel Spaß mit esel2go!**

*"Die klassischste Eselerei auf dem Netz, Oida!"*

</div>

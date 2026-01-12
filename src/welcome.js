/**
 * Welcome Messages Module - Landing Page Greetings
 * Stores 20 funny and casual welcome messages
 */

const welcomeMessages = [
    "Willkommen zurück, du Sackpacker! 🍻",
    "Schön dass du wieder da bist, Oida! 🫏",
    "Na, schon wieder durstig? 🍺",
    "Grüß Gott! Zeit zum Einkaufen, was? 🛒",
    "Servus! Lass uns was Gutes finden! 🎉",
    "Ahoi! Bereit für neue Abenteuer? ⚓",
    "Guten Tag, mein Freund! Was darf's sein? 😎",
    "Willkommen in der esel2go Welt! 🌍",
    "Du bist mir ja vertraut - komm rein! 🚪",
    "Schee dich zu sehen! Auf zu neuen Produkten! 🏃",
    "Hätt' ich dich nicht vermisst! 😄",
    "Na endlich! Wir haben dich erwartet! 🎊",
    "Hallo du Schlawiner! 🤪",
    "Guten Morgen/Tag/Abend, mein Schatz! 💖",
    "Ein weiterer glücklicher Esel2go Tag! 🎈",
    "Komm rein, die Welt ist dein! 🌟",
    "Bereit zum Shoppen wie ein Grantler? 🛍️",
    "Schöne Grüße aus Wien! 🗼",
    "Lass dich überraschen - wir haben neues! ✨",
    "Danke dass du uns die Ehre gibst! 🙏"
];

/**
 * Get random welcome message
 */
export function getRandomWelcome() {
    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
}

/**
 * Get all welcome messages
 */
export function getAllWelcomeMessages() {
    return welcomeMessages;
}

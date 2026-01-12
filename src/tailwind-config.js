/**
 * Tailwind CSS Configuration
 * Extends default Tailwind theme with custom colors and fonts
 */

if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    primary: {
                        50: '#f0f9ff',
                        500: '#0ea5e9',
                        600: '#0284c7',
                        700: '#0369a1',
                    },
                    accent: {
                        500: '#f97316',
                        600: '#ea580c',
                    }
                },
                fontFamily: {
                    sans: ['Inter', 'system-ui', 'sans-serif'],
                }
            }
        }
    };
    console.log('✓ Tailwind config loaded');
}

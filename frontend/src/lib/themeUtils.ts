// Theme color configurations matching Settings.tsx
const themeColors: Record<string, { primary: string; secondary: string; hsl: { h: number; s: number; l: number } }> = {
    rose: {
        primary: '#f43f5e',
        secondary: '#fbf1f5',
        hsl: { h: 340, s: 65, l: 47 },
    },
    purple: {
        primary: '#a855f7',
        secondary: '#faf5ff',
        hsl: { h: 280, s: 65, l: 56 },
    },
    blue: {
        primary: '#3b82f6',
        secondary: '#eff6ff',
        hsl: { h: 217, s: 91, l: 60 },
    },
    emerald: {
        primary: '#10b981',
        secondary: '#f0fdf4',
        hsl: { h: 160, s: 84, l: 39 },
    },
    amber: {
        primary: '#f59e0b',
        secondary: '#fffbeb',
        hsl: { h: 38, s: 92, l: 50 },
    },
    orange: {
        primary: '#f97316',
        secondary: '#fff7ed',
        hsl: { h: 25, s: 95, l: 53 },
    },
};

export function applyTheme(themeName: string = 'rose') {
    const theme = themeColors[themeName] || themeColors.rose;

    // Convert hex to HSL for CSS variables
    const hslValues = theme.hsl;

    // Apply theme colors to document root
    const root = document.documentElement;

    // Update primary color (main brand color)
    root.style.setProperty('--primary', `${hslValues.h} ${hslValues.s}% ${hslValues.l}%`);
    root.style.setProperty('--primary-foreground', '0 0% 100%');

    // Update secondary color (lighter version)
    const secondaryHsl = hexToHsl(theme.secondary);
    root.style.setProperty('--secondary', `${secondaryHsl.h} ${secondaryHsl.s}% ${secondaryHsl.l}%`);
    root.style.setProperty('--secondary-foreground', '350 25% 25%');

    // Update related colors
    root.style.setProperty('--ring', `${hslValues.h} ${hslValues.s}% ${hslValues.l}%`);

    // Update muted colors (lighter tints)
    const mutedHsl = {
        h: hslValues.h,
        s: Math.max(0, hslValues.s - 20),
        l: Math.min(100, hslValues.l + 30),
    };
    root.style.setProperty('--muted', `${mutedHsl.h} ${mutedHsl.s}% ${mutedHsl.l}%`);

    console.log(`[Theme] Applied theme: ${themeName}`, {
        primary: `${hslValues.h} ${hslValues.s}% ${hslValues.l}%`,
        secondary: `${secondaryHsl.h} ${secondaryHsl.s}% ${secondaryHsl.l}%`,
    });
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

// Reset to default theme
export function resetTheme() {
    applyTheme('rose');
}

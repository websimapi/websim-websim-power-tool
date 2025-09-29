import { j as $ } from "react/jsx-runtime";
import { o as Button, p as Flex, a as Text } from "radix-primitives";
import { u as useRemixNavigate } from "remix-runtime";
import { useState, useCallback, useEffect, memo } from "react";

// Utility function to generate a random hex color
const generateRandomHexColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
};

// Utility function to convert HSL to CSS string
const hslToCss = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;

// Component for a single color swatch
const ColorSwatch = memo(({ color, label }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(color).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    }, [color]);

    const hexToRgb = (hex) => {
        if (hex.startsWith('#')) {
            hex = hex.slice(1);
        }
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        const num = parseInt(hex, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    };

    const isLight = (color) => {
        // Simple luminance calculation for text contrast
        if (color.startsWith('#')) {
            const { r, g, b } = hexToRgb(color);
            // W3C recommendation for perceived brightness (Y = 0.2126*R + 0.7152*G + 0.0722*B)
            return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 170;
        } else if (color.startsWith('hsl')) {
             const lMatch = color.match(/,\s*(\d+(\.\d+)?)%\)/);
             if (lMatch) {
                 return parseFloat(lMatch[1]) > 50;
             }
             return true; 
        } else {
            return true;
        }
    }
    
    const textColor = isLight(color) ? "black" : "white";

    return $.jsxs(Flex, {
        direction: "column",
        align: "center",
        className: "p-4 rounded-lg shadow-md transition-all duration-150 ease-in-out hover:shadow-xl cursor-pointer border border-gray-200 dark:border-neutral-700",
        style: { backgroundColor: color, height: '100px', minWidth: '100px', color: textColor }, 
        onClick: handleCopy,
        children: [
            $.jsx(Text, {
                size: "2",
                weight: "bold",
                className: "drop-shadow-sm",
                style: { color: textColor },
                children: label
            }),
            $.jsx(Text, {
                size: "2",
                className: "mt-auto drop-shadow-sm",
                style: { color: textColor },
                children: copied ? "Copied!" : color
            })
        ]
    });
});
ColorSwatch.displayName = "ColorSwatch";

// Main Power Tool component
const ColorPaletteGenerator = () => {
    const [baseColor, setBaseColor] = useState(generateRandomHexColor());
    const [palette, setPalette] = useState([]);
    const navigate = useRemixNavigate();

    const hexToHsl = (hex) => {
        let r = 0, g = 0, b = 0;
        // Handle shorthand hex
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        } else {
            return { h: 0, s: 0, l: 50 };
        }

        r /= 255; g /= 255; b /= 255;
        let cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
            delta = cmax - cmin,
            h = 0,
            s = 0,
            l = 0;

        if (delta === 0) h = 0;
        else if (cmax === r) h = ((g - b) / delta) % 6;
        else if (cmax === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;

        h = Math.round(h * 60);
        if (h < 0) h += 360;

        l = (cmax + cmin) / 2;
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        return { h: h, s: parseFloat(s), l: parseFloat(l) };
    };

    const generatePalette = useCallback((hex) => {
        if (!/^#([0-9A-F]{3}){1,2}$/i.test(hex)) {
            setPalette([]);
            return;
        }

        const { h, s, l } = hexToHsl(hex);
        
        // Analogous colors: +/- 20 degrees
        const h1 = (h + 20) % 360;
        const h2 = (h - 20 + 360) % 360;
        
        // Define tints/shades/analogous colors
        const paletteConfig = [
            { h: h, s: s, l: Math.min(95, l + 30), label: "Lightest" },
            { h: h, s: s, l: Math.min(95, l + 15), label: "Lighter" },
            { h: h1, s: s, l: l, label: "Analogous A" },
            { h: h, s: s, l: l, label: "Base" },
            { h: h2, s: s, l: l, label: "Analogous B" },
            { h: h, s: s, l: Math.max(5, l - 15), label: "Darker" },
            { h: h, s: s, l: Math.max(5, l - 30), label: "Darkest" },
        ];


        const newPalette = paletteConfig.map(c => {
            const color = hslToCss(c.h, c.s, c.l);
            // Use original hex for the Base color if input was a valid 6-char hex
            return {
                color: c.label === "Base" && hex.length === 7 ? hex : color,
                label: c.label
            };
        });
        
        setPalette(newPalette);
    }, []);

    useEffect(() => {
        generatePalette(baseColor);
    }, [baseColor, generatePalette]);

    const handleRandomize = () => {
        setBaseColor(generateRandomHexColor());
    };
    
    const handleColorChange = (e) => {
        const hex = e.target.value.toUpperCase();
        if (hex.length <= 7 && hex.startsWith('#')) {
            setBaseColor(hex);
        }
    };
    
    const handleClose = () => {
        // Clear query parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('tool');
        navigate(url.pathname + url.search);
    };


    return $.jsxs(Flex, {
        direction: "column",
        className: "p-4 md:p-8 bg-gray-50 dark:bg-neutral-900 min-h-screen w-full font-sans",
        children: [
            $.jsxs(Flex, {
                justify: "between",
                align: "center",
                className: "mb-6",
                children: [
                    $.jsx(Text, { 
                        as: "h1", 
                        size: "7", 
                        weight: "bold", 
                        className: "text-gray-900 dark:text-white",
                        children: "Websim Color Palette Power Tool" 
                    }),
                    $.jsx(Button, {
                        onClick: handleClose,
                        variant: "outline",
                        children: "Exit Tool"
                    })
                ]
            }),
            
            $.jsxs(Flex, {
                gap: "3",
                align: "center",
                className: "mb-8 bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-neutral-700",
                children: [
                    $.jsx(Text, { children: "Base Color (HEX/Input):" }),
                    $.jsx("input", {
                        type: "color",
                        value: baseColor.length === 7 ? baseColor : '#000000',
                        onChange: (e) => setBaseColor(e.target.value.toUpperCase()),
                        className: "w-10 h-10 p-0 border-none cursor-pointer"
                    }),
                    $.jsx("input", {
                        type: "text",
                        value: baseColor,
                        onChange: handleColorChange,
                        maxLength: 7,
                        placeholder: "#RRGGBB",
                        className: "p-2 border border-gray-300 dark:border-neutral-700 rounded-md w-32 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    }),
                    $.jsx(Button, {
                        onClick: handleRandomize,
                        children: "Randomize"
                    })
                ]
            }),

            $.jsx(Flex, {
                wrap: "wrap",
                gap: "4",
                justify: "start",
                children: palette.length > 0 ? palette.map((p, index) => $.jsx(ColorSwatch, {
                    color: p.color,
                    label: p.label
                }, index)) : 
                $.jsx(Text, {
                    size: "4",
                    className: "text-gray-500",
                    children: "Enter a valid Hex color code (e.g., #1A73E8)"
                })
            })
        ]
    });
};

export default ColorPaletteGenerator;


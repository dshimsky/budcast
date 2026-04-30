# BudCast Logo System Spacing Guidelines

## Core Geometry

- `N` = creator node diameter in the symbol.
- `S` = symbol optical height, measured from the top outer signal arc to the bottom outer signal arc.
- `C` = wordmark cap height.

## Primary Horizontal Lockup

- Use the primary lockup when width is available: nav bars, auth pages, dashboards, decks, invoices, and marketing headers.
- Symbol height: `1.15C` to `1.25C`. The final lockup uses the premium ratio, where the symbol is slightly larger than the wordmark cap height without dominating it.
- Symbol-to-wordmark gap: approximately `0.42N`.
- Descriptor aligns to the wordmark left edge, not the symbol.
- Minimum clearspace: `0.5N` on all sides.
- Minimum display width: `180px`. Below that, use symbol-only or favicon.

## Stacked Lockup

- Use the stacked lockup for square-ish spaces, splash screens, centered onboarding moments, and brand cards.
- Symbol is centered over the wordmark.
- Vertical gap between symbol and wordmark: approximately `0.45N`.
- Descriptor is centered under the wordmark.
- Minimum clearspace: `0.5N` on all sides.
- Minimum display width: `160px`.

## App Icon

- Use the app icon for App Store, Play Store, mobile home screen, and high-resolution product surfaces.
- Keep the icon on the near-black rounded-square background.
- Safe area: keep the symbol inside the central `76%` of the icon canvas.
- Do not add shadows, glows, borders, or extra cannabis imagery.
- Minimum useful display size: `48px`.

## Favicon

- The favicon intentionally uses a simplified solid version.
- It removes gradients, terminals, highlight circles, and micro-details that break at `16px`.
- Use it at `16px`, `32px`, and browser tab sizes.
- Do not use the full app icon as the favicon; it has too much detail for `16px`.

## Color

- Background: `#090907`
- Primary signal: `#c8f060`
- Dark wordmark: `#f7f7f3`
- Light wordmark: `#090907`
- Light-surface descriptor: `#497d2c`

## Usage Rules

- Keep the wordmark highly legible; do not add decorative custom cuts to the text.
- Neon green is the symbol/accent color, not the main text color.
- Use gradients only on symbol/app icon sizes where they remain readable.
- Use the simplified favicon for very small surfaces.
- Do not place the full horizontal lockup below `180px` wide.
- Do not stretch, rotate, outline, or add glow effects.

## Production Note

The current review lockups use SVG text with the intended font stack: `Avenir Next, Helvetica Neue, Arial, sans-serif`.
For final legal/production brand files, outline the wordmark in Figma or Illustrator so the SVGs are font-independent.

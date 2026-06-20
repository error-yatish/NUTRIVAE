# Nutrivae UI standards

The UI has four layers:

1. `styles/tokens.css` — semantic colors, theme palettes, radii, and shadows.
2. `styles/components.css` — stable classes for buttons, forms, cards, tables, and page layout.
3. `src/components/` — focused reusable React components grouped by responsibility.
4. Pages — domain behavior and composition only.

Rules:

- Use `PageHeader` for page titles/actions and `SectionCard` for content sections.
- Use `FormField`, `SelectField`, and `TextAreaField`; do not hand-build labels and validation markup.
- Import from the closest component group (`components/forms`, `components/common`) or the top-level
  `components` barrel when several groups are needed.
- Keep one primary reusable component per file and export its props interface.
- Use `.form-grid`, `.form-actions`, `.table-shell`, and `.data-table`.
- Use semantic CSS variables rather than literal brand colors.
- Themes change variables, never page markup.
- Every visible button must have an action, route, or disabled state.

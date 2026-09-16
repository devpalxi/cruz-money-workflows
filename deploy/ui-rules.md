# Riverside Payouts UI Rules

This is the visual contract for Admin and Super Admin pages. `dashboard.html` and `dashboard-style.css` are the reference implementation.

## Scope

- Use the same shell, typography, colors, controls, badges, tables, and responsive behavior on every Admin and Super Admin page.
- Preserve existing HTML class names and JavaScript behavior when migrating a page. Add aliases or shared styles before renaming selectors.
- Mock data is acceptable for UI-only screens, but loading, empty, error, and success states must remain visually consistent.

## Design Tokens

Use the tokens in `dashboard-style.css`; do not create page-local alternatives.

- Primary: `--blue`, `--blue-dark`, `--blue-light`, `--blue-border`
- Text: `--text-hi`, `--text-mid`, `--text-lo`
- Surfaces: `--bg-page`, `--bg-card`, `--bg-th`, `--bg-hover`
- Borders: `--border`, `--border-mid`
- States: `--green-*`, `--amber-*`, `--red-*`, `--slate-*`, `--true-blue-*`
- Shape: `--r-xs`, `--r-sm`, `--r-md`, `--r-lg`, `--r-pill`
- Motion: `--ease`, `--t`

Legacy aliases such as `--brand`, `--accent`, `--sa-teal`, and `--t1` are compatibility names only. New code must use canonical tokens.

## Typography

- Use `var(--font-body)` for interface text and `var(--font-display)` for headings.
- Use `var(--font-mono)` for IDs, amounts, counts, timestamps, serial numbers, and other tabular values.
- Page titles use the dashboard title scale and a maximum of 26px on standard pages.
- Body copy stays in the existing 14px to 15px range; supporting text uses `var(--text-mid)`.
- Do not introduce page-specific font families, tracking systems, or heading scales.

## Page Shell

- Use `.header-nav-wrapper`, `.app-header`, `.header-container`, `.header-nav`, `.nav-link`, `.user-profile`, and `.avatar` for shared navigation.
- Use a centered content width with 28px desktop gutters and 16px mobile gutters.
- Use `.dashboard-intro`, `.dashboard-title`, and `.dashboard-subtitle` for dashboard/workspace introductions.
- Keep sections separated by whitespace. Avoid nested cards unless the inner surface is a distinct editable or operational unit.

## Buttons

- `.btn-primary`: main action on a page or form.
- `.btn-secondary`: outlined alternative action.
- `.btn-ghost`: low-emphasis navigation or clearing action.
- `.btn-danger`: destructive action.
- `.btn-action`: toolbar action such as export or refresh.
- `.btn-icon`: icon-only action with an accessible label.

Buttons need a visible focus state, a minimum 38px height, a short verb-led label, and no inline color definitions. Do not create another page-specific primary button style.

## Badges And Status

- Use `.badge` with `.badge-green`, `.badge-amber`, `.badge-red`, `.badge-blue`, or `.badge-slate`.
- Existing aliases `.status-pill`, `.status-badge`, `.pill`, and `.sa-status` must use the same rounded status treatment.
- Status text describes state, not action: `Active`, `Pending`, `Failed`, `Submitted`.
- Green means successful/active, amber means waiting/review, red means failed/blocked, slate means neutral, and blue means informational.

## Tables

- Use `.table-card` or `.content-card` as the single table surface and `.table-responsive` for overflow.
- Use `.payouts-table` as the preferred class. Legacy tables must match its header, cell padding, typography, hover state, and border rhythm.
- Headers are uppercase, 11px, bold, and use `--bg-th`.
- IDs, amounts, counts, and machine serials use `.font-mono` or `var(--font-mono)`.
- Tables must remain usable on mobile. Prefer horizontal scrolling for dense data; do not reduce text below readable sizes.
- Row actions must not make the entire row appear clickable unless the row itself navigates.

## Forms And Settings

- Use shared input rules from `dashboard-style.css` for inputs, selects, and textareas.
- Labels are visible and placed above controls. Supporting hints use `--text-mid`.
- Use teal focus rings and `--border-mid` for resting borders.
- Group related settings under clear section headings, not decorative nested cards.
- Save actions belong at the end of the relevant section; destructive actions are separated and confirmed.

## Responsive And Accessibility

- Test at 1440px, 1024px, 768px, and 390px widths.
- Navigation and toolbars may wrap or scroll horizontally; content must never overflow the viewport.
- Every icon-only control needs an `aria-label` or visible accessible name.
- Preserve keyboard focus visibility and meaningful focus order.
- Respect `prefers-reduced-motion: reduce`; no interaction may depend on animation to reveal content.

## Review Checklist

- Does the page load `dashboard-style.css` and use shared navigation?
- Are colors, radii, and spacing token-based?
- Do primary, secondary, danger, and icon actions match dashboard buttons?
- Do statuses match the shared pill variants?
- Does the table match `.payouts-table` density and mobile behavior?
- Are IDs and amounts monospaced?
- Are empty, error, loading, and success states present where needed?
- Are there no new `--sa-*`, `--brand`, `--accent`, `--t1`, or hard-coded component colors in new markup?

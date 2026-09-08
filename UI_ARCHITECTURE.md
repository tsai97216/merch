# UI Architecture / Redesign Baseline

> Purpose: record the shared UI architecture baseline before the whole-site redesign. This is a planning and maintenance document, not a replacement for `RULES.md`.

## Scope

Target pages:

- Home
- Collection
- Statistics
- Add
- Shipping
- Management
- Settings
- Item Detail

Shared UI surfaces:

- Navigation
- Header
- Card
- Panel
- Button
- Badge
- Input / Select
- Modal / Dialog
- Toast
- Loading / Empty / Error states

## Architectural goals

1. Keep Store as the single source of UI/data state.
2. Establish one shared visual language instead of page-specific visual patches.
3. Define shared design tokens before page-level refinement.
4. Prefer shared components/utilities over duplicated selectors and markup.
5. Keep Light/Dark behavior in shared theme tokens and components.
6. Treat Desktop/Tablet/Mobile as first-class layouts.
7. Preserve existing behavior while redesigning presentation.
8. Do not use CSS overrides, DOM hacks, delayed execution, duplicate listeners, or extra conditionals to hide root causes.
9. Preserve Loading / Empty / Error distinctions.
10. Keep accessibility states explicit: hover, focus-visible, disabled, loading, and readable contrast.

## Redesign phases

### Phase 0: Inventory

- [x] Inventory global CSS and design tokens.
- [x] Inventory shared selectors/components.
- [x] Inventory page-specific duplicated styles.
- [x] Inventory legacy selectors and obsolete visual rules.
- [x] Map each shared UI surface to its current implementation.
- [x] Record conflicts before changing them.

### Phase 1: Shared foundation

- [x] Define color/theme tokens for Light and Dark.
- [ ] Define typography scale.
- [ ] Define spacing scale.
- [ ] Define radius/elevation rules.
- [ ] Define control heights and interaction states.
- [ ] Define responsive breakpoints/layout rules.

### Phase 2: Shared components

- [ ] Navigation / Header
- [ ] Button
- [ ] Input / Select
- [ ] Card / Panel
- [ ] Badge
- [ ] Modal / Dialog
- [ ] Toast
- [ ] Loading / Empty / Error

### Phase 3: Page migration

- [ ] Home
- [ ] Collection
- [ ] Statistics
- [ ] Add
- [ ] Shipping
- [ ] Management
- [ ] Settings
- [ ] Item Detail

### Phase 4: Verification

- [ ] TypeScript/build verification.
- [ ] Data/schema/Worker verification when affected.
- [ ] Light mode verification.
- [ ] Dark mode verification.
- [ ] Desktop verification.
- [ ] Mobile verification.
- [ ] Keyboard/focus verification.
- [ ] Modal/detail lifecycle verification.
- [ ] No regression in Collection filtering/sorting/search.
- [ ] No regression in Add/Edit/Delete/Shipping flows.

## Known issues to keep visible during redesign

- Collection sort selector readability in Dark mode.
- Rounded-corner consistency in Dark mode.
- Home character-ranking text visibility.
- Statistics/Add/Shipping form presentation issues.
- Popup/modal visual consistency.
- Mobile Statistics/Management/Settings layout quality.
- Desktop title/layout alignment issues.
- Item Detail modal lifecycle and presentation.

These are tracked in `TODO.md`; this document records the architecture work needed to resolve them systematically rather than with isolated patches.

## Change rule

If redesign work reveals a confirmed architectural defect, record it in `TODO.md` before modifying or deleting the affected implementation, following `RULES.md`.

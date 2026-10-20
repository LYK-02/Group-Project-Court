# Design System — Group Project Court

## 1. Design direction

**Style:** Neo-brutalism  
**Product personality:** student courtroom, DIY zine, arcade-like interactions, confident satire.  
**Core principle:** the courtroom is theatrical; the case files remain readable and usable.

The supplied design-system brief defines cream paper, pure black structure, hot red, vivid yellow, soft violet, Space Grotesk, thick borders, hard shadows, sticker layering, high contrast, and fast mechanical interactions. This file adapts those principles to the product rather than applying maximal decoration to every element.

## 2. Design principles

1. **Playful, not confusing:** humour should never obscure what an action does.
2. **Bold hierarchy:** reserve the loudest color and largest type for verdicts and primary actions.
3. **Structure stays clear:** task lists, evidence, and vote details use predictable alignment.
4. **Tactile interaction:** buttons press down; cards lift subtly; transitions stay fast.
5. **Accessible by default:** keyboard support, contrast, visible focus, and reduced motion.
6. **Responsive from mobile up:** no desktop-only courtroom.

## 3. Tokens

### Colors

| Token | Value | Use |
|---|---|---|
| `--color-canvas` | `#FFFDF5` | Main paper background |
| `--color-ink` | `#000000` | Text, borders, shadows |
| `--color-hot-red` | `#FF6B6B` | Primary actions, urgent verdict emphasis |
| `--color-vivid-yellow` | `#FFD93D` | Secondary actions, highlights |
| `--color-soft-violet` | `#C4B5FD` | Supporting panels and categories |
| `--color-white` | `#FFFFFF` | Cards and contrast panels |

Do not rely on color alone to communicate status. Pair color with text, icons, or labels. Check contrast for each actual text/background combination.

### Typography

- Primary family: `Space Grotesk`, with a system sans-serif fallback.
- Display headings: weight 700–900, tight line-height, often uppercase.
- Body: use 400–700 as appropriate for readable long-form content; do not force every paragraph into heavy weight.
- Labels: bold uppercase with restrained letter spacing.
- Avoid oversized display typography on narrow screens.

Suggested scale:
- Display: responsive `clamp(2.75rem, 8vw, 6.5rem)`.
- H1: `clamp(2.25rem, 5vw, 4rem)`.
- H2: `clamp(1.75rem, 3vw, 2.75rem)`.
- H3: `1.25rem–1.75rem`.
- Body: `1rem–1.125rem`.
- Metadata: at least `0.875rem` where practical.

### Borders and radii

- Main cards: 3–4px solid black.
- Secondary separators: 2px solid black.
- Main corners: sharp (`0px` radius).
- Fully rounded shapes reserved for small pills, circular icons, or stickers.

### Hard shadows

- Small: `4px 4px 0 #000`.
- Medium: `8px 8px 0 #000`.
- Large: `12px 12px 0 #000`.

No blurred shadows in the core neo-brutalist system. Use shadows intentionally; not every element needs the largest shadow.

### Spacing

Use a consistent 4px/8px-based spacing scale. Typical component padding is 16–24px; dashboard sections use 24–40px gaps. Avoid filling every empty area with decoration—negative space helps users scan data.

## 4. Layout and visual language

### Courtroom mode
Used for landing page, case creation, voting, and verdict reveal:
- Oversized case number and headline.
- Red/yellow/violet color blocking.
- Verdict stamp or sticker badge.
- Asymmetric composition and a limited amount of rotation.
- One primary CTA per main panel.

### Case-file mode
Used for task management, evidence, team settings, and history:
- Cream canvas and white panels.
- Strong black borders and clear table/list structure.
- Smaller typography and fewer decorative rotations.
- Clear timestamps, ownership, and status labels.
- No decoration that interferes with evidence or data reading.

## 5. Core pages

### Landing page
- Header with bordered logo: `GROUP PROJECT COURT`.
- Hero headline: “SOMEONE DIDN'T DO THE WORK.”
- Short explanation that this is a playful team poll.
- Primary CTA: `OPEN A CASE`.
- Side illustration made from layered case file cards, stamps, and a gavel-like geometric motif.
- A visible entertainment-only note.

### Dashboard
- Compact navigation with clear active state.
- Summary cards for open cases, tasks, and recent verdicts.
- Recent activity feed.
- A single prominent `NEW CASE` action.
- Avoid making every metric a bright card.

### Team workspace
- Member list, invite controls, task board/list, and activity history.
- Task status labels must include text, not color only.
- Destructive actions require confirmation.

### Case detail
- Case title and status at the top.
- Tabs or sections for summary, evidence, voting, and history.
- Evidence content is readable and clearly labelled as user-submitted.
- Avoid decorative rotations on evidence text itself.

### Voting screen
- Large, clearly labelled vote options.
- One selection state is visually obvious.
- Explain whether votes can be changed and when voting closes.
- Keyboard-operable controls.

### Verdict screen
- Oversized verdict title and bold sticker stamp.
- Tally breakdown and rule explanation.
- Share action separate from the result.
- Public-share status and revocation control.
- Include an entertainment-only disclaimer.

### Public verdict
- Show only approved summary fields.
- Never display private evidence, emails, invite codes, or internal audit metadata.
- Include a clear note that the result is a team poll, not an official finding.

## 6. Component rules

### Buttons
- Rectangular, sharp corners, 3–4px black border.
- Primary: red; secondary: yellow; neutral: white.
- Height at least 44px; primary actions typically 48–56px.
- Bold uppercase label, but do not uppercase long sentences.
- Hard shadow of 4–6px.
- Hover: small lift or color change.
- Active: translate 2px and reduce shadow.
- Disabled state must remain legible and not look clickable.
- Provide visible keyboard focus.

### Cards
- White or cream surface, black border, hard shadow when emphasis is needed.
- Hover lift only for interactive cards.
- Avoid hover-only information.
- Use consistent padding and heading hierarchy.

### Inputs
- White background, black 3–4px border, sharp corners.
- Clear visible label and helpful validation message.
- Focus state can switch to yellow and use a hard shadow.
- Do not rely on placeholder text as the only label.
- Preserve browser/autofill usability.

### Badges
- Square or pill shape.
- Use sparingly for case status, role, or verdict category.
- Pair icon/color with readable text.

### Tables and lists
- High contrast headers, clear row dividers, responsive overflow or mobile card layout.
- Do not rotate rows or important data.
- Add pagination for long lists.

### Dialogs
- Strong border and hard shadow.
- Focus trap, Escape behavior where appropriate, and focus restoration.
- Clear cancel and confirm actions.
- Destructive confirmation names the action.

## 7. Motion

- Button press: approximately 100ms.
- Card hover: approximately 150–200ms.
- Verdict reveal: brief stamp/scale effect; never delay access to the result.
- Avoid constant movement in dense dashboards.
- Respect `prefers-reduced-motion: reduce`.
- Do not communicate state only through animation.

## 8. Texture and decoration

Allowed motifs:
- Halftone dots, grid patterns, stars, arrows, case stamps, tape strips, paper labels.
- Use texture in the hero, landing page, empty states, or section backgrounds.
- Keep decorative layers behind content and mark them `aria-hidden="true"` when appropriate.
- Avoid expensive full-screen SVG noise filters if a simple CSS pattern works.
- No blur, glassmorphism, or smooth gradient fades in the primary design language.

## 9. Responsive rules

- Mobile-first; test at 320px, 375px, 768px, 1024px, and wide desktop.
- One-column layout on narrow screens.
- Sidebar collapses into a labelled menu.
- Buttons may become full width on mobile.
- Keep touch targets at least 44×44px.
- Prevent horizontal overflow.
- Reduce shadow offsets and decorative overlap on small screens.
- Preserve the bold visual style at all widths.

## 10. Accessibility

- Use semantic HTML and correct heading order.
- All controls work with keyboard only.
- Visible focus indicators are mandatory.
- Maintain WCAG AA contrast: 4.5:1 for normal text and 3:1 for large text and relevant UI boundaries.
- Do not use color alone for status.
- Icon-only buttons need accessible names.
- Forms need labels and field-specific error text.
- Respect reduced motion.
- Announce dynamic verdict/status updates accessibly.
- Avoid flashing effects.

## 11. Design anti-patterns

- Making every card, label, and paragraph visually loud.
- Using rotations on text users must read carefully.
- Huge headings that break mobile layouts.
- Low-contrast colored text on red, yellow, or violet.
- Decorative patterns behind dense content.
- Hover-only actions.
- Fake disabled states or buttons without behavior.
- Using public shame or alarming language without context.
- Publishing private evidence in the public verdict view.

## 12. Implementation rules

- Centralize tokens in CSS variables and map them into Tailwind configuration/utilities.
- Create reusable components: `Button`, `Badge`, `Card`, `FormField`, `StatusLabel`, `ConfirmDialog`, `CaseHeader`, `EvidenceItem`, and `VerdictStamp`.
- Avoid repeated one-off hex values and arbitrary shadows throughout components.
- Keep styling conventions consistent with the installed Tailwind version.
- Verify actual package versions before using version-specific config examples.
- Test at least one representative page in desktop and mobile layouts before replicating patterns.

## 13. Definition of design done

- [ ] Uses shared tokens.
- [ ] Matches the page's intended mode (courtroom or case-file).
- [ ] Responsive and has no horizontal overflow.
- [ ] Keyboard focus and semantic labels work.
- [ ] Loading, empty, error, success, and disabled states are designed.
- [ ] Contrast and reduced motion are checked.
- [ ] No private data is shown in public views.
- [ ] Interactions are real, not decorative-only.

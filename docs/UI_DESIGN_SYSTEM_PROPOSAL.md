# Feasty UI design-system proposal

## Approval gate

This proposal is the visual-system step required before applying the attached global UI specification across the application. No page-level propagation should begin until the accent choice, tokens, and core component treatment are approved.

## Proposed visual direction

The console will use a restrained native-operations aesthetic rather than a marketing-style dashboard. The layout will rely on whitespace, typography, elevation, and clear operational state. The existing Feasty orange remains the identity accent because it is already present in the approved brand assets. It will be used for one primary action per view, active navigation, and selected state indicators. It will not be used as a decorative card fill or as a general-purpose highlight.

The current homepage information architecture remains unchanged during this pass. This proposal only standardizes visual tokens, component behavior, dense data views, accessibility, and motion.

## Semantic color tokens

All components will reference semantic CSS custom properties. No component-level raw hex values will be permitted after migration.

| Token | Light value | Dark value | Usage |
|---|---|---|---|
| `--bg-base` | `#FFFFFF` | `#000000` | App background |
| `--bg-elevated-1` | `#F9F9FB` | `#1C1C1E` | Cards and panels |
| `--bg-elevated-2` | `#F2F2F7` | `#2C2C2E` | Modals, popovers, dropdowns |
| `--bg-elevated-3` | `#E5E5EA` | `#3A3A3C` | Nested and hover states |
| `--separator` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` | Hairline separators |
| `--text-primary` | `rgba(0,0,0,0.92)` | `rgba(255,255,255,0.92)` | Headings and primary content |
| `--text-secondary` | `rgba(0,0,0,0.55)` | `rgba(255,255,255,0.55)` | Supporting copy and labels |
| `--text-tertiary` | `rgba(0,0,0,0.30)` | `rgba(255,255,255,0.30)` | Placeholder and disabled text |
| `--accent` | `#FF611D` | `#FF611D` | Feasty primary action and active state |
| `--accent-contrast` | `#FFFFFF` | `#FFFFFF` | Text on accent controls |
| `--success` | `#248A3D` | `#30D158` | Actual success state only |
| `--warning` | `#9A6700` | `#FFD60A` | Actual warning state only |
| `--danger` | `#C9342C` | `#FF453A` | Actual destructive/error state only |
| `--info` | `#FF611D` | `#FF611D` | Informational state, same as accent |
| `--focus-ring` | `rgba(255,97,29,0.35)` | `rgba(255,97,29,0.45)` | Keyboard focus ring |
| `--backdrop` | `rgba(0,0,0,0.40)` | `rgba(0,0,0,0.40)` | Modal backdrop |

### Elevation rules

`--bg-base` is the page surface. Direct cards use `--bg-elevated-1`. A popover or modal uses `--bg-elevated-2`. Nested hover or selection surfaces use `--bg-elevated-3`. Cards will have no decorative shadows and no hard borders; nested surfaces may use one `--separator` hairline.

## Typography tokens

One system family will be used across the application:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
```

| Token | Size | Weight | Line height | Usage |
|---|---:|---:|---:|---|
| `--type-caption` | 12px | 400 | 1.4 | Metadata, helper text |
| `--type-body` | 14px | 400 | 1.5 | Body copy and table secondary text |
| `--type-control` | 16px | 600 | 1.4 | Buttons and important controls |
| `--type-section` | 20px | 600 | 1.2 | Panel headings |
| `--type-page` | 24px | 600 | 1.2 | Page titles |
| `--type-display` | 32px | 600 | 1.2 | Reserved for the primary homepage state |

Only weights 400 and 600 will be used. Labels will use sentence case. All-caps labels currently present in the shell will be converted to sentence case during propagation.

## Spacing and layout tokens

All spacing is based on an 8px grid:

```css
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 48px;
--space-6: 64px;
```

Layout tokens:

```css
--content-max: 1280px;
--page-gutter: 32px;
--page-gutter-mobile: 16px;
--control-height: 36px;
--control-height-compact: 28px;
--radius-control: 8px;
--radius-card: 12px;
--radius-modal: 16px;
--table-row-height: 40px;
```

The content area will be centered with a maximum width. Dense data views may use the full content width within that centered container, but will not stretch indefinitely on large screens.

## Reusable components

### Buttons

- `ButtonPrimary`: one visually dominant action per view, `--accent` background, white text.
- `ButtonSecondary`: `--bg-elevated-2` background and primary text.
- `ButtonDestructive`: danger treatment for revoke, cancel, delete, or irreversible stop actions.
- `ButtonGhost`: transparent, text-only, low-emphasis action.
- `ButtonCompact`: 28px table-row action variant.

Every button has default, hover, pressed, focus, and disabled states. Focus uses `--focus-ring`, not a shadow-heavy glow.

### Inputs and validation

- `Field`: label above control, 14px secondary text.
- `TextInput`, `Select`, `Textarea`: `--bg-elevated-1`, one separator hairline, 8px radius.
- `InlineValidation`: 12px danger or success text below the field while typing.
- `FormActions`: one primary action, one secondary cancel/back action.

### Cards and panels

- `Card`: `--bg-elevated-1`, 12px radius, no decorative shadow.
- `CardHeader`: title, supporting description, optional action aligned consistently.
- `Inset`: nested content uses `--bg-elevated-2` and never repeats the parent surface.

### Status and feedback

- `StatusBadge`: 12px text, status-color background at 12% opacity, full-opacity status text, and a text label.
- `InlineAlert`: actual warning, error, success, or informational event only.
- `Toast`: one consistent location, bottom-right, 8px radius, four-second success dismissal, persistent errors until dismissed.
- `EmptyState`: single muted icon, 16px semibold headline, 14px secondary body, and at most one primary action.

### Tables

Used by leads, automations, audit, and conversations:

- 40px row height.
- Sticky header.
- No zebra striping.
- Hover row highlight using `--bg-elevated-1`.
- Monospace only for IDs, timestamps, numeric values, and machine statuses.
- Row actions appear on hover and remain keyboard reachable.
- Real pagination remains visible.
- Compact actions use the 28px control height.

### Dialogs

Dialogs use `--bg-elevated-2`, 16px radius, a 40% black backdrop, and a 150–200ms scale/fade entrance. Destructive dialogs include one-line consequence text before confirmation.

## Accessibility contract

Every interactive element must have a visible keyboard focus state. Status must never be communicated through color alone: badges contain text and, where useful, an icon. The final implementation will run a contrast review against the semantic light and dark tokens. Touch targets will remain at least 44px on mobile even when the visual control is 36px on desktop.

## Motion contract

Transitions use 150–200ms ease-out. No transition exceeds 300ms. There are no decorative pulses or infinite animations. Loading animation is reserved for actual loading states. Page navigation will not slide or wipe.

## Static component preview

### Buttons

```text
[ Primary action ]   [ Secondary action ]   [ Destructive action ]   Ghost action
```

Primary action uses Feasty orange. Secondary action uses the elevated-2 surface. Destructive action uses the danger semantic token. Ghost action has no background.

### Input

```text
Account handle
[ @feasty-demo                                      ]
Helper or inline validation appears here while typing.
```

### Card

```text
Sender account                                      Healthy
Primary sender
Stable browser profile and route are configured.

Cold cap                              5 messages
Working hours                        09:00–17:00
```

The card uses one elevated surface and no decorative gradient.

### Status badge

```text
● Healthy       ● Needs review       ● Paused       ● Failed
```

The text remains visible in monochrome review; color reinforces the meaning but does not carry it alone.

### Dense table row

```text
| 10:42:18 | @sampletruck | Partial review | 1,240 | Review | ... |
```

The header is sticky, row height is 40px, IDs/times/numbers use the secondary monospace style, and row actions reveal on hover or keyboard focus.

## Propagation order after approval

The visual system should be applied in this order, with a browser review after each page:

1. Global shell, navigation, top health strip, and theme tokens.
2. Dashboard home.
3. Accounts and routing.
4. Research and leads.
5. Campaigns.
6. Inbox and conversations.
7. Automations and dense jobs table.
8. Audit log.
9. Settings and developer access.
10. Auth, dialogs, toasts, empty states, and responsive QA.

## Approval questions

1. Approve Feasty orange `#FF611D` as the single accent, or replace it with a specific blue value.
2. Approve the semantic light/dark token values above.
3. Approve the component preview and propagation order.
4. Confirm whether the existing homepage information architecture should remain unchanged during the visual pass, as the attached specification requests.

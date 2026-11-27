# vue-odontogram

Interactive dental chart component for Vue 3. Port of [react-odontogram](https://github.com/biomathcode/react-odontogram) with a Vue-idiomatic API.

## Installation

```bash
npm install vue-odontogram
# or
pnpm add vue-odontogram
```

Peer dependency: Vue 3.5+

## Quick start

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Odontogram } from "vue-odontogram";
import "vue-odontogram/style.css";

const selected = ref<string[]>([]);

function onChange(details) {
  console.log(details);
}
</script>

<template>
  <Odontogram
    v-model:selected="selected"
    theme="light"
    notation="FDI"
    @change="onChange"
  />
</template>
```

## Global registration

```ts
import { createApp } from "vue";
import { VueOdontogram } from "vue-odontogram";
import "vue-odontogram/style.css";

const app = createApp(App);
app.use(VueOdontogram);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selected` | `string[]` | — | Controlled selection via `v-model:selected` |
| `defaultSelected` | `string[]` | `[]` | Initial selection when uncontrolled |
| `singleSelect` | `boolean` | `false` | Allow only one tooth at a time |
| `name` | `string` | `'teeth'` | Hidden input name for native forms |
| `class` | `string` | `''` | Wrapper CSS class |
| `theme` | `'light' \| 'dark'` | `'light'` | Built-in color theme |
| `colors` | `OdontogramColors` | `{}` | Override CSS variables |
| `notation` | `'FDI' \| 'Universal' \| 'Palmer'` | `'FDI'` | Tooth label notation in SVG `<title>` |
| `palmerStyle` | `'text' \| 'symbol'` | `'text'` | Palmer display: `6UR` (text) or `6⌋` (grid corner symbol) |
| `tooltipPlacement` | `Placement` | `'top'` | Tooltip anchor placement |
| `tooltipMargin` | `number` | `10` | Tooltip offset from tooth |
| `showTooltip` | `boolean` | `true` | Show hover/focus tooltip |
| `showHalf` | `'full' \| 'upper' \| 'lower'` | `'full'` | Render full arch or half |
| `maxTeeth` | `number` | `8` | Teeth per quadrant |
| `archHeight` | `number` | auto (from `maxTeeth`) | Height of one arch in SVG units (`347` for 8 teeth, `75` for `square`) |
| `chartWidth` | `number` | `409` (`900` for `square`) | Width in SVG units, cropped around the center |
| `showNumbers` | `boolean` | `true` | Show the tooth numbers (follows `notation`) |
| `teethConditions` | `ToothConditionGroup[]` | — | Pre-color teeth by condition |
| `readOnly` | `boolean` | `false` | Disable interaction |
| `showLabels` | `boolean` | `false` | Show condition legend |
| `layout` | `'circle' \| 'square'` | `'circle'` | Arch or linear layout |
| `style` | `CSSProperties` | — | Inline styles on wrapper |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:selected` | `string[]` | Emitted for `v-model:selected` |
| `change` | `ToothDetail[]` | Rich tooth details on every selection change |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `tooltip` | `{ payload?: ToothDetail }` | Custom tooltip content |

```vue
<Odontogram v-model:selected="selected">
  <template #tooltip="{ payload }">
    Tooth {{ payload?.notations.fdi }}
  </template>
</Odontogram>
```

## Exports

```ts
import Odontogram, { Odontogram, getViewBox, VueOdontogram } from "vue-odontogram";
import type { ToothDetail, Notation, Theme } from "vue-odontogram";
```

## Local development

Link into your Vue app while developing:

```bash
# In vue-odontogram
pnpm install
pnpm build
pnpm link --global

# In your Vue app
pnpm link --global vue-odontogram
```

Or install from disk:

```json
{
  "dependencies": {
    "vue-odontogram": "file:../vue-odontogram"
  }
}
```

## Visual styling note

Tooth styling relies on SVG path render order (outline → fill → highlights). Do not reorder paths in `Tooth.vue` without updating `styles.css`.

## License

MIT

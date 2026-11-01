---
"@kashi-ui/react": patch
---

`Slider`: نوع مقدار حالا فقط از `value` یا `defaultValue` حدس زده می‌شود؛ `onChange={setValue}` با state عددی یا بازه دیگر خطای TypeScript نمی‌دهد.

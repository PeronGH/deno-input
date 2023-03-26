# deno-input

Fix full-width input issue with built-in `prompt()`

## usage

```typescript
import { lines } from "./mod.ts";

const { value: nextLine } = await lines.next();
// do something with `nextLine`

for await (const line of lines) {
  // do something with `line`
}
```

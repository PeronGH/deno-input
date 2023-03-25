# deno-input

Fix full-width input issue with built-in `prompt()`

## usage

```typescript
import { input } from "./mod.ts";

const lines = input();

const { value: nextLine } = await lines.next();
// do something with `nextLine`

for await (const line of lines) {
  // do something with `line`
}
```

import { default as eaw } from "npm:eastasianwidth";

export async function* input() {
  Deno.stdin.setRaw(true);
  const stdinStream = Deno.stdin.readable.pipeThrough(new TextDecoderStream());
  const encoder = new TextEncoder();

  let buffer = "";
  let cursorPos = 0; // next char position

  async function moveCursor(xOffset: number) {
    if (xOffset !== 0) {
      const direction = xOffset > 0 ? "C" : "D";
      await Deno.stdout.write(
        encoder.encode(`\x1b[${Math.abs(xOffset)}${direction}`),
      );
    }
  }

  for await (const chunk of stdinStream) {
    const charCode = chunk.charCodeAt(0);
    if (charCode === 3) {
      // ctrl+c
      Deno.exit(0);
    } else if (charCode === 13) {
      // enter
      yield buffer;
      buffer = "";
      await moveCursor(-cursorPos);
      cursorPos = 0;
    } else if (charCode === 127) {
      // backspace
      if (cursorPos > 0) {
        const charWidth = eaw.length(buffer[cursorPos - 1]);
        buffer = buffer.slice(0, cursorPos - 1) + buffer.slice(cursorPos);
        cursorPos -= 1;
        await moveCursor(-charWidth);
        await Deno.stdout.write(encoder.encode("\x1b[K"));
        await Deno.stdout.write(encoder.encode(buffer.slice(cursorPos)));
        await moveCursor(-eaw.length(buffer.slice(cursorPos)));
      }
    } else if (charCode === 27) {
      // esc
      const keyType = chunk.slice(1);
      if (keyType === "[C") {
        // right
        if (cursorPos < buffer.length) {
          const charWidth = eaw.length(buffer[cursorPos]);
          cursorPos += 1;
          await moveCursor(charWidth);
        }
      } else if (keyType === "[D") {
        // left
        if (cursorPos > 0) {
          const charWidth = eaw.length(buffer[cursorPos - 1]);
          cursorPos -= 1;
          await moveCursor(-charWidth);
        }
      }
    } else {
      // Normal character input
      buffer = buffer.slice(0, cursorPos) + chunk + buffer.slice(cursorPos);
      cursorPos += chunk.length;
      await Deno.stdout.write(encoder.encode(chunk));
      await Deno.stdout.write(encoder.encode(buffer.slice(cursorPos)));
      await moveCursor(-eaw.length(buffer.slice(cursorPos)));
    }
  }
}

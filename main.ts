import { default as eaw } from "npm:eastasianwidth";

export async function input() {
  Deno.stdin.setRaw(true);
  const stream = Deno.stdin.readable.pipeThrough(new TextDecoderStream());
  const encoder = new TextEncoder();

  let buffer = "";
  for await (const chunk of stream) {
    const charCode = chunk.charCodeAt(0);
    if (charCode === 13) break;
    else if (charCode === 3) Deno.exit(0);
    else if (charCode === 127) {
      // backspace
      if (buffer.length > 0) {
        const lastChar = buffer[buffer.length - 1];
        const width = eaw.length(lastChar);
        await Deno.stdout.write(encoder.encode("\b \b".repeat(width)));
        buffer = buffer.slice(0, buffer.length - 1);
      }
    } else {
      await Deno.stdout.write(encoder.encode(chunk));
      buffer += chunk;
    }
  }

  Deno.stdin.setRaw(false);

  return buffer;
}

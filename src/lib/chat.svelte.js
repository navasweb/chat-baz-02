// chat.svelte.js
const apiHost = "http://flowise-qs0117hpi1w3vunf2ziymdhi.173.212.221.153.sslip.io";
const chatflowId = "1b28bdd2-27ef-41ab-986f-35a4b0927e4e";

let sessionId;
function getSessionId() {
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}${Math.random()
      .toString(36)
      .slice(2)}`;
  }
  return sessionId;
}

let messages = $state([]);
let isLoading = $state(false);

function addMessage(role, content) {
  messages.push({ role, content });
}

async function sendMessage(userText) {
  const trimmed = userText.trim();
  if (!trimmed || isLoading) return;

  addMessage("user", trimmed);
  isLoading = true;

  addMessage("assistant", "");
  const assistantIndex = messages.length - 1;

  try {
    const response = await fetch(`${apiHost}/api/v1/prediction/${chatflowId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: trimmed,
        streaming: true,
        overrideConfig: { sessionId: getSessionId() },
      }),
    });

    console.log("[chat] status:", response.status);
    console.log("[chat] content-type:", response.headers.get("content-type"));

    if (!response.ok || !response.body) {
      throw new Error(`Respuesta no válida (status ${response.status})`);
    }

    const contentType = response.headers.get("content-type") || "";

    // --- CASO 1: NO es streaming → JSON normal ---
    if (!contentType.includes("text/event-stream")) {
      const data = await response.json();
      console.log("[chat] JSON no-stream recibido:", data);
      const text =
        typeof data === "string"
          ? data
          : data.text ?? data.answer ?? data.json ?? JSON.stringify(data);
      messages[assistantIndex].content = text || "(respuesta vacía)";
      return;
    }

    // --- CASO 2: streaming SSE ---
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let streamEnded = false;

    // Procesa un "evento" SSE completo (puede tener varias líneas event:/data:)
    function processEventBlock(block) {
      console.log("[chat] BLOCK CRUDO:", JSON.stringify(block)); // 👈 LOG TEMPORAL

      let eventName = "";
      const dataLines = [];

      for (let line of block.split("\n")) {
        line = line.trim();
        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trim());
        }
      }

      const dataStr = dataLines.join("\n");
      if (!dataStr) return;

      if (dataStr === "[DONE]") {
        streamEnded = true;
        return;
      }

      let payload;
      try {
        payload = JSON.parse(dataStr);
      } catch {
        // data plano (no JSON) → es el token en sí
        messages[assistantIndex].content += dataStr;
        return;
      }

      // El evento puede venir en la línea "event:" o dentro del JSON como payload.event
      const ev = eventName || payload.event;

      switch (ev) {
        case "token": {
          const t =
            typeof payload.data === "string"
              ? payload.data
              : typeof payload === "string"
                ? payload
                : "";
          messages[assistantIndex].content += t;
          break;
        }
        case "end":
          streamEnded = true;
          break;
        case "error":
          throw new Error(payload.data || "Error en el stream.");
        default:
          // Si no hay event pero sí un data con texto, lo intentamos añadir
          if (typeof payload.data === "string") {
            messages[assistantIndex].content += payload.data;
          }
          break;
      }
    }

    while (!streamEnded) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        if (block.trim()) processEventBlock(block);
      }
    }

    if (buffer.trim()) processEventBlock(buffer);

    if (messages[assistantIndex].content === "") {
      messages[assistantIndex].content =
        "No se ha recibido respuesta del asistente. Inténtalo de nuevo.";
    }
  } catch (error) {
    console.error("[chat] Error:", error);
    messages[assistantIndex].content =
      "No se pudo conectar con el asistente. Inténtalo de nuevo.";
  } finally {
    isLoading = false;
  }
}

export const chat = {
  get messages() {
    return messages;
  },
  get isLoading() {
    return isLoading;
  },
  sendMessage,
};

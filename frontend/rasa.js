const RASA_URL = "http://localhost:5005/webhooks/rest/webhook";

export async function sendToRasa(sender, message) {
  const res = await fetch(RASA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender, message }),
  });
  if (!res.ok) throw new Error("Rasa server not reachable.");
  return res.json();
}
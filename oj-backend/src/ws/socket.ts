import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { createClient } from "redis";

export function setupWebSocket(server: Server) {
    const wss = new WebSocketServer({ server });
    const clients = new Map<string, WebSocket>();
    wss.on("connection", (ws) => {
        console.log("Client connected");
        ws.on("message", async (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === "subscribe") {
                clients.set(message.submissionId, ws);
                console.log(`Subscribed to submission ${message.submissionId}`);
                const subscriber = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
                await subscriber.connect();
                await subscriber.subscribe(`verdict:${message.submissionId}`, (msg) => {
                    ws.send(msg);
                    subscriber.unsubscribe();
                    subscriber.quit();
                });
            }
        });
        ws.on("close", () => {
            console.log("Client disconnected");
        });
    });
}
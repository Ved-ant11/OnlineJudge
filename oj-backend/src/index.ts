import app from "./app";
import { connectRedis } from "./redis/client";
import { setupWebSocket } from "./ws/socket";
import { createServer } from "http";
import { startMatchmaker } from "./battle/matchmaker";

const server = createServer(app);
setupWebSocket(server);

connectRedis()
  .then(() => console.log("Redis connected"))
  .catch(console.error);

startMatchmaker();

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

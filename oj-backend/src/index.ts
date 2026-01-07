import app from "./app";
import { connectRedis } from "./redis/client";

connectRedis()
  .then(() => console.log("Redis connected"))
  .catch(console.error);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

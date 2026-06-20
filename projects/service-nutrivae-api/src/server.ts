import { app } from "./app.js";
import { config } from "./config.js";

app.listen(config.API_PORT, () => {
  console.log(`Nutrivae API listening at http://localhost:${config.API_PORT}`);
  console.log(`API docs available at http://localhost:${config.API_PORT}/docs`);
});

import bodyParser from "body-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
//import connectDB from "./config/db";
import { initializeChain } from "./llm/chain";
import completion from "./routes/completion";

const app: Application = express();
const port = process.env.PORT || 4000;

(async () => {
  try {
    const graph = await initializeChain();
    app.set("graph", graph);
  } catch (err) {
    console.error("Error initializing graph:", err);
    process.exit(1);
  }
})();

//connectDB();

app.use(express.json({ limit: "10mb" }));

app.use(bodyParser.json());

app.use(cors());

app.use("/completion", completion);

app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to Express & TypeScript Server");
});

app.listen(port, () => {
  console.log(`Server is run at https://localhost:${port}`);
});

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import citiesRouter from "./routes/cities";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use("/cities", citiesRouter);

export default app;

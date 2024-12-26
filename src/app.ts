import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import citiesRouter from "./routes/cities";
import cityDetailsRouter from "./routes/cityDetails/general";
import hospitalRouter from "./routes/cityDetails/hospital";
import emergencyRouter from "./routes/cityDetails/emergency";
import vaccinesRouter from "./routes/cityDetails/vaccine";
import insuranceRouter from "./routes/cityDetails/insurance";
import ratingsRouter from "./routes/cityDetails/ratings";
import descriptionRouter from "./routes/cityDetails/description";
import generalRatingRouter from "./routes/cityDetails/generalRating";
import commonIllnessRouter from "./routes/cityDetails/commonIllness";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use("/cities", citiesRouter);
app.use("/cityDetails", cityDetailsRouter);
app.use("/hospital", hospitalRouter);
app.use("/emergency", emergencyRouter);
app.use("/vaccine", vaccinesRouter);
app.use("/insurance", insuranceRouter);
app.use("/ratings", ratingsRouter);
app.use("/description", descriptionRouter);
app.use("/generalRating", generalRatingRouter);
app.use("/commonIllness", commonIllnessRouter);

export default app;

require("dotenv").config();
const express = require("express");
const configViewEngine = require("./config/viewEngine");
const apiRoutes = require("./routes/api");
const connection = require("./config/database");
const { getHomepage } = require("./controllers/homeController");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 8080; // Đồng bộ với port 8080

app.use(
  cors({
    origin: "http://localhost:5173", // Frontend chạy trên port 5173 (Vite)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configViewEngine(app);

const webAPI = express.Router();
webAPI.get("/", getHomepage);
app.use("/", webAPI);
app.use("/v1/api/", apiRoutes);

(async () => {
  try {
    await connection();
    console.log("Connected to database");
    app.listen(port, () => {
      console.log(`Backend Nodejs App listening on port ${port}`);
    });
  } catch (error) {
    console.log(">>> Error connect to DB: ", error);
  }
})();
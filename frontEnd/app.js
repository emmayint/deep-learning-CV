const createError = require("http-errors");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const multer = require("multer");
const dotenv = require("dotenv");
const cors = require("cors");
const processImage = require("express-processimage");

dotenv.config();

// Auth packages
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const MySQLStore = require("express-mysql-session")(session);

const signUpRouter = require("./routes/signUp");
const signInRouter = require("./routes/signIn");
const homeRouter = require("./routes/home");
const homeGallaryRouter = require("./routes/gallary")
const homeSummaryRouter = require("./routes/summary")
const testDataSummaryRouter = require("./routes/testSummary")
const defaultRouter = require("./routes/default");
const logoutRouter = require("./routes/logout");
const addExperimentRouter = require("./routes/addExperiment");
const viewExperimentRouter = require("./routes/viewExperiment");
const viewPredictionRouter = require("./routes/viewPrediction");
const prevPredictionRouter = require("./routes/prevPrediction");
const testSummaryDetailRouter = require("./routes/testSummaryDetail");

// // Emma's code
const uploadRouter = require("./routes/upload").router;
const selectModelRouter = require("./routes/selectModel").router;
const paramsRouter = require("./routes/params").router;
const nameModelRouter = require("./routes/nameModel").router;
const loggerRouter = require("./routes/logger");
const cmcellRouter = require("./routes/cmcell");
const viewMoodelsRouter = require("./routes/viewMoodels");
// const predictRouter = require("./routes/predict").router;
// const testFlaskRouter = require("./routes/testFlask").router;

const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(processImage("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(__dirname + '/public'));
// app.use( express.static( "public" ) );
app.use(cors());

// Allow access control, i.e., avoid CORS error
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  next();
});

let options = {
  host: "localhost",
  user: "root",
  password: "980731@muyan",
  database: "csc899"
  // host: process.env.DB_HOST,
  // user: process.env.DB_USERNAME,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME
};

let sessionStore = new MySQLStore(options);

app.use(
  session({
    secret: "refdfssadadsa",
    resave: false,
    store: sessionStore,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", signInRouter);
app.use("/signUp", signUpRouter);
app.use("/home", homeRouter);
app.use("/gallary", homeGallaryRouter);
app.use("/summary", homeSummaryRouter);
app.use("/testSummary", testDataSummaryRouter);
app.use("/logout", logoutRouter);
app.use("/addExperiment", addExperimentRouter);
app.use("/viewExperiment", viewExperimentRouter);
app.use("/prediction", viewPredictionRouter);
app.use("/prevprediction", prevPredictionRouter);
app.use("/default", defaultRouter);
app.use("/testSummaryDetail", testSummaryDetailRouter);

// // Emma's code
app.use("/upload", uploadRouter);
app.use("/selectModel", selectModelRouter);
app.use("/params", paramsRouter);
app.use("/nameModel", nameModelRouter);
app.use("/logger", loggerRouter);
app.use("/cmcell", cmcellRouter);
app.use("/viewMoodels", viewMoodelsRouter);

// app.use("/predict", predictRouter);
// app.use("/testFlask", testFlaskRouter);
app.get("/predict", (req, res) => {
  res.redirect("http://localhost:8000/static/predict-with-visuals.html");
});
app.get("/", (req, res) => {
  res.render("home");
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

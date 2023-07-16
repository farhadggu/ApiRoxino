const mongoose = require("mongoose");

const app = require("./app");
const consoleMessage = require("./utils/console.util");

// ROUTES
const UserRoutes = require("./routes/UserRoute");
app.use("/api", UserRoutes);

/* database connection */
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.ATLAS_URI, {
    dbName: "test",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => consoleMessage.successMessage("DB connection established."))
  .catch((error) => consoleMessage.errorMessage(error.message));

/* establish server port */
app.listen(process.env.PORT, () => {
  consoleMessage.successMessage(`App listening on ${process.env.PORT}.`);
});

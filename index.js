const express = require("express");
const app = express();
const users = require("./routes/users");
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use("/users", users);

process.on("uncaughtException", (err) => {
  console.log("uncaught Exception", err);
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  console.log("unhandled Rejection", err);
  process.exit(1);
});
process.on("warning", (e) => console.warn(e.stack));

app.listen(PORT, () => console.log(`App running on PORT: ${PORT}`));

require("dotenv").config();


console.log("JWT_SECRET:", process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const app = express();
connectDB();

// ✅ THIS IS THE ONLY CORS YOU NEED
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/blogs", require("./routes/blog"));

app.use("/api/users", require("./routes/users"));
app.use("/api/tickets", require("./routes/tickets"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
});

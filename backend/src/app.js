require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

const uploadRoutes = require('./routes/uploadRoutes');

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/api/upload', uploadRoutes);

app.get("/api/test", (req, res) => {
  res.send("API working");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

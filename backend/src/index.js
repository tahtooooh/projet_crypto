BigInt.prototype.toJSON = function () { return Number(this); };

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const adminRoutes = require("./routes/admin");
const productRoutes = require("./routes/products");
const venteRoutes = require("./routes/ventes");
const historyRoutes = require("./routes/history");
const qrcodeRoutes = require("./routes/qrcode");
const mlRoutes = require("./routes/ml");

const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "..", "..", "frontend")));

app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ventes", venteRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/qrcode", qrcodeRoutes);
app.use("/api/ml", mlRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`TraceChain Backend lancé sur http://localhost:${PORT}`);
});

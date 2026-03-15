const dotenv = require("dotenv");
const connectDB = require("./config/db");
const KeepAlive = require("./utils/keepAlive");
const app = require("./app");

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  const keepAlive = new KeepAlive();
  setTimeout(() => keepAlive.start(), 10000);
});

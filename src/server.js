const app = require("./app");
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Welcome  the Workshop Booking APwerwewqrerI");

});


app.listen(PORT, () => {
  console.log(`Server running on  http://localhost:${PORT}`);
})

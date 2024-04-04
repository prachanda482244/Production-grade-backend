import connectToDb from "./db/connect.js"
import app from "./app.js"

connectToDb()
  .then(() => {
    app.on("error", (err) => {
      console.error(err)
      throw err
    })
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server running")
    })
  })
  .catch((err) => {
    console.error("Error:", err)
  })

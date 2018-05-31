const express = require("express")
const app = express()

const port = 5023

app.get("/", (req,res) => res.send("Hello, World!"))

app.listen(port, () => console.log("Running server on port: " + port))

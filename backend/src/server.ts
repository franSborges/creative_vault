import express from 'express'
import dontenv from 'dotenv'

dontenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3000

app.use(express.json())

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        application: "creative-vault-api",
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
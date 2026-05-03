import express from "express"
import { callAgent } from "./agent.js"
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(express.static("public"))
app.use(express.json(), cors())

// test endpoint
app.get("/api/", (req, res) => {
    res.json({ status: "OK" })
})

// port waar de server op draait
const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Server on http://localhost:${port}`))

// endpoint waar de agent wordt gecalled
app.post("/api/chat", async (req, res) => {
    const { prompt, userId = 'default' } = req.body
    console.log(`user ${userId} heeft deze vraag: ${prompt}`)
    const result = await callAgent(prompt, userId)
    

    const assistantMessage = typeof result === 'object' && result !== null
        ? { role: 'assistant', content: result.message, image: result.image ?? null, toolsUsed: result.toolsUsed }
        : { role: 'assistant', content: result, toolsUsed: [] }

    res.json({
        messages: [
            { role: 'user', content: prompt },
            assistantMessage
        ]
    })
})


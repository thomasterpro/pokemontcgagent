import { tool } from "langchain";
import { AzureOpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});

const vectorStore = await FaissStore.load("./documents", embeddings);
console.log("✅ vector store loaded!")

// tool om in het document van de pokemon tcg regels te zoeken
export const retrieve = tool(
    async ({ query }) => {
        console.log("🔧 ik zoek in de documentatie!");
        const relevantDocs = await vectorStore.similaritySearch(query, 2);
        const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");
        return context;
    },
    {
        name: "retrieve",
        description: "Retrieve information related to the pokemon tcg",
        schema: {
            type: "object",
            properties: { query: { type: "string" } },
            required: ["query"]
        }
    }
);

// tool waarmee de agent op het internet kan zoeken
export const searchTaverly = tool(
    async ({ query, maxResults }) => {
        console.log(`🔧  Ik zoek op het web!`)
        const res = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.TAVILY_API_KEY}`,
            },
            body: JSON.stringify({
                query,
                max_results: maxResults,
                search_depth: "basic",        
                include_answer: true,         
            }),
        });

        const data = await res.json();
        return data;
    },
    {
        name: "search_taverly",
        description: "Search for information using Tavily",
        schema: {
            type: "object",
            properties: {
                query: { type: "string" },
                maxResults: { type: "number" },
            },
            required: ["query", "maxResults"],
        },
    },
);

// tool waarmee de agent een dobbelsteen kan rollen
export const rollDice = tool(
    ({ sides }) => {
        console.log(`🔧  Ik rol een ${sides}-sided dobbelsteen!`)
        const result = Math.floor(Math.random() * sides) + 1
        return `Ik gooide een ${result}`
    }, {
    name: "roll_dice",
    description: "Roll a dice with a given number of sides",
    schema: {
        type: "object",
        properties: {
            sides: { type: "number" }
        },
        required: ["sides"]
    }
});

// tool waarmee de agent een coin kan flippen om de startspeler te bepalen
export const coinFlip = tool(
    () => {
        console.log(`🔧  Ik gooi een munt!`)
        const result = Math.floor(Math.random() * 2) + 1
        if (result === 1) {
            return `Ik gooide kop`
        } else {
            return `Ik gooide munt`
        }
    }, {
    name: "coin_flip",
    description: "Flip a coin",
    schema: {
        type: "object",
        properties: {
            sides: { type: "number" }
        },
        required: ["sides"]
    }
});
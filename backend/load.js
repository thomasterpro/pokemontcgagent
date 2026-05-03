import { AzureOpenAIEmbeddings, AzureChatOpenAI } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const prompt = "How many energy cards can I use in my turn?";

// vector store laden
const embeddings = new AzureOpenAIEmbeddings({
  temperature: 0,
  azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
})
const vectorStore = await FaissStore.load("./documents", embeddings);
console.log("✅ vector store loaded!")

// zoek relevante documenten
const relevantDocs = await vectorStore.similaritySearch("who is the enemy of hamster pip", 1);
const context = relevantDocs.map(doc => doc.pageContent).join("\n\n")
console.log("✅ found relevant documents!")

// vraag stellen aan chatGPT4.1
const model = new AzureChatOpenAI({ temperature: 0.2 })
const response = await model.invoke(`You are being asked the following question : ${prompt}, answer by reading this text ${context}.`);

console.log(response.content)
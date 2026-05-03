import { TextLoader } from "@langchain/classic/document_loaders/fs/text"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { AzureOpenAIEmbeddings, AzureChatOpenAI } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

import { FaissStore } from "@langchain/community/vectorstores/faiss";

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME
});



// laad tekstbestand
const loader = new TextLoader("./public/tcgrules.txt")
const docs = await loader.load()

// opsplitsen
const textSplitter = new RecursiveCharacterTextSplitter({chunkSize: 1000, chunkOverlap: 200 });
const chunks = await textSplitter.splitDocuments(docs);

// log
console.log(`Er zijn ${chunks.length} chunks. De eerste chunk is:`);
console.log(chunks[0]);

const vectorStore = new FaissStore(embeddings, {});
await vectorStore.addDocuments(chunks);
await vectorStore.save("./documents");
console.log("✅ vector store saved!")

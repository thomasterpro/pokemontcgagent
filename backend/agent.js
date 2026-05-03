import { AzureChatOpenAI } from "@langchain/openai"
import { createAgent } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { rollDice, searchTaverly, retrieve, coinFlip } from "./tools.js";
import * as z from "zod";

// schema van de respone van de tool
const myToolResponse = z.object({
    message: z.string().describe("The message to the user"),
    image: z.string().describe("An optional image to send to the user if they ask about the layout of a pokemon card. If you return the image, use this exact value: pokemonCardExample.png. If they ask about the layout of a trainer card, use this exact value: trainerCardExample.png. If the user flips a coin that landed heads, use this exact value: zardCoin.png. If the user flips a coin that landed tails, use this exact value: backCoin.png. If you don't need to return an image, return the value as: null"),
    toolsUsed: z.array(z.string()).describe("List with names of tools used in the response, without the word function")
});

// model en memorysaver aanmaken
const checkpointer = new MemorySaver();
const model = new AzureChatOpenAI({ temperature: 0.4 });

// agent aanmaken en tools, schema en systemprompt meegeven
const agent = createAgent({
    model,
    tools: [rollDice, searchTaverly, retrieve, coinFlip],
    responseFormat: myToolResponse,
    checkpointer,
    systemPrompt: "You are an assistant, you can use the retrieve tool to get info on the pokemon tcg and you always want to use it first, you can fact check your answer with the searchTaverly tool if in doubt. The tool coinFlip can be used to flip a coin, to see who starts, the roll_dice tool can be used to roll for damage, if neccesary. If the user asks for information about the layout or values of a pokemon card, you can tell them where they can find it and in the same message return pokemonCardExample.png or trainerCardExample.png to help show the user where they can find the asked information. If you are not able to find the neccesary information you can use searchTaverly to search the web for the answer, but try to avoid using it too much.",
});

// functie waar agent een prompt ontvangt en een response returnt
export async function callAgent(prompt, userId = 'default') {
    try {
        const result = await agent.invoke(
            { messages: [{ role: "user", content: prompt }] },
            { configurable: { thread_id: userId } }
        );
        return result.structuredResponse;
    } catch (error) {
        console.error("Azure OpenAI error:", error);
        return "Sorry, the assistant is currently unavailable.";
    }
}


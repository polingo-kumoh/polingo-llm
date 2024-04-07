// index.mjs
import { LLM } from "llama-node";
import { LLamaCpp } from "llama-node/dist/llm/llama-cpp.js";
import express from "express";
import bodyParser from "body-parser";

import path from "path";

const model = path.resolve(process.cwd(), "model/airoboros-13b-gpt4.ggmlv3.q4_0.bin");
const llama = new LLM(LLamaCpp);
const config = {
    modelPath: model,
    enableLogging: true,
    nCtx: 1024,
    seed: 0,
    f16Kv: false,
    logitsAll: false,
    vocabOnly: false,
    useMlock: false,
    embedding: false,
    useMmap: true,
    nGpuLayers: 0
};

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.listen(3000, async () => {
    console.log("server is running")
    await llama.load(config);
})

app.post("/ask", async (req, res) => {
    const template = req.body.query;


    const prompt = `
System :You are an English grammar analyzer. Analyze the sentence according to [ASSISTANT] below.
ASSISTANT : 1. You reply in JSON format with the field 'grammers'. 2. Analyze user questions according to their format. 3. Analyze with reference to examples. 4. Individually analyze each major component (nouns, verb phrases, adjectives, etc.) in the sentence, explaining their grammatical role and function within the sentence. 5.For each analyzed element, describe how it contributes to the formation of the sentence's meaning in detail. 
Example Question : 'Ukraine’s frontline brigades are clinging on.' 
Example Answer : {"grammers":[{"grammer":"'brigades': A plural noun used to denote large groups or units of soldiers. This term specifically refers to multiple military groups, suggesting a collective effort or action within the context of Ukraine’s military operations."},{"grammer":"'are clinging on': This present continuous tense ('Be + V-ing') represents an ongoing action or state, indicating persistence or continuation. It translates to 'holding on' or 'enduring,' suggesting that the brigades are maintaining their position or persisting without giving up in the face of challenges."}]}
Format : {"grammers" : [{"grammer" : "..."}]}
User: ${template}
    `;

    var result = ""


    await llama.createCompletion({
        nThreads: 4,
        nTokPredict: 2048,
        topK: 40,
        topP: 0.1,
        temp: 0.2,
        repeatPenalty: 1,
        prompt,
    }, (response) => {
        result += response.token
    });
    res.json({ answer: result });
})

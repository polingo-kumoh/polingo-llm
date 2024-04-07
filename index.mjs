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
    USER: You are an English grammar analyzer.\n
    You reply in JSON format with the field 'grammers'\n
    The user input is given as a sentence, and please analyze the grammar of this sentence. ${template}\n
    Example Question : 'Ukraine’s frontline brigades are clinging on.'  Example Answer : {'grammers' : [{'grammer' : 'Ukraine’s: This is a possessive noun (Ukraine) with the possessive ending ‘s, indicating ownership.' }]}\n
    ASSISTANT : {"grammers" : [{"grammer" : "..."}]}
    `;

    console.log(prompt)
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

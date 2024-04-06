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
    var result = ""

    const prompt = req.body.query;

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

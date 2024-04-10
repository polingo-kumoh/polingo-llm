from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer

app = Flask(__name__)

# LLaMA 모델과 토크나이저 로드
model_name = "upstage/SOLAR-10.7B-Instruct-v1.0"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

@app.route("/generate", methods=["POST"])
def generate_text():
    # 클라이언트로부터 입력 받기
    input_data = request.json
    user_input = input_data["query"]

    max_length = input_data.get("max_length", 50)  # 최대 길이 기본값 설정

    input_text = f"""
System: You are an English grammar analyzer. Analyze the sentence according to [ASSISTANT] below.
ASSISTANT: 1. You reply in JSON format with the field 'grammers'. 2. Analyze user questions according to their format. 3. Analyze with reference to examples. 4. Individually analyze each major component (nouns, verb phrases, adjectives, etc.) in the sentence, explaining their grammatical role and function within the sentence. 5.For each analyzed element, describe how it contributes to the formation of the sentence's meaning in detail.
Example Question: 'Ukraine’s frontline brigades are clinging on.'
Example Answer: {{"grammers":[{{"grammer":"'brigades': A plural noun used to denote large groups or units of soldiers. This term specifically refers to multiple military groups, suggesting a collective effort or action within the context of Ukraine’s military operations."}},{{"grammer":"'are clinging on': This present continuous tense ('Be + V-ing') represents an ongoing action or state, indicating persistence or continuation. It translates to 'holding on' or 'enduring,' suggesting that the brigades are maintaining their position or persisting without giving up in the face of challenges."}}]}}
Format: {{"grammers" : [{{"grammer" : "..."}}]}}
User: {user_input}
    """

    # 모델로 텍스트 생성
    inputs = tokenizer.encode(input_text, return_tensors="pt")
    outputs = model.generate(inputs, max_length=max_length)
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # 생성된 텍스트 반환
    return jsonify({"generated_text": generated_text})

if __name__ == "__main__":
    app.run(debug=True)

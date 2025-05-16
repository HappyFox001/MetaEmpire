from fastapi import FastAPI
from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatOpenAI
from web3 import Web3

app = FastAPI()

w3 = Web3(Web3.HTTPProvider("http://localhost:8545"))
world_record_address = "0xYourWorldRecordAddress"
world_record_abi = [...]
world_record = w3.eth.contract(address=world_record_address, abi=world_record_abi)

llm = ChatOpenAI(model="gpt-4")

def read_opinion(opinion_id):
    opinion = world_record.functions.opinions(opinion_id).call()
    return f"{opinion[2]}"
def read_multiple_opinions(opinion_ids):
    contents = []
    for oid in opinion_ids:
        try:
            contents.append(read_opinion(oid))
        except Exception:
            contents.append(f"[Error reading opinion {oid}]")
    return contents

def integrate_opinions(opinions):
    opinions_text = "\n\n".join(opinions)
    prompt = PromptTemplate.from_template(
        "Given the following user opinions:\n\n{opinions}\n\nSummarize the key points, agreements, disagreements, and group them logically. Explain your reasoning step by step."
    )
    return llm(prompt.format(opinions=opinions_text)).content

def generate_summary_and_recommendation(integration_result):
    prompt = PromptTemplate.from_template(
        "Based on the integrated opinions analysis:\n\n{analysis}\n\nProvide an overall summary and suggest the next best action the community should take."
    )
    return llm(prompt.format(analysis=integration_result)).content

def build_advanced_workflow(opinion_ids):
    opinions = read_multiple_opinions(opinion_ids)
    integration_result = integrate_opinions(opinions)
    recommendation = generate_summary_and_recommendation(integration_result)
    return {
        "opinions": opinions,
        "integration": integration_result,
        "recommendation": recommendation
    }

@app.post("/workflow/opinions/")
def multi_opinion_workflow(opinion_ids: list):
    result = build_advanced_workflow(opinion_ids)
    return result

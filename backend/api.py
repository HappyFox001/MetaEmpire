import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Body
from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatOpenAI
from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_account import Account
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="MetaEmpire API", description="区块链观点整合与分析API")

DEFAULT_PRIVATE_KEY = os.getenv('ETH_PRIVATE_KEY', '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')

ETH_PROVIDER_URL = os.getenv('ETH_PROVIDER_URL', 'http://localhost:8545')
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS', '0xYourWorldRecordAddress')

WORLD_RECORD_ABI = [...] 

w3 = Web3(Web3.HTTPProvider(ETH_PROVIDER_URL))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

llm = ChatOpenAI(model="gpt-4")

class WorldRecordContract:
    def __init__(self, web3_instance, contract_address, contract_abi, private_key=None):
        self.w3 = web3_instance
        self.contract_address = Web3.to_checksum_address(contract_address)
        self.contract = self.w3.eth.contract(address=self.contract_address, abi=contract_abi)
        self.private_key = private_key
        self.account = None
        
        if private_key:
            self.account = Account.from_key(private_key)
            logger.info(f"Initialized account: {self.account.address}")
            
    def get_account_address(self):
        return self.account.address if self.account else None
        
    def read_opinion(self, opinion_id):
        """读取单个观点内容"""
        try:
            opinion = self.contract.functions.opinions(opinion_id).call()
            return opinion[2]
        except Exception as e:
            logger.error(f"Error reading opinion {opinion_id}: {str(e)}")
            raise
    
    def get_opinion_count(self):
        """获取当前合约中存储的观点总数"""
        try:
            return self.contract.functions.getOpinionCount().call()
        except Exception as e:
            logger.error(f"Error getting opinion count: {str(e)}")
            return 0
            
    def get_topic_opinions(self, topic_id):
        """获取某一主题下的所有观点ID"""
        try:
            return self.contract.functions.getTopicOpinions(topic_id).call()
        except Exception as e:
            logger.error(f"Error getting opinions for topic {topic_id}: {str(e)}")
            return []
    
    def add_opinion(self, topic_id, content):
        """添加新观点到合约"""
        if not self.account:
            raise ValueError("No account configured for transaction. Set private key first.")
            
        try:
            tx = self.contract.functions.addOpinion(
                topic_id, 
                content
            ).build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 2000000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            logger.info(f"Transaction sent: {tx_hash.hex()}")
            
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            logger.info(f"Transaction confirmed in block {receipt['blockNumber']}. Status: {receipt['status']}")
            
            if receipt['status'] == 1:
                return {
                    'success': True,
                    'transaction_hash': tx_hash.hex(),
                    'block_number': receipt['blockNumber']
                }
            else:
                return {
                    'success': False,
                    'transaction_hash': tx_hash.hex(),
                    'error': 'Transaction failed'
                }
                
        except Exception as e:
            logger.error(f"Error adding opinion: {str(e)}")
            raise

world_record_contract = WorldRecordContract(
    web3_instance=w3,
    contract_address=CONTRACT_ADDRESS,
    contract_abi=WORLD_RECORD_ABI,
    private_key=DEFAULT_PRIVATE_KEY
)
def read_multiple_opinions(opinion_ids):
    contents = []
    for oid in opinion_ids:
        try:
            opinion_content = world_record_contract.read_opinion(oid)
            contents.append(opinion_content)
        except Exception as e:
            logger.error(f"Failed to read opinion {oid}: {str(e)}")
            contents.append(f"[Error reading opinion {oid}]")
    return contents

def integrate_opinions(opinions):
    """使用LLM集成多个观点并分析"""
    opinions_text = "\n\n".join(opinions)
    prompt = PromptTemplate.from_template(
        "Given the following user opinions:\n\n{opinions}\n\nSummarize the key points, agreements, disagreements, and group them logically. Explain your reasoning step by step."
    )
    return llm(prompt.format(opinions=opinions_text)).content

def generate_summary_and_recommendation(integration_result):
    """基于集成分析生成总结和行动建议"""
    prompt = PromptTemplate.from_template(
        "Based on the integrated opinions analysis:\n\n{analysis}\n\nProvide an overall summary and suggest the next best action the community should take."
    )
    return llm(prompt.format(analysis=integration_result)).content

def build_advanced_workflow(opinion_ids):
    """构建完整的观点分析工作流"""
    opinions = read_multiple_opinions(opinion_ids)
    integration_result = integrate_opinions(opinions)
    recommendation = generate_summary_and_recommendation(integration_result)
    return {
        "opinions": opinions,
        "integration": integration_result,
        "recommendation": recommendation
    }

@app.post("/workflow/opinions/")
async def multi_opinion_workflow(opinion_ids: list):
    """分析多个观点并生成汇总、建议"""
    try:
        result = build_advanced_workflow(opinion_ids)
        return result
    except Exception as e:
        logger.error(f"Error in opinion workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing opinion workflow: {str(e)}")
        
@app.get("/topics/{topic_id}/opinions")
async def get_opinions_by_topic(topic_id: int):
    """获取指定主题的所有观点"""
    try:
        opinion_ids = world_record_contract.get_topic_opinions(topic_id)
        
        opinions = []
        for oid in opinion_ids:
            try:
                content = world_record_contract.read_opinion(oid)
                opinions.append({
                    "id": oid,
                    "content": content
                })
            except Exception as e:
                logger.error(f"Error reading opinion {oid}: {str(e)}")
                
        return {
            "topic_id": topic_id,
            "opinion_count": len(opinions),
            "opinions": opinions
        }
    except Exception as e:
        logger.error(f"Error fetching opinions for topic {topic_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch opinions: {str(e)}")

@app.post("/topics/{topic_id}/opinions")
async def add_opinion_to_topic(topic_id: int, data: dict = Body(...)):
    """向指定主题添加新观点"""
    try:
        if 'content' not in data:
            raise HTTPException(status_code=400, detail="Missing 'content' field in request body")
            
        content = data['content']
        result = world_record_contract.add_opinion(topic_id, content)
        
        return {
            "success": True,
            "topic_id": topic_id,
            "content": content,
            "transaction_details": result
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to add opinion to topic {topic_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add opinion: {str(e)}")

@app.get("/contract/status")
async def get_contract_status():
    """获取当前合约状态信息"""
    try:
        return {
            "contract_address": world_record_contract.contract_address,
            "connected_account": world_record_contract.get_account_address(),
            "opinion_count": world_record_contract.get_opinion_count(),
            "chain_id": w3.eth.chain_id,
            "gas_price": w3.eth.gas_price,
            "latest_block": w3.eth.block_number
        }
    except Exception as e:
        logger.error(f"Error getting contract status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get contract status: {str(e)}")

import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_account import Account
from pydantic import BaseModel
from workflow import WorkflowManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="MetaEmpire API", description="区块链观点整合与分析API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_PRIVATE_KEY = os.getenv('ETH_PRIVATE_KEY', '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')

ETH_PROVIDER_URL = os.getenv('ETH_PROVIDER_URL', 'http://localhost:8545')
AI_ORACLE_ADDRESS = os.getenv('AI_ORACLE_ADDRESS', '0x5FbDB2315678afecb367f032d93F642f64180aa3')

AI_ORACLE_ABI = [
    {
        "type": "constructor",
        "inputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "submitAnalysis",
        "inputs": [
            {"name": "_topicId",      "type": "uint256", "internalType": "uint256"},
            {"name": "_summary",      "type": "string",  "internalType": "string"},
            {"name": "_GDP",          "type": "string",  "internalType": "string"},
            {"name": "_tariff",       "type": "string",  "internalType": "string"},
            {"name": "_unemployment", "type": "string",  "internalType": "string"},
            {"name": "_interestRate", "type": "string",  "internalType": "string"},
            {"name": "_inflation",    "type": "string",  "internalType": "string"},
            {"name": "_protectionism","type": "string",  "internalType": "string"},
            {"name": "_liberalism",   "type": "string",  "internalType": "string"}
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "worldRecord",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract WorldRecord"
            }
        ],
        "stateMutability": "view"
    }
]

WORLD_RECORD_ABI = [
    {"type": "function", "name": "addOpinion", "inputs": [{"name": "_content", "type": "string", "internalType": "string"}], "outputs": [{"name": "", "type": "bytes32", "internalType": "bytes32"}], "stateMutability": "nonpayable"},
    {"type": "function", "name": "aiOracle", "inputs": [], "outputs": [{"name": "", "type": "address", "internalType": "address"}], "stateMutability": "view"},
    {"type": "function", "name": "allOpinionHashes", "inputs": [{"name": "", "type": "uint256", "internalType": "uint256"}], "outputs": [{"name": "", "type": "bytes32", "internalType": "bytes32"}], "stateMutability": "view"},
    {"type": "function", "name": "civilians", "inputs": [{"name": "", "type": "address", "internalType": "address"}], "outputs": [
        {"name": "account", "type": "address", "internalType": "address"},
        {"name": "age", "type": "uint8", "internalType": "uint8"},
        {"name": "job", "type": "string", "internalType": "string"},
        {"name": "income", "type": "uint256", "internalType": "uint256"},
        {"name": "education", "type": "string", "internalType": "string"},
        {"name": "participance", "type": "uint256", "internalType": "uint256"}
    ], "stateMutability": "view"},
    {"type": "function", "name": "createTopic", "inputs": [
        {"name": "_content", "type": "string", "internalType": "string"},
        {"name": "_priority", "type": "string", "internalType": "string"},
        {"name": "_urgency", "type": "string", "internalType": "string"},
        {"name": "_relatedOpinions", "type": "bytes32[]", "internalType": "bytes32[]"}
    ], "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}], "stateMutability": "nonpayable"},
    {"type": "function", "name": "culture", "inputs": [], "outputs": [
        {"name": "timestamp", "type": "uint256", "internalType": "uint256"},
        {"name": "protectionism", "type": "string", "internalType": "string"},
        {"name": "liberalism", "type": "string", "internalType": "string"}
    ], "stateMutability": "view"},
    {"type": "function", "name": "economy", "inputs": [], "outputs": [
        {"name": "timestamp", "type": "uint256", "internalType": "uint256"},
        {"name": "GDP", "type": "string", "internalType": "string"},
        {"name": "tariff", "type": "string", "internalType": "string"},
        {"name": "unemployment", "type": "string", "internalType": "string"},
        {"name": "interestRate", "type": "string", "internalType": "string"},
        {"name": "inflation", "type": "string", "internalType": "string"}
    ], "stateMutability": "view"},
    {"type": "function", "name": "getAllOpinions", "inputs": [], "outputs": [
        {"name": "", "type": "tuple[]", "internalType": "struct WorldRecord.Opinion[]", "components": [
            {"name": "hash", "type": "bytes32", "internalType": "bytes32"},
            {"name": "sender", "type": "address", "internalType": "address"},
            {"name": "content", "type": "string", "internalType": "string"},
            {"name": "timestamp", "type": "uint256", "internalType": "uint256"}
        ]}
    ], "stateMutability": "view"},
    {"type": "function", "name": "getOpinionCount", "inputs": [], "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}], "stateMutability": "view"},
    {"type": "function", "name": "nextTopicId", "inputs": [], "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}], "stateMutability": "view"},
    {"type": "function", "name": "opinions", "inputs": [{"name": "", "type": "bytes32", "internalType": "bytes32"}], "outputs": [
        {"name": "hash", "type": "bytes32", "internalType": "bytes32"},
        {"name": "sender", "type": "address", "internalType": "address"},
        {"name": "content", "type": "string", "internalType": "string"},
        {"name": "timestamp", "type": "uint256", "internalType": "uint256"}
    ], "stateMutability": "view"},
    {"type": "function", "name": "registerCivilian", "inputs": [
        {"name": "_age", "type": "uint8", "internalType": "uint8"},
        {"name": "_job", "type": "string", "internalType": "string"},
        {"name": "_income", "type": "uint256", "internalType": "uint256"},
        {"name": "_education", "type": "string", "internalType": "string"},
        {"name": "_participance", "type": "uint256", "internalType": "uint256"}
    ], "outputs": [], "stateMutability": "nonpayable"},
    {"type": "function", "name": "topics", "inputs": [{"name": "", "type": "uint256", "internalType": "uint256"}], "outputs": [
        {"name": "id", "type": "uint256", "internalType": "uint256"},
        {"name": "content", "type": "string", "internalType": "string"},
        {"name": "priority", "type": "string", "internalType": "string"},
        {"name": "urgency", "type": "string", "internalType": "string"},
        {"name": "summary", "type": "string", "internalType": "string"}
    ], "stateMutability": "view"},
    {"type": "function", "name": "updateCulture", "inputs": [
        {"name": "_protectionism", "type": "string", "internalType": "string"},
        {"name": "_liberalism", "type": "string", "internalType": "string"}
    ], "outputs": [], "stateMutability": "nonpayable"},
    {"type": "function", "name": "updateEconomy", "inputs": [
        {"name": "_GDP", "type": "string", "internalType": "string"},
        {"name": "_tariff", "type": "string", "internalType": "string"},
        {"name": "_unemployment", "type": "string", "internalType": "string"},
        {"name": "_interestRate", "type": "string", "internalType": "string"},
        {"name": "_inflation", "type": "string", "internalType": "string"}
    ], "outputs": [], "stateMutability": "nonpayable"},
    {"type": "function", "name": "updateTopicSummary", "inputs": [
        {"name": "_id", "type": "uint256", "internalType": "uint256"},
        {"name": "_summary", "type": "string", "internalType": "string"}
    ], "outputs": [], "stateMutability": "nonpayable"}
]

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

            try:
                self.w3.eth.default_account = self.account.address
                logger.info(f"Set default account to: {self.account.address}")

                try:
                    ai_oracle = self.contract.functions.aiOracle().call()
                    logger.info(f"Contract AI Oracle address: {ai_oracle}")
                    logger.info(f"Current account is AI Oracle: {ai_oracle.lower() == self.account.address.lower()}")
                except Exception as e:
                    logger.error(f"Error getting AI Oracle address: {str(e)}")
                    
            except Exception as e:
                logger.warning(f"Could not set default account: {str(e)}")
            
    def get_account_address(self):
        return self.account.address if self.account else None
        
    def read_opinion(self, opinion_id):
        try:
            opinion = self.contract.functions.opinions(opinion_id).call()
            return opinion[2]
        except Exception as e:
            logger.error(f"Error reading opinion {opinion_id}: {str(e)}")
            raise
        
    def get_opinion_count(self):
        try:
            return self.contract.functions.getOpinionCount().call()
        except Exception as e:
            logger.error(f"Error getting opinion count: {str(e)}")
            raise
            
    def getAllOpinions(self):
        try:
            opinions = self.contract.functions.getAllOpinions().call()
            return opinions
        except Exception as e:
            logger.error(f"Error reading opinions: {str(e)}")
            raise
    
    def add_opinion(self, content):
        if not self.account:
            raise ValueError("No account configured for transaction. Set private key first.")
            
        try:
            tx = self.contract.functions.addOpinion(
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

w3 = Web3(Web3.HTTPProvider(ETH_PROVIDER_URL))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

print(f"Connected to {ETH_PROVIDER_URL}")
print(f"AIOracle address: {AI_ORACLE_ADDRESS}")
print(f"Default account: {w3.eth.accounts[0] if w3.eth.accounts else 'No accounts'}")

ai_oracle_contract = w3.eth.contract(
    address=Web3.to_checksum_address(AI_ORACLE_ADDRESS),
    abi=AI_ORACLE_ABI
)

try:
    WORLD_RECORD_ADDRESS = ai_oracle_contract.functions.worldRecord().call()
    print(f"WorldRecord address (fetched): {WORLD_RECORD_ADDRESS}")
except Exception as e:
    logger.error(f"Could not fetch WorldRecord address: {str(e)}")
    raise

world_record_contract = WorldRecordContract(
    web3_instance=w3,
    contract_address=WORLD_RECORD_ADDRESS,
    contract_abi=WORLD_RECORD_ABI,
    private_key=DEFAULT_PRIVATE_KEY
)

@app.get("/topics/{topic_id}/opinions")
async def get_opinions_by_topic(topic_id: int):
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
    try:
        if 'content' not in data:
            raise HTTPException(status_code=400, detail="Missing 'content' field in request body")
            
        content = data['content']
        result = world_record_contract.add_opinion(content)
        print("result",result)
        
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
    try:
        return {
            "contract_address": world_record_contract.contract_address,
            "connected": w3.is_connected(),
            "network": w3.eth.chain_id,
            "latest_block": w3.eth.block_number
        }
    except Exception as e:
        logger.error(f"Error getting contract status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get contract status: {str(e)}")

class WorkflowRequest(BaseModel):
    topic_id: int
    content: str
    action: str = "full"

@app.post("/workflow/opinions/")
async def start_workflow(data: WorkflowRequest):
    try:
        task_id = WorkflowManager.create_task(
            topic_id=data.topic_id,
            content=data.content,
            action=data.action
        )
        
        return {"success": True, "task_id": task_id}
    except Exception as e:
        logger.error(f"Error starting workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start workflow: {str(e)}")

@app.get("/workflow/status/{task_id}")
async def get_workflow_status(task_id: str):
    try:
        status = WorkflowManager.get_current_status(task_id)
        if "error" in status and status.get("status_code") == 404:
            raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
        
        return status
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error getting workflow status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get workflow status: {str(e)}")

@app.get("/workflow/steps")
async def get_workflow_steps():
    try:
        steps = WorkflowManager.get_all_steps()
        return {"steps": steps}
    except Exception as e:
        logger.error(f"Error getting workflow steps: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get workflow steps: {str(e)}")

@app.get("/workflow/steps/{task_id}")
async def get_workflow_steps_with_status(task_id: str):
    try:
        steps = WorkflowManager.get_all_steps(with_status=True, task_id=task_id)
        return {"steps": steps}
    except Exception as e:
        logger.error(f"Error getting workflow steps with status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get workflow steps with status: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)

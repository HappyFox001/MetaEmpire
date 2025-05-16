export interface OpinionSubmitRequest {
  content: string;
  topic_id?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Opinion {
  id: number;
  content: string;
  topic_id: number;
  timestamp: string;
  user?: string;
}

export interface Topic {
  id: number;
  title: string;
  description: string;
  status: string;
  heat: number;
  category: 'economy' | 'ai' | 'web3' | 'crypto' | 'metaverse' | 'copyright';
}

export interface ProcessStatus {
  step_id: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  details?: string;
  timestamp?: string;
  progress?: number;
  next_step?: string;
  result?: {
    summary: string;
    recommendations: string;
    sentiment_analysis: {
      positive: number;
      neutral: number;
      negative: number;
    };
    key_topics: string[];
    total_opinions: number;
  };
}

export interface TransactionDetails {
  transaction_hash: string;
  block_number: number;
  status: boolean;
  gas_used: number;
}

export interface ApiErrorResponse {
  detail: string;
  status_code: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    return {
      success: false,
      error: errorData.detail || `服务端错误 (${response.status})`
    };
  }

  const data = await response.json();
  return {
    success: true,
    data
  };
};

export const submitOpinion = async (data: OpinionSubmitRequest): Promise<ApiResponse<{
  content: string;
  transaction_details: TransactionDetails;
  topic_id: number;
}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/topics/${data.topic_id || 1}/opinions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: data.content }),
    });

    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '提交观点失败'
    };
  }
};

export const getProcessStatus = async (taskId: string): Promise<ApiResponse<ProcessStatus>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workflow/status/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取工作流状态失败'
    };
  }
};

export const getOpinionsByTopic = async (topicId: number): Promise<ApiResponse<Opinion[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/topics/${topicId}/opinions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取观点列表失败'
    };
  }
};

export const startWorkflow = async (data: {
  topic_id: number;
  content: string;
  action: 'analyze' | 'summarize' | 'full';
}): Promise<ApiResponse<{task_id: string}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/workflow/opinions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '启动AI工作流失败'
    };
  }
};

export const getContractStatus = async (): Promise<ApiResponse<{
  contract_address: string;
  connected: boolean;
  network: string;
  latest_block: number;
}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/contract/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取合约状态失败'
    };
  }
};

"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import ProcessFlow, { ProcessStep } from "@/components/ProcessFlow";

import { submitOpinion, getProcessStatus, ProcessStatus, startWorkflow } from "@/services/api";

const API_POLLING_INTERVAL = 2000;

export default function ProcessStatusPage() {
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const truncateHash = (hash: string, startLength = 6, endLength = 4) => {
    if (!hash || hash.length <= startLength + endLength) return hash;
    return `${hash.substring(0, startLength)}...${hash.substring(hash.length - endLength)}`;
  };
  
  const [activeStepId, setActiveStepId] = useState("waiting");
  
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    {
      id: "waiting",
      title: "等待发送",
      description: "您的观点正在准备上链",
      status: "pending",
      icon: "clock",
    },
    {
      id: "blockchain",
      title: "区块链处理",
      description: "将您的观点安全记录到区块链",
      status: "pending",
      icon: "arrow",
    },
    {
      id: "ai_fetching",
      title: "AI数据收集",
      description: "人工智能正在收集相关观点数据",
      status: "pending",
      icon: "brain",
    },
    {
      id: "ai_analyzing",
      title: "AI分析中",
      description: "分析观点数据中的模式和关联",
      status: "pending",
      icon: "chart",
      details: "正在进行观点聚类分析...",
    },
    {
      id: "ai_summarizing",
      title: "生成摘要",
      description: "根据分析结果生成综合摘要",
      status: "pending",
      icon: "file",
    },
    {
      id: "ai_recommendation",
      title: "提出建议",
      description: "基于分析提出行动建议",
      status: "pending",
      icon: "message",
    },
    {
      id: "complete",
      title: "处理完成",
      description: "您的观点已被记录并分析",
      status: "pending",
      icon: "check",
    },
  ]);

  const progress = isProcessing ? 
    Math.round(((processSteps.findIndex(s => s.id === activeStepId) + 1) / processSteps.length) * 100) : 
    0;
  const handleSubmit = async () => {
    if (!message.trim() || isProcessing) return;
    
    try {
      setIsProcessing(true);
      setActiveStepId("waiting");
      updateStepStatus("waiting", "processing");

      const submitResult = await submitOpinion({ 
        content: message, 
        topic_id: 1,
      });
      updateStepStatus("waiting", "complete");
      
      if (!submitResult.success || !submitResult.data) {
        throw new Error(submitResult.error || "提交消息失败");
      }
      
      const { topic_id, transaction_details } = submitResult.data;
      const txHash = transaction_details?.transaction_hash || "处理中";
      
      updateStepStatus("blockchain", "processing");
      setActiveStepId("blockchain");
      updateStepDetails("blockchain", `正在将您的观点记录到区块链: ${truncateHash(txHash)}`);
      
      setTimeout(() => {
        updateStepStatus("blockchain", "complete");
        updateStepDetails("blockchain", "您的观点已被记录到区块链");
        
        startAIWorkflow(message, topic_id);
      }, 4000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "处理流程发生错误";
      updateStepStatus(activeStepId, "error");
      updateStepDetails(activeStepId, errorMessage);
      setIsProcessing(false);
    }
  };

  const startAIWorkflow = async (message: string, topicId: number) => {
    try {
      updateStepStatus("ai_fetching", "processing");
      setActiveStepId("ai_fetching");
      
      const workflowResult = await startWorkflow({
        topic_id: topicId,
        content: message,
        action: "full",
      });
      
      if (!workflowResult.success || !workflowResult.data) {
        throw new Error(workflowResult.error || "启动AI工作流失败");
      }
      
      const task_id  = workflowResult.data.task_id;
      
      const pollStatus = async () => {
        try {
          const result = await getProcessStatus(task_id);
          
          if (!result.success || !result.data) {
            throw new Error(result.error || "获取工作流状态失败");
          }
          
          const status = result.data;

          updateStepStatus(status.step_id, status.status);
          if (status.details) {
            updateStepDetails(status.step_id, status.details);
          }
          setActiveStepId(status.step_id);

          if (status.status === "complete" && status.step_id === "complete") {
            const completedSteps = ["waiting", "blockchain", "ai_fetching", "ai_analyzing", "ai_summarizing", "ai_recommendation", "complete"];
            completedSteps.forEach(stepId => {
              updateStepStatus(stepId, "complete");
            });

            if (status.result) {
              const { sentiment_analysis, key_topics, total_opinions } = status.result;
              
              updateStepDetails("ai_summarizing", status.result.summary);
              updateStepDetails("ai_recommendation", status.result.recommendations);
              
              updateStepDetails("ai_analyzing", 
                `分析了 ${total_opinions} 条观点\n`
              );
            }
            
            setIsProcessing(false);
            return;
          } else if (status.status === "error") {
            throw new Error(status.details || "工作流处理出错");
          }

          setTimeout(pollStatus, API_POLLING_INTERVAL);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "AI工作流轮询出错";
          updateStepStatus(activeStepId, "error");
          updateStepDetails(activeStepId, errorMessage);
          setIsProcessing(false);
        }
      };

      pollStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "AI工作流发生错误";
      updateStepStatus(activeStepId, "error");
      updateStepDetails(activeStepId, errorMessage);
      setIsProcessing(false);
    }
  };

  const updateStepStatus = (stepId: string, status: ProcessStep["status"]) => {
    setProcessSteps(steps => 
      steps.map(step => 
        step.id === stepId ? { ...step, status } : step,
      ),
    );
  };

  const updateStepDetails = (stepId: string, details: string) => {
    setProcessSteps(steps => 
      steps.map(step => 
        step.id === stepId ? { ...step, details } : step,
      ),
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-24 w-64 h-64 bg-emerald-900 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-16 right-24 w-96 h-72 bg-blue-900 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/3 right-1/4 w-52 h-52 bg-pink-900 rounded-full blur-2xl opacity-15"></div>
        <div className="absolute top-2/3 left-1/4 w-40 h-40 bg-amber-900 rounded-full blur-2xl opacity-10 animate-pulse animation-delay-1000"></div>
      </div>
      
      {/* Header */}
      <header className="w-full px-8 py-4 flex items-center justify-between bg-gray-950/90 backdrop-blur border-b border-gray-800 shadow-sm z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-bold text-xl tracking-wide bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">MetaEmpire</span>
          <span className="ml-3 text-sm text-gray-300">处理流程监控</span>
        </div>
        <Button 
          variant="outline" 
          className="rounded-full px-4 text-blue-300 border-blue-700 hover:bg-blue-900/30 hover:text-white hover:border-blue-400 transition-all duration-300 flex items-center gap-2 group"
          onClick={() => window.history.back()}
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回主页
        </Button>
      </header>

      <main className="flex min-h-[calc(100vh-64px)] p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-7xl mx-auto">
          <div className="flex flex-col gap-6">
            {/* Process Header */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-white">观点处理中心</h1>
              <p className="text-gray-400">
                分享您的观点，我们将通过区块链和AI技术进行处理和分析，为您提供全面的见解。
              </p>
            </motion.div>

            {/* Opinion Input Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm hover:border-blue-900/50 transition-colors duration-300 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-900/30 rounded-lg">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-100">发表您的观点</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Input 
                        placeholder="分享您对当前热点议题的见解..."
                        className="border-gray-700 bg-gray-800/50 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 min-h-[120px] transition-colors duration-200"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                    <Button 
                      className={`w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 transition-all duration-300 ${isProcessing ? 'opacity-80' : ''}`}
                      onClick={handleSubmit}
                      disabled={isProcessing || !message.trim()}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          处理中...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          发送并开始处理
                        </span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm transition-colors duration-300 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-900/30 rounded-lg">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-100">处理进度</h2>
                    </div>
                    <span className="text-sm font-medium bg-gray-800 px-3 py-1 rounded-full text-blue-300">
                      {isProcessing ? '进行中' : '待开始'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full relative overflow-hidden"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-shimmer"></div>
                      </motion.div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {isProcessing ? `${progress}% 完成` : '等待开始...'}
                      </span>
                      <span className="text-xs font-medium text-blue-400">
                        {Math.round(progress * processSteps.length / 100)}/{processSteps.length} 步骤
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Current Step Details */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm transition-colors duration-300 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-900/30 rounded-lg">
                          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-100">当前步骤详情</h2>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900/50 text-blue-300 text-xs font-medium">
                              {processSteps.findIndex(step => step.id === activeStepId) + 1}
                            </div>
                          </div>
                          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                            {processSteps.find(step => step.id === activeStepId)?.details || 
                              "正在处理，请稍候..."}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Process Flow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="h-full"
          >
            <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm h-full flex flex-col shadow-lg">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-100">处理流程</h2>
                  <span className="ml-auto text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                    {isProcessing ? '实时更新' : '待启动'}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ProcessFlow 
                    steps={processSteps} 
                    activeStepId={activeStepId}
                    className="h-full max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <footer className="text-center py-4 text-gray-500 text-xs bg-transparent border-t border-gray-800/50 mt-auto">
        <div className="container mx-auto px-4">
          <p>© 2025 MetaEmpire · 基于区块链与AI的舆情分析平台</p>
          <p className="mt-1 text-gray-600">Powered by Next.js, TailwindCSS & Web3 技术</p>
        </div>
      </footer>
    </div>
  );
}

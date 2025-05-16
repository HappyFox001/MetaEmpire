"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import ProcessFlow, { ProcessStep } from '@/components/ProcessFlow';

import { submitOpinion, getProcessStatus, ProcessStatus, startWorkflow } from '@/services/api';

const API_POLLING_INTERVAL = 2000;

export default function ProcessStatusPage() {
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [activeStepId, setActiveStepId] = useState('waiting');
  
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    {
      id: 'waiting',
      title: '等待发送',
      description: '您的观点正在准备上链',
      status: 'pending',
      icon: 'clock',
    },
    {
      id: 'blockchain',
      title: '区块链处理',
      description: '将您的观点安全记录到区块链',
      status: 'pending',
      icon: 'arrow',
    },
    {
      id: 'ai_fetching',
      title: 'AI数据收集',
      description: '人工智能正在收集相关观点数据',
      status: 'pending',
      icon: 'brain',
    },
    {
      id: 'ai_analyzing',
      title: 'AI分析中',
      description: '分析观点数据中的模式和关联',
      status: 'pending',
      icon: 'chart',
      details: '正在进行观点聚类分析...',
    },
    {
      id: 'ai_summarizing',
      title: '生成摘要',
      description: '根据分析结果生成综合摘要',
      status: 'pending',
      icon: 'file',
    },
    {
      id: 'ai_recommendation',
      title: '提出建议',
      description: '基于分析提出行动建议',
      status: 'pending',
      icon: 'message',
    },
    {
      id: 'complete',
      title: '处理完成',
      description: '您的观点已被记录并分析',
      status: 'pending',
      icon: 'check',
    },
  ]);

  const progress = isProcessing ? 
    Math.round(((processSteps.findIndex(s => s.id === activeStepId) + 1) / processSteps.length) * 100) : 
    0;
  const handleSubmit = async () => {
    if (!message.trim() || isProcessing) return;
    
    try {
      setIsProcessing(true);
      setActiveStepId('waiting');
      updateStepStatus('waiting', 'processing');

      const submitResult = await submitOpinion({ 
        content: message, 
        topic_id: 1
      });
      updateStepStatus('waiting', 'complete');
      
      if (!submitResult.success || !submitResult.data) {
        throw new Error(submitResult.error || '提交消息失败');
      }
      
      const { topic_id, transaction_details } = submitResult.data;
      const txHash = transaction_details?.transaction_hash || '处理中';
      
      updateStepStatus('blockchain', 'processing');
      setActiveStepId('blockchain');
      updateStepDetails('blockchain', `正在将您的观点记录到区块链: ${txHash}`);
      
      setTimeout(() => {
        updateStepStatus('blockchain', 'complete');
        updateStepDetails('blockchain', `您的观点已被记录到区块链`);
        
        startAIWorkflow(message, topic_id);
      }, 4000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '处理流程发生错误';
      updateStepStatus(activeStepId, 'error');
      updateStepDetails(activeStepId, errorMessage);
      setIsProcessing(false);
    }
  };

  const startAIWorkflow = async (message: string, topicId: number) => {
    try {
      updateStepStatus('ai_fetching', 'processing');
      setActiveStepId('ai_fetching');
      
      const workflowResult = await startWorkflow({
        topic_id: topicId,
        content: message,
        action: 'full'
      });
      
      if (!workflowResult.success || !workflowResult.data) {
        throw new Error(workflowResult.error || '启动AI工作流失败');
      }
      
      const task_id  = workflowResult.data.task_id;
      
      const pollStatus = async () => {
        try {
          const result = await getProcessStatus(task_id);
          
          if (!result.success || !result.data) {
            throw new Error(result.error || '获取工作流状态失败');
          }
          
          const status = result.data;

          updateStepStatus(status.step_id, status.status);
          if (status.details) {
            updateStepDetails(status.step_id, status.details);
          }
          setActiveStepId(status.step_id);

          if (status.status === 'complete' && status.step_id === 'complete') {
            const completedSteps = ['waiting', 'blockchain', 'ai_fetching', 'ai_analyzing', 'ai_summarizing', 'ai_recommendation', 'complete'];
            completedSteps.forEach(stepId => {
              updateStepStatus(stepId, 'complete');
            });

            if (status.result) {
              const { sentiment_analysis, key_topics, total_opinions } = status.result;
              
              updateStepDetails('ai_summarizing', status.result.summary);
              updateStepDetails('ai_recommendation', status.result.recommendations);
              
              updateStepDetails('ai_analyzing', 
                `分析了 ${total_opinions} 条观点\n` +
                `积极观点: ${sentiment_analysis.positive}%\n` +
                `中立观点: ${sentiment_analysis.neutral}%\n` +
                `消极观点: ${sentiment_analysis.negative}%\n\n` +
                `主要话题: ${key_topics.join(', ')}`
              );
            }
            
            setIsProcessing(false);
            return;
          } else if (status.status === 'error') {
            throw new Error(status.details || '工作流处理出错');
          }

          setTimeout(pollStatus, API_POLLING_INTERVAL);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'AI工作流轮询出错';
          updateStepStatus(activeStepId, 'error');
          updateStepDetails(activeStepId, errorMessage);
          setIsProcessing(false);
        }
      };

      pollStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'AI工作流发生错误';
      updateStepStatus(activeStepId, 'error');
      updateStepDetails(activeStepId, errorMessage);
      setIsProcessing(false);
    }
  };

  const updateStepStatus = (stepId: string, status: ProcessStep['status']) => {
    setProcessSteps(steps => 
      steps.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  const updateStepDetails = (stepId: string, details: string) => {
    setProcessSteps(steps => 
      steps.map(step => 
        step.id === stepId ? { ...step, details } : step
      )
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-900 overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-24 w-64 h-64 bg-emerald-900 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-16 right-24 w-96 h-72 bg-blue-900 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/3 right-1/4 w-52 h-52 bg-pink-900 rounded-full blur-2xl opacity-15"></div>
      </div>
      <header className="w-full px-8 py-4 flex items-center justify-between bg-gray-950/90 backdrop-blur border-b border-gray-800 shadow-sm z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-bold text-xl tracking-wide">MetaEmpire</span>
          <span className="ml-3 text-sm text-gray-400">处理流程监控</span>
        </div>
        <Button 
          variant="outline" 
          className="rounded-full px-4 text-blue-400 border-blue-700 hover:bg-blue-900/10 hover:border-blue-400 transition"
          onClick={() => window.history.back()}
        >
          返回主页
        </Button>
      </header>

      <main className="flex min-h-[calc(100vh-64px)] p-6">
        <div className="grid grid-cols-2 gap-8 w-full">
          <div className="flex flex-col gap-6">
            <Card className="bg-gray-900/60 border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-100">发表您的观点</h2>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Input 
                      placeholder="分享您对当前热点议题的见解..."
                      className="border-blue-900 bg-gray-950 text-gray-100 placeholder-gray-500 focus:border-blue-400 focus:ring-blue-500 min-h-[100px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={isProcessing}
                    />
                  </div>
                  <Button 
                    className="w-full bg-blue-700 hover:bg-blue-600 text-white"
                    onClick={handleSubmit}
                    disabled={isProcessing || !message.trim()}
                  >
                    {isProcessing ? '处理中...' : '发送并开始处理'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/60 border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-100">处理进度</h2>
                <div className="w-full bg-gray-800 rounded-full h-4 mb-2">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 h-4 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-right text-sm text-gray-400">{progress}%</div>
              </CardContent>
            </Card>

            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="bg-gray-900/60 border-gray-800">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4 text-gray-100">当前步骤详情</h2>
                      <div className="text-gray-300">
                        {processSteps.find(step => step.id === activeStepId)?.details || 
                          "正在处理，请稍候..."}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Card className="bg-gray-900/60 border-gray-800">
            <CardContent className="p-6">
              <ProcessFlow 
                steps={processSteps} 
                activeStepId={activeStepId}
                className="max-h-[80vh] overflow-y-auto pr-2"
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="text-center py-4 text-gray-600 text-xs bg-transparent">
        © 2025 MetaEmpire · Powered by Next.js & TailwindCSS
      </footer>
    </div>
  );
}

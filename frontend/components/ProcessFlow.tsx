"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Circle, AlertCircle, Clock, ArrowRight, Brain, FileText, PieChart, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type ProcessStep = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "processing" | "complete" | "error";
  startTime?: Date;
  endTime?: Date;
  icon: keyof typeof stepIcons;
  details?: string;
};

type ProcessFlowProps = {
  steps: ProcessStep[];
  activeStepId: string;
  onStepClick?: (step: ProcessStep) => void;
  className?: string;
};

const stepIcons = {
  check: CheckCircle,
  clock: Clock,
  alert: AlertCircle,
  circle: Circle,
  arrow: ArrowRight,
  brain: Brain,
  file: FileText,
  chart: PieChart,
  message: MessageSquare,
};

const getStatusColor = (status: ProcessStep["status"]) => {
  switch (status) {
  case "complete":
    return "text-emerald-400 border-emerald-700 bg-emerald-950/30";
  case "processing":
    return "text-blue-400 border-blue-700 bg-blue-950/30 animate-pulse";
  case "error":
    return "text-red-400 border-red-700 bg-red-950/30";
  case "pending":
  default:
    return "text-gray-400 border-gray-700 bg-gray-900/30";
  }
};

const ProcessFlow = ({ steps, activeStepId, onStepClick, className = "" }: ProcessFlowProps) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    setExpandedStep(activeStepId);
  }, [activeStepId]);

  const handleStepClick = (step: ProcessStep) => {
    setExpandedStep(expandedStep === step.id ? null : step.id);
    if (onStepClick) onStepClick(step);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-gray-100 flex items-center gap-2">
        <span className="text-blue-400">•</span>
        处理流程
      </h2>
      
      <div className="space-y-3 relative">
        <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-gray-800 via-blue-800/40 to-gray-800 ml-[0.5px]"></div>
        
        {steps.map((step, index) => {
          const statusColor = getStatusColor(step.status);
          const isActive = step.id === activeStepId;
          const isExpanded = step.id === expandedStep;
          const Icon = stepIcons[step.icon];
          
          return (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col pl-8 ${isActive ? "z-10" : "z-0"}`}
            >
              <motion.div 
                className={`absolute left-0 top-0 w-[32px] h-[32px] rounded-full border-2 ${statusColor} flex items-center justify-center z-10`}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
              >
                <Icon size={16} className={statusColor.split(" ")[0]} />
              </motion.div>

              <div 
                className={`py-1.5 px-3 rounded-lg cursor-pointer transition-all relative ${
                  isActive ? "bg-gray-800/60" : "hover:bg-gray-900/40"
                }`}
                onClick={() => handleStepClick(step)}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-200">{step.title}</div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${statusColor}`}
                  >
                    {step.status === "complete" && "已完成"}
                    {step.status === "processing" && "处理中"}
                    {step.status === "pending" && "等待中"}
                    {step.status === "error" && "错误"}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-400">{step.description}</div>
                
                { isExpanded && step.details && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-sm bg-gray-900/60 p-3 rounded-md border border-gray-800 text-gray-300"
                  >
                    {step.details}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessFlow;

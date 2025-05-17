"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}
import Link from "next/link";

// 简单的标签渲染函数
const renderCustomizedLabel = ({
  name,
  percent
}: {
  name: string;
  percent: number;
}) => {
  return `${name} ${(percent * 100).toFixed(0)}%`;
};

const data = [
  { name: "1月", 支持: 400, 反对: 240, 总热度: 2400 },
  { name: "2月", 支持: 300, 反对: 139, 总热度: 2210 },
  { name: "3月", 支持: 200, 反对: 980, 总热度: 2290 },
  { name: "4月", 支持: 278, 反对: 390, 总热度: 2000 },
  { name: "5月", 支持: 700, 反对: 500, 总热度: 3580 },
];

const pieData: PieDataItem[] = [
  { name: "强烈支持", value: 35, color: "#4ade80" },
  { name: "一般支持", value: 20, color: "#86efac" },
  { name: "中立", value: 15, color: "#d1d5db" },
  { name: "一般反对", value: 15, color: "#fca5a5" },
  { name: "强烈反对", value: 15, color: "#f87171" },
];

const opinionData = [
  { 
    content: "特朗普的关税政策虽然短期内造成价格上涨，但从长远来看，这是保护美国制造业的必要措施。", 
    sentiment: "positive",
    source: "华尔街日报",
    date: "2025-05-15",
  },
  { 
    content: "这些关税最终会由美国消费者买单，导致通货膨胀加剧，对经济复苏不利。",
    sentiment: "negative",
    source: "纽约时报",
    date: "2025-05-14",
  },
  { 
    content: "中国降低部分美国商品关税的举措显示出双方都在寻求缓解贸易紧张局势。",
    sentiment: "neutral",
    source: "路透社",
    date: "2025-05-13",
  },
  { 
    content: "关税政策导致供应链重组，一些企业开始将生产基地转移到东南亚国家。",
    sentiment: "negative",
    source: "彭博社",
    date: "2025-05-12",
  },
  { 
    content: "特朗普政府表示，新关税将创造更多就业机会并促进国内制造业发展。",
    sentiment: "positive",
    source: "福克斯新闻",
    date: "2025-05-11",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">特朗普关税政策分析看板</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300 flex items-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            返回首页
          </Link>
        </div>
        
        {/* 概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all bg-gray-800 border-gray-700 hover:bg-gray-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">支持人数</CardTitle>
              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">15,234</div>
              <p className="text-xs text-gray-400">+12% 较上月</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all bg-gray-800 border-gray-700 hover:bg-gray-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">反对人数</CardTitle>
              <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">8,567</div>
              <p className="text-xs text-gray-400">+5% 较上月</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all bg-gray-800 border-gray-700 hover:bg-gray-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">总热度</CardTitle>
              <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">23,801</div>
              <p className="text-xs text-gray-400">+8% 较上月</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all bg-gray-800 border-gray-700 hover:bg-gray-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">媒体报道量</CardTitle>
              <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">1,245</div>
              <p className="text-xs text-gray-400">+23% 较上月</p>
            </CardContent>
          </Card>
        </div>
        
        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 hover:shadow-lg transition-all bg-gray-800 border-gray-700 hover:bg-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">支持/反对趋势</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "rgba(31, 41, 55, 0.95)",
                      border: "1px solid #4B5563",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
                      color: "#F3F4F6"
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                  <Line 
                    type="monotone" 
                    dataKey="支持" 
                    stroke="#4ade80" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: '#4ade80' }}
                    activeDot={{ r: 6, fill: '#22c55e' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="反对" 
                    stroke="#f87171" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#f87171' }}
                    activeDot={{ r: 6, fill: '#ef4444' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all bg-gray-800 border-gray-700 hover:bg-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">支持/反对比例</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: { name: string; percent: number }) => {
                      return `${name} ${(percent * 100).toFixed(0)}%`;
                    }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "rgba(31, 41, 55, 0.95)",
                      border: "1px solid #4B5563",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
                      color: "#F3F4F6"
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* 媒体报道和观点 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-all bg-gray-800 border-gray-700 hover:bg-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">最新媒体报道</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opinionData.map((item, index) => (
                  <div 
                    key={index} 
                    className={`p-4 border rounded-lg transition-colors ${
                      item.sentiment === "positive" 
                        ? "bg-green-900/30 border-green-800/50 hover:bg-green-900/40" 
                        : item.sentiment === "negative" 
                          ? "bg-red-900/30 border-red-800/50 hover:bg-red-900/40" 
                          : "bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.sentiment === "positive" 
                          ? "bg-green-900/50 text-green-300" 
                          : item.sentiment === "negative" 
                            ? "bg-red-900/50 text-red-300" 
                            : "bg-gray-700 text-gray-300"
                      }`}>
                        {item.sentiment === "positive" ? "正面" : item.sentiment === "negative" ? "负面" : "中性"}
                      </span>
                      <span className="text-xs text-gray-400">{item.date}</span>
                    </div>
                    <p className="text-sm text-gray-200">{item.content}</p>
                    <div className="mt-2 text-xs text-gray-400">来源: {item.source}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all bg-gray-800 border-gray-700 hover:bg-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">专家观点分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-800/50">
                  <h3 className="font-medium text-blue-300 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    经济影响
                  </h3>
                  <p className="text-sm text-gray-300">
                    专家普遍认为，特朗普的关税政策将在短期内推高<mark className="bg-yellow-900/50 text-yellow-200 px-1 rounded">消费者价格指数(CPI)</mark>，可能导致通胀压力上升。
                    长期来看，可能会促使部分制造业回流美国，但同时也可能引发贸易伙伴的报复性措施。
                  </p>
                </div>
                
                <div className="p-4 bg-green-900/30 rounded-lg border border-green-800/50">
                  <h3 className="font-medium text-green-300 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    供应链调整
                  </h3>
                  <p className="text-sm text-gray-300">
                    许多企业已经开始重新评估其全球供应链布局，考虑将生产基地从中国转移至<mark className="bg-green-900/50 text-green-200 px-1 rounded">东南亚国家</mark>或回流美国。
                    这种调整可能导致短期内成本上升，但可能降低未来地缘政治风险。
                  </p>
                </div>
                
                <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-800/50">
                  <h3 className="font-medium text-purple-300 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    政治考量
                  </h3>
                  <p className="text-sm text-gray-300">
                    分析人士指出，特朗普的关税政策部分是为了兑现其竞选承诺，巩固其<mark className="bg-purple-900/50 text-purple-200 px-1 rounded">蓝领工人</mark>支持基础。
                    然而，如果导致物价上涨，可能会在中期选举中产生反效果。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

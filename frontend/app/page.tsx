"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const getTopicStyles = (title: string): { textColor: string; bgColor: string; borderColor: string; glowColor: string; icon: string } => {
  if (title.includes("经济")) return { textColor: "text-emerald-400", bgColor: "bg-emerald-950/30", borderColor: "border-emerald-800", glowColor: "emerald", icon: "📈" };
  if (title.includes("AI")) return { textColor: "text-blue-400", bgColor: "bg-blue-950/30", borderColor: "border-blue-800", glowColor: "blue", icon: "🤖" };
  if (title.includes("Web3")) return { textColor: "text-purple-400", bgColor: "bg-purple-950/30", borderColor: "border-purple-800", glowColor: "purple", icon: "🔗" };
  if (title.includes("数字货币")) return { textColor: "text-amber-400", bgColor: "bg-amber-950/30", borderColor: "border-amber-800", glowColor: "amber", icon: "💰" };
  if (title.includes("元宇宙")) return { textColor: "text-pink-400", bgColor: "bg-pink-950/30", borderColor: "border-pink-800", glowColor: "pink", icon: "🌌" };
  if (title.includes("版权")) return { textColor: "text-red-400", bgColor: "bg-red-950/30", borderColor: "border-red-800", glowColor: "red", icon: "©️" };
  return { textColor: "text-gray-200", bgColor: "bg-gray-900/60", borderColor: "border-gray-800", glowColor: "gray", icon: "💬" }; // 默认颜色
};

const getHeatIndicator = (heat: number): string => {
  if (heat >= 1000) return "🔥🔥🔥";
  if (heat >= 700) return "🔥🔥";
  return "🔥";
};

const getSupportRatio = (support: number, oppose: number) => {
  const total = support + oppose;
  return total === 0 ? 50 : (support / total) * 100;
};

const useAnimatedVotes = (support: number, oppose: number) => {
  const [animatedSupport, setAnimatedSupport] = useState(support);
  const [animatedOppose, setAnimatedOppose] = useState(oppose);

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate small random fluctuations (up to ±5% of the original value)
      const supportFluctuation = Math.floor(Math.random() * (support * 0.1)) - (support * 0.05);
      const opposeFluctuation = Math.floor(Math.random() * (oppose * 0.1)) - (oppose * 0.05);
      
      setAnimatedSupport(Math.max(0, support + supportFluctuation));
      setAnimatedOppose(Math.max(0, oppose + opposeFluctuation));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [support, oppose]);

  return { animatedSupport, animatedOppose };
};

interface Topic {
  id: string;
  title: string;
  description: string;
  status: string;
  heat: number;
  support: number;
  oppose: number;
  animatedSupport?: number;
  animatedOppose?: number;
}

const mockTopics: Topic[] = [
  {
    id: "1",
    title: "特朗普“解放日”关税引发全球贸易震荡",
    description: "2025年4月2日，美国总统特朗普宣布实施“解放日”关税政策，对大多数国家的进口商品征收10%的基础关税，并对特定商品如汽车和中国进口商品征收更高的关税。这一政策导致全球主要企业，如沃尔玛、Shein、福特和Target，纷纷表示将提高产品价格，以应对成本上升。",
    status: "进行中",
    heat: 1580,
    support: 700,
    oppose: 500,
  },
  {
    id: "2",
    title: "中美达成90天关税缓和协议，市场反应积极",
    description: "在日内瓦举行的中美经贸会谈中，双方同意在未来90天内暂停部分高额关税的实施。美国将对中国商品的部分关税从34%下调至10%，而中国也相应地降低对美国产品的关税。这一举措被视为缓解贸易紧张局势的重要一步，市场对此反应积极。",
    status: "已达成协议",
    heat: 1320,
    support: 850,
    oppose: 300,
  },
  {
    id: "3",
    title: "全球企业应对美国新关税，调整供应链策略",
    description: "面对美国新实施的关税政策，全球企业开始重新评估和调整其供应链策略。许多公司考虑将生产基地转移到关税影响较小的国家，以降低成本并保持竞争力。这一趋势可能对全球贸易格局产生深远影响。",
    status: "调整中",
    heat: 980,
    support: 600,
    oppose: 250,
  },
  {
    id: "4",
    title: "美国消费者面临价格上涨压力，通胀风险加剧",
    description: "由于新关税政策的实施，美国消费者开始感受到价格上涨的压力。从日常用品到电子产品，多个领域的商品价格出现上涨趋势，增加了家庭的生活成本。经济学家警告，这可能加剧通胀风险，影响经济稳定。",
    status: "关注中",
    heat: 890,
    support: 500,
    oppose: 400,
  },
  {
    id: "5",
    title: "特朗普政府推动制造业回流，政策效果存疑",
    description: "特朗普政府强调通过关税政策推动制造业回流美国，以增强国内经济。然而，专家指出，短期内制造业回流的效果有限，且可能导致国际贸易关系紧张，影响美国在全球市场的地位。",
    status: "政策实施中",
    heat: 1020,
    support: 650,
    oppose: 450,
  },
  {
    id: "6",
    title: "国际社会对美国单边关税政策表达关切",
    description: "多个国家和国际组织对美国实施单边关税政策表示关切，认为这可能违反国际贸易规则，破坏多边贸易体系的稳定。呼吁美国与贸易伙伴通过对话解决争端，维护全球经济秩序。",
    status: "外交磋商中",
    heat: 760,
    support: 400,
    oppose: 500,
  },
];

const opinionPool = [
  { content: "这波特朗普的关税真是让人无语，超市里价格涨得飞快，感觉钱包在流血。" },
  { content: "作为一名小微企业主，新关税直接让我的进出口成本涨了20%，压力山大。" },
  { content: "表面上是为了让制造业回流，但现实是转嫁到消费者身上，感觉被割韭菜了。" },
  { content: "中美90天缓和协议算是喘口气，但谁知道后面又会不会反复折腾。" },
  { content: "Shein 这些快时尚品牌受影响，买件衣服都比以前贵了一大截，真切体会到了。" },
  { content: "听说沃尔玛也要涨价，普通家庭的日常开销真的顶不住了。" },
  { content: "本来指望全球供应链优化点，结果关税政策一搞，反而越来越贵，恶性循环。" },
  { content: "对小品牌冲击很大，大公司还能涨价，但小公司只能硬扛，要倒闭一批了。" },
  { content: "政策听上去振奋人心，但制造业回流不是说回就能回，实际难度很大。" },
  { content: "关税一涨，代购、海淘成本飞涨，消费者买单，体验越来越差。" },
  { content: "身边搞外贸的朋友都在考虑转去东南亚建厂，避开美国这波政策风险。" },
  { content: "特朗普想搞保护主义，结果只会让国际贸易更割裂，对大家都没好处。" },
  { content: "作为消费者，我只关心一件事：我买的东西是不是又要涨价了？" },
  { content: "说到底，这些关税还是普通人买单，表面打贸易战，实际影响民生。" },
  { content: "中国降低了对美部分关税，感觉态度很克制，但局势依然不乐观。" },
  { content: "通胀已经够夸张了，新关税政策简直是火上浇油，吃穿用都涨。" },
  { content: "作为制造业从业者，想看到产业回流，但真不是靠加关税就能实现的。" },
  { content: "希望各国能回归多边协作，单边主义只会让经济形势更糟糕。" },
  { content: "这种短期政治操作，受伤的是老百姓，不是大资本。" },
  { content: "关税反复拉扯下，企业信心越来越差，没人敢投长线了。" },
  { content: "关税争端下，很多产品都开始涨价，消费能力跟不上，经济只会更冷。" },
  { content: "国际社会的批评不无道理，美国这波政策太鲁莽了。" },
  { content: "家里做外贸十几年了，这几年一波波关税政策，活下去越来越难了。" },
  { content: "搞这种“拉一刀”的政策，真的能保护本土产业吗？我很怀疑。" },
  { content: "我宁愿花点钱买质量好的进口货，也不希望因为政策被逼着买贵的烂货。" },
  { content: "特朗普这次把全球供应链又搅了一遍，企业只能自救。" },
  { content: "如果一直这么搞下去，美国本土消费者会是最终的买单人。" },
  { content: "作为普通打工人，只希望别再无脑涨价了，已经买不起了。" },
  { content: "与其加税，不如想办法提高本国生产力，这才是正道。" },
  { content: "希望政策面多一些理性声音，别为了短期选票牺牲长期经济。" },
];

const getRandomOpinion = () => {
  const randomIndex = Math.floor(Math.random() * opinionPool.length);
  const randomUserNumber = Math.floor(Math.random() * 1000);
  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

  return {
    user: `匿名用户${randomUserNumber}`,
    content: opinionPool[randomIndex].content,
    timestamp,
    id: `${Date.now()}-${Math.random()}`,
  };
};

export default function HomePage() {
  const [userInput, setUserInput] = useState("");
  const [animatedTopics, setAnimatedTopics] = useState<Topic[]>(() => 
    mockTopics.map(topic => ({
      ...topic,
      animatedSupport: topic.support,
      animatedOppose: topic.oppose,
    })),
  );
  const [opinions, setOpinions] = useState<{ id: string; content: string; user: string; timestamp: string; }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedTopics(prevTopics => 
        prevTopics.map(topic => {
          const supportFluctuation = Math.floor(Math.random() * (topic.support * 0.1)) - (topic.support * 0.05);
          const opposeFluctuation = Math.floor(Math.random() * (topic.oppose * 0.1)) - (topic.oppose * 0.05);
          
          return {
            ...topic,
            animatedSupport: Math.max(0, topic.support + supportFluctuation),
            animatedOppose: Math.max(0, topic.oppose + opposeFluctuation),
          };
        }),
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initialOpinions = [];
    for (let i = 0; i < 3; i++) {
      initialOpinions.push(getRandomOpinion());
    }
    setOpinions(initialOpinions);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpinions(prev => {
        const newOpinion = getRandomOpinion();
        const updatedOpinions = [newOpinion, ...prev];
        return updatedOpinions.slice(0, 6);
      });
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

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
          <span className="ml-3 text-sm text-gray-400">AI·经济·Web3热点</span>
        </div>
        <Button variant="outline" className="rounded-full px-4 text-blue-300 border-blue-700 hover:bg-blue-900/30 hover:text-white hover:border-blue-400 transition">我的话题</Button>
      </header>

      <main className="flex min-h-[calc(100vh-64px)]">
        <div className="flex-1 p-6 overflow-y-auto">
          <motion.div
            className="flex flex-col h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-3xl font-bold text-gray-100 tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              热门议题
            </motion.h1>

            <div className="w-full h-1 bg-gradient-to-r from-blue-800 via-emerald-700 to-pink-700 rounded-full my-4 opacity-30" />

            <div className="grid grid-cols-3 grid-rows-2 gap-5 h-[80vh]">
              <motion.div
                className="col-span-2 row-span-2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                {(() => {
                  const topic = animatedTopics[0] || mockTopics[0];
                  const styles = getTopicStyles(topic.title);
                  return (
                    <Link href="/dashboard" className="h-full block">
                      <Card className={`h-full flex flex-col justify-between transition-all cursor-pointer border-2 ${styles.borderColor} ${styles.bgColor} shadow-md hover:shadow-xl hover:scale-[1.01] relative overflow-hidden group`}>

                        <div className="absolute inset-0 bg-[url('/image.png')] bg-cover bg-center brightness-[0.3] opacity-90 z-0 pointer-events-none"></div>

                        <div className="absolute top-0 left-0 w-full h-10 flex items-center justify-between px-3 z-10">
                          <div className="flex items-center text-red-400 text-sm font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            {topic.animatedSupport || topic.support}
                          </div>
                          <div className="flex items-center text-blue-400 text-sm font-medium">
                            {topic.animatedOppose || topic.oppose}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                            </svg>
                          </div>
                        </div>

                        <div className="absolute top-10 left-0 w-full h-1.5 flex bg-blue-500/30 z-10">
                          <div 
                            className="h-full bg-red-500 transition-all duration-300" 
                            style={{ width: `${getSupportRatio(topic.animatedSupport || topic.support, topic.animatedOppose || topic.oppose)}%` }} 
                          />
                        </div>

                        <div className={`absolute top-1.5 left-0 w-1 h-[calc(100%-0.375rem)] ${styles.bgColor} ${styles.borderColor} z-10`}></div>

                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tr from-white/0 to-gray-500/30 rounded-full blur-3xl opacity-20 group-hover:opacity-35 transition-opacity z-10"></div>

                        <CardContent className="p-6 relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{styles.icon}</span>
                              <h2 className={`text-3xl font-extrabold ${styles.textColor} tracking-tight leading-snug`}>{topic.title}</h2>
                            </div>
                            <Badge variant="outline" className={`text-sm ${styles.textColor} ${styles.borderColor} bg-gray-900/40`}>{topic.status}</Badge>
                          </div>
                          <p className="text-base text-gray-300 mb-6 leading-relaxed">{topic.description}</p>
                          <div className="text-sm font-medium flex items-center gap-1">
                            <span className="text-orange-400">{getHeatIndicator(topic.heat)}</span>
                            <span className="text-gray-400">热度：{topic.heat.toLocaleString()}</span>
                          </div>
                        </CardContent>

                      </Card>
                    </Link>

                  );
                })()}
              </motion.div>

              {animatedTopics.slice(1, 3).map((topic, idx) => {
                const styles = getTopicStyles(topic.title);
                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 + idx * 0.1 }}
                  >
                    <Card className={`h-full flex flex-col justify-between hover:shadow-lg transition cursor-pointer border ${styles.borderColor} ${styles.bgColor} relative overflow-hidden`}>
                      <div className="absolute top-0 left-0 w-full h-8 flex items-center justify-between px-2">
                        <div className="flex items-center text-red-400 text-sm font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          {topic.support}
                        </div>
                        <div className="flex items-center text-blue-400 text-sm font-medium">
                          {topic.oppose}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute top-8 left-0 w-full h-1.5 flex bg-blue-500/30">
                        <div 
                          className="h-full bg-red-500 transition-all duration-300" 
                          style={{ width: `${getSupportRatio(topic.support, topic.oppose)}%` }} 
                        />
                      </div>
                      <div className={`absolute top-1.5 left-0 w-1 h-[calc(100%-0.375rem)] ${styles.bgColor} ${styles.borderColor}`}></div>
                      <CardContent className="p-4 pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <span className="text-lg">{styles.icon}</span>
                            <h3 className={`text-lg font-semibold ${styles.textColor}`}>{topic.title}</h3>
                          </div>
                          <Badge variant="outline" className={`${styles.textColor} ${styles.borderColor} bg-gray-900/40`}>{topic.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{topic.description}</p>
                        <div className="text-xs font-medium flex items-center gap-1">
                          <span className="text-orange-400">{getHeatIndicator(topic.heat)}</span>
                          <span className="text-gray-400">热度：{topic.heat.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

              {animatedTopics.slice(3, 6).map((topic, idx) => {
                const styles = getTopicStyles(topic.title);
                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 + idx * 0.1 }}
                  >
                    <Card className={`flex flex-col justify-between hover:shadow-lg transition cursor-pointer border ${styles.borderColor} ${styles.bgColor} relative overflow-hidden`}>
                      <div className="absolute top-0 left-0 w-full h-8 flex items-center justify-between px-2">
                        <div className="flex items-center text-red-400 text-sm font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          {topic.support}
                        </div>
                        <div className="flex items-center text-blue-400 text-sm font-medium">
                          {topic.oppose}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute top-8 left-0 w-full h-1.5 flex bg-blue-500/30">
                        <div 
                          className="h-full bg-red-500 transition-all duration-300" 
                          style={{ width: `${getSupportRatio(topic.support, topic.oppose)}%` }} 
                        />
                      </div>
                      <div className={`absolute top-1.5 left-0 w-1 h-[calc(100%-0.375rem)] ${styles.bgColor} ${styles.borderColor}`}></div>
                      <CardContent className="p-4 pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <span className="text-lg">{styles.icon}</span>
                            <h3 className={`text-lg font-semibold ${styles.textColor}`}>{topic.title}</h3>
                          </div>
                          <Badge variant="outline" className={`${styles.textColor} ${styles.borderColor} bg-gray-900/40`}>{topic.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{topic.description}</p>
                        <div className="text-xs font-medium flex items-center gap-1">
                          <span className="text-orange-400">{getHeatIndicator(topic.heat)}</span>
                          <span className="text-gray-400">热度：{topic.heat.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* 侧边栏 深色 */}
        <aside className="w-80 border-l border-gray-800 p-4 flex flex-col bg-gray-950/90 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-100 flex items-center gap-2">
            <span className="text-blue-400">•</span>
            实时发言
            <span className="ml-auto text-xs text-gray-500 animate-pulse">实时更新中...</span>
          </h2>
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {opinions.map((opinion) => (
                  <motion.div
                    key={opinion.id}
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="border border-gray-800 rounded-lg p-4 hover:bg-blue-900/10 transition-all duration-300 shadow-sm bg-gray-900/70"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-semibold text-blue-400">{opinion.user}</div>
                      <div className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded-full">{opinion.timestamp}</div>
                    </div>
                    <div className="text-sm text-gray-100 font-medium">{opinion.content}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (userInput.trim()) {
              localStorage.setItem("metaempire_pending_message", userInput);
              window.location.href = "/process";
            }
          }} className="flex flex-col gap-3 border-t pt-4 border-gray-800">
            <Input 
              placeholder="发表你的观点..." 
              className="border-blue-900 bg-gray-950 text-gray-100 placeholder-gray-500 focus:border-blue-400 focus:ring-blue-500" 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="bg-blue-700 hover:bg-blue-600 text-white flex-grow"
                disabled={!userInput.trim()}
              >
                发送
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="border-blue-700 text-blue-300 hover:bg-blue-900/30 hover:text-white hover:border-blue-400 flex items-center gap-1 transition"
                onClick={() => window.location.href = "/process"}
              >
                查看处理流程
              </Button>
            </div>
          </form>
        </aside>
      </main>

      <footer className="text-center py-4 text-gray-600 text-xs bg-transparent">
        © 2025 MetaEmpire · Powered by Next.js & TailwindCSS
      </footer>
    </div>
  );
}

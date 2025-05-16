"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const getTopicStyles = (title: string): { textColor: string; bgColor: string; borderColor: string; glowColor: string; icon: string } => {
  if (title.includes('经济')) return { textColor: 'text-emerald-400', bgColor: 'bg-emerald-950/30', borderColor: 'border-emerald-800', glowColor: 'emerald', icon: '📈' };
  if (title.includes('AI')) return { textColor: 'text-blue-400', bgColor: 'bg-blue-950/30', borderColor: 'border-blue-800', glowColor: 'blue', icon: '🤖' };
  if (title.includes('Web3')) return { textColor: 'text-purple-400', bgColor: 'bg-purple-950/30', borderColor: 'border-purple-800', glowColor: 'purple', icon: '🔗' };
  if (title.includes('数字货币')) return { textColor: 'text-amber-400', bgColor: 'bg-amber-950/30', borderColor: 'border-amber-800', glowColor: 'amber', icon: '💰' };
  if (title.includes('元宇宙')) return { textColor: 'text-pink-400', bgColor: 'bg-pink-950/30', borderColor: 'border-pink-800', glowColor: 'pink', icon: '🌌' };
  if (title.includes('版权')) return { textColor: 'text-red-400', bgColor: 'bg-red-950/30', borderColor: 'border-red-800', glowColor: 'red', icon: '©️' };
  return { textColor: 'text-gray-200', bgColor: 'bg-gray-900/60', borderColor: 'border-gray-800', glowColor: 'gray', icon: '💬' }; // 默认颜色
};

const getHeatIndicator = (heat: number): string => {
  if (heat >= 1000) return '🔥🔥🔥';
  if (heat >= 700) return '🔥🔥';
  return '🔥';
};

const mockTopics = [
  { id: "1", title: "全球经济复苏", description: "后疫情时代的经济复苏路径与政策协同作用。", status: "进行中", heat: 1234 },
  { id: "2", title: "AI与人类共存", description: "AI在就业与社会结构的影响。", status: "AI分析中", heat: 987 },
  { id: "3", title: "Web3隐私保护", description: "区块链在隐私保护与数据主权的应用。", status: "已结算", heat: 456 },
  { id: "4", title: "数字货币监管", description: "全球范围内的数字货币监管政策差异。", status: "进行中", heat: 789 },
  { id: "5", title: "元宇宙与虚拟经济", description: "虚拟经济体系与DAO商业模式创新。", status: "进行中", heat: 1120 },
  { id: "6", title: "AI生成内容的版权归属", description: "AIGC 作品的法律与道德归属问题。", status: "AI分析中", heat: 654 },
];

const opinionPool = [
  { content: "我觉得AI会催生很多我们以前想象不到的新职业。" },
  { content: "说实话，Web3如果不能解决用户门槛，难以大规模普及。" },
  { content: "其实经济复苏还要看全球各国的协作能否顺利。" },
  { content: "元宇宙很酷，但我还没找到能真正吸引我的应用。" },
  { content: "我身边好多人开始接触数字货币，但政策还不够明朗。" },
  { content: "区块链的金融应用我挺看好，但普通人理解有难度。" },
  { content: "我认为Web3的去中心化理想很棒，实现起来却挺难的。" },
  { content: "最近关注AIGC，感觉未来创作者会越来越多元。" },
  { content: "元宇宙游戏的经济系统让我想起了虚拟货币的那些年。" },
  { content: "在我看来，Web3时代每个人都应该拥有数据主权。" },
  { content: "NFT现在炒得很热，但我更关心它的实际场景。" },
  { content: "智能合约如果能进法律行业，或许可以减少很多纠纷。" },
  { content: "我很关心AI模型的可解释性，希望不是只会黑箱决策。" },
  { content: "有时候我担心AIGC会让创意变得太同质化。" },
  { content: "我支持加强对数字货币的监管，否则风险太大了。" },
  { content: "大家都在谈Web3，但实际落地项目还是太少。" },
  { content: "我希望未来元宇宙不只是换皮的社交软件。" },
  { content: "区块链技术还得让普通用户用得更简单才行。" },
  { content: "其实AI已经融入生活了，只是我们没意识到罢了。" },
  { content: "我觉得数据隐私比什么都重要，希望别被滥用。" },
  { content: "NFT收藏我玩过，但总觉得流动性有点问题。" },
  { content: "Web3项目需要更好的用户体验设计，不然留不住人。" },
  { content: "我经常担心AI的伦理边界，这很重要。" },
  { content: "如果数字人民币普及了，现金可能会被彻底淘汰吧？" },
  { content: "生成式AI太强大，有时候分不清真假内容。" },
  { content: "我觉得DAO是个很有趣的组织方式，期待更多实践。" },
  { content: "现在各种元宇宙平台太分散，希望有统一的入口。" },
  { content: "AIGC作品的版权到底归谁？真的是大难题。" },
  { content: "有时候担心Web3反而让骗子有了新机会，要谨慎。" },
  { content: "如果AI能写歌、画画，那普通艺术家会怎样？" },
];

const getRandomOpinion = () => {
  const randomIndex = Math.floor(Math.random() * opinionPool.length);
  const randomUserNumber = Math.floor(Math.random() * 1000);
  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  return {
    user: `匿名用户${randomUserNumber}`,
    content: opinionPool[randomIndex].content,
    timestamp,
    id: `${Date.now()}-${Math.random()}`
  };
};

export default function HomePage() {
  const [userInput, setUserInput] = useState('');
  const [opinions, setOpinions] = useState<Array<{
    user: string;
    content: string;
    timestamp: string;
    id: string;
  }>>([]);

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
      {/* 夜色背景气泡 */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-24 w-64 h-64 bg-emerald-900 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-16 right-24 w-96 h-72 bg-blue-900 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/3 right-1/4 w-52 h-52 bg-pink-900 rounded-full blur-2xl opacity-15"></div>
      </div>

      {/* 顶部导航 深色 */}
      <header className="w-full px-8 py-4 flex items-center justify-between bg-gray-950/90 backdrop-blur border-b border-gray-800 shadow-sm z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-bold text-xl tracking-wide">MetaEmpire</span>
          <span className="ml-3 text-sm text-gray-400">AI·经济·Web3热点</span>
        </div>
        <Button variant="outline" className="rounded-full px-4 text-blue-400 border-blue-700 hover:bg-blue-900/10 hover:border-blue-400 transition">我的话题</Button>
      </header>

      <main className="flex min-h-[calc(100vh-64px)]">
        <div className="flex-1 p-6 overflow-y-auto">
          <motion.div
            className="flex flex-col"
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
                className="col-span-2 row-span-1"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                {(() => {
                  const styles = getTopicStyles(mockTopics[0].title);
                  return (
                    <Card className={`flex flex-col justify-between transition-all cursor-pointer border-2 ${styles.borderColor} ${styles.bgColor} shadow-md hover:shadow-xl hover:scale-[1.01] relative overflow-hidden group`}>
                      <div className={`absolute top-0 left-0 w-1 h-full ${styles.bgColor} ${styles.borderColor}`}></div>
                      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tr from-white/0 to-gray-500/30 rounded-full blur-3xl opacity-20 group-hover:opacity-35 transition-opacity"></div>
                      <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{styles.icon}</span>
                            <h2 className={`text-3xl font-extrabold ${styles.textColor} tracking-tight leading-snug`}>{mockTopics[0].title}</h2>
                          </div>
                          <Badge variant="outline" className={`text-sm ${styles.textColor} ${styles.borderColor} bg-gray-900/40`}>{mockTopics[0].status}</Badge>
                        </div>
                        <p className="text-base text-gray-300 mb-6 leading-relaxed">{mockTopics[0].description}</p>
                        <div className="text-sm font-medium flex items-center gap-1">
                          <span className="text-orange-400">{getHeatIndicator(mockTopics[0].heat)}</span>
                          <span className="text-gray-400">热度：{mockTopics[0].heat.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </motion.div>

              {mockTopics.slice(1, 3).map((topic, idx) => {
                const styles = getTopicStyles(topic.title);
                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 + idx * 0.1 }}
                  >
                    <Card className={`flex flex-col justify-between hover:shadow-lg transition cursor-pointer border ${styles.borderColor} ${styles.bgColor}`}>
                      <CardContent className="p-4">
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

              {mockTopics.slice(3, 6).map((topic, idx) => {
                const styles = getTopicStyles(topic.title);
                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 + idx * 0.1 }}
                  >
                    <Card className={`flex flex-col justify-between hover:shadow-lg transition cursor-pointer border ${styles.borderColor} ${styles.bgColor}`}>
                      <CardContent className="p-4">
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
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
              localStorage.setItem('metaempire_pending_message', userInput);
              window.location.href = '/process';
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
                className="border-blue-700 text-blue-400 hover:bg-blue-900/10 flex items-center gap-1"
                onClick={() => window.location.href = '/process'}
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

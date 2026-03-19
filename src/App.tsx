/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { 
  ArrowRight, 
  Copy, 
  Check, 
  Sparkles, 
  Loader2, 
  RotateCcw,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// 初始化 Gemini API
// 注意：在 AI Studio 环境中，process.env.GEMINI_API_KEY 已自动注入
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 处理文本转换逻辑
  const handleConvert = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // 每次请求时重新初始化，确保使用最新的 API Key
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      // 使用推荐的 gemini-3-flash-preview 模型
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `你是一位文字润色大师，擅长将直白、粗糙的语言转化为现代、优雅且富有深情的表达。

要求：
1. 风格：现代、唯美、含蓄，富有情感深度，类似现代文学或电影台词。
2. 禁令：严禁使用古诗词、文言文或过于生僻的词汇。
3. 目标：保持原意，但提升意境，让文字更有温度。
4. 格式：只需输出润色后的结果，不要包含任何解释、引号或多余文字。

待润色文本：
"${inputText}"` }]
          }
        ],
        config: {
          temperature: 0.8, // 略微提高随机性，增加文学性
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });

      const result = response.text;
      if (result) {
        setOutputText(result.trim());
      } else {
        throw new Error("AI 未能返回有效文本，请稍后再试。");
      }
    } catch (err: any) {
      console.error("转换失败:", err);
      // 提取更友好的错误信息
      const errorMessage = err.message || "网络请求失败，请检查 API 配置或稍后再试。";
      setError(`转换失败: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = useCallback(() => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [outputText]);

  // 重置
  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-2"
          >
            <div className="p-2 bg-indigo-600 rounded-lg shadow-indigo-200 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI 文本润色助手</h1>
          </motion.div>
          <p className="text-slate-500">输入你的想法，让 AI 帮你表达得更出色</p>
        </header>

        {/* Main Content Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
        >
          <div className="flex flex-col md:flex-row min-h-[500px]">
            
            {/* Left: Input Area */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  原始文本
                </label>
                <button 
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  清空
                </button>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="在此输入需要润色或重写的文本..."
                disabled={isLoading}
                className="flex-1 w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500/20 resize-none text-slate-700 placeholder:text-slate-300 transition-all outline-hidden"
              />
            </div>

            {/* Middle: Action Button */}
            <div className="flex items-center justify-center p-4 md:p-0 bg-white z-10">
              <button
                onClick={handleConvert}
                disabled={isLoading || !inputText.trim()}
                className={`
                  relative flex items-center justify-center gap-2 px-6 py-3 md:py-4 md:px-4
                  bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200
                  hover:bg-indigo-700 active:scale-95 disabled:bg-slate-200 disabled:shadow-none
                  transition-all duration-200 group
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="md:hidden">转换中...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 rotate-90 md:rotate-0" />
                    <span className="md:hidden">立即转换</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Output Area */}
            <div className="flex-1 p-6 flex flex-col bg-slate-50/50">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  润色结果
                </label>
                {outputText && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-indigo-200 transition-all"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600">已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>复制结果</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3"
                    >
                      <div className="flex gap-1">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                      </div>
                      <p className="text-sm">AI 正在思考中...</p>
                    </motion.div>
                  ) : outputText ? (
                    <motion.div 
                      key="content"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-full w-full p-4 bg-white rounded-xl border border-indigo-100 text-slate-700 leading-relaxed whitespace-pre-wrap overflow-auto shadow-sm"
                    >
                      {outputText}
                    </motion.div>
                  ) : (
                    <div key="empty" className="h-full w-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-300 italic text-sm">
                      等待转换结果...
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                  {error}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <footer className="mt-8 text-center text-slate-400 text-xs">
          <p>© 2024 AI 文本润色助手 · 基于 Gemini 3 Flash 模型</p>
        </footer>
      </div>
    </div>
  );
}

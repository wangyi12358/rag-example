"use client";
import { useChat } from "@ai-sdk/react";
import Link from "next/link";
import { useState } from "react";

interface ContextItem {
	id: string;
	content: string;
	similarity: number;
	metadata: unknown;
}

interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	experimental_data?: {
		context?: ContextItem[];
	};
}

export default function ChatPage() {
	const {
		messages,
		id,
		status,
		error,
		sendMessage,
		stop,
		addToolOutput,
		regenerate,
		setMessages,
	} = useChat();

	const [input, setInput] = useState("");

	// 从消息的 data 中提取上下文信息
	const getContext = (message: ChatMessage): ContextItem[] | null => {
		if (message.role === "assistant" && message.experimental_data?.context) {
			return message.experimental_data.context;
		}
		return null;
	};

	return (
		<div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
			{/* 导航菜单 */}
			<nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<Link
							href="/"
							className="text-xl font-bold text-zinc-900 dark:text-zinc-50"
						>
							RAG 知识库系统
						</Link>
						<div className="flex space-x-4">
							<Link
								href="/add"
								className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
							>
								添加知识
							</Link>
							<Link
								href="/chat"
								className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
							>
								智能问答
							</Link>
						</div>
					</div>
				</div>
			</nav>

			{/* 主内容 */}
			<main className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8">
				<div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
					{/* 消息列表 */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{messages.length === 0 && (
							<div className="flex h-full items-center justify-center text-center">
								<div>
									<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
										开始对话
									</h2>
									<p className="mt-2 text-zinc-600 dark:text-zinc-400">
										输入您的问题，我会基于知识库为您回答
									</p>
								</div>
							</div>
						)}
						{messages.map((message) => {
							return (
								<div
									key={message.id}
									className={`flex ${
										message.role === "user" ? "justify-end" : "justify-start"
									}`}
								>
									<div
										className={`max-w-[80%] rounded-lg px-4 py-2 ${
											message.role === "user"
												? "bg-blue-600 text-white"
												: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
										}`}
									>
										<div className="whitespace-pre-wrap">
											{message.parts
												.map((part) => (part.type === "text" ? part.text : ""))
												.join("")}
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{/* 输入框 */}
					<div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
						<form className="flex gap-2">
							<input
								type="text"
								value={input}
								onChange={(e) => {
									setInput(e.target.value);
								}}
								disabled={status !== "ready"}
								placeholder="输入您的问题..."
								className="flex-1 rounded-md border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
							/>
							<button
								type="button"
								onClick={() => {
									sendMessage({ text: input });
									setInput("");
								}}
								className="rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
							>
								发送
							</button>
						</form>
					</div>
				</div>
			</main>
		</div>
	);
}

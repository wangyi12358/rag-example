"use client";

import Link from "next/link";
import { useState } from "react";
import { honoRpc } from "@/lib/hono";

export default function AddKnowledgePage() {
	const [text, setText] = useState("");
	const [metadata, setMetadata] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		const response = await honoRpc.api["knowledge-chunk"].$post({
			json: {
				text,
				metadata: metadata ? JSON.parse(metadata) : undefined,
			},
		});

		setMessage({ type: "success", text: "知识添加成功！" });
		setText("");
		setMetadata("");
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
			<main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
				<div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
					<h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
						添加知识
					</h1>

					<form className="space-y-6">
						<div>
							<label
								htmlFor="text"
								className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
							>
								知识内容 <span className="text-red-500">*</span>
							</label>
							<textarea
								id="text"
								value={text}
								onChange={(e) => setText(e.target.value)}
								required
								rows={10}
								className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
								placeholder="请输入要添加的知识内容..."
							/>
						</div>

						<div>
							<label
								htmlFor="metadata"
								className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
							>
								元数据 (可选，JSON 格式)
							</label>
							<textarea
								id="metadata"
								value={metadata}
								onChange={(e) => setMetadata(e.target.value)}
								rows={6}
								className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
								placeholder='{"source": "文档名称", "author": "作者", "category": "分类"}'
							/>
							<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
								例如：{"{"}"source": "产品文档", "author": "张三", "page": 1
								{"}"}
							</p>
						</div>

						{message && (
							<div
								className={`rounded-md p-4 ${
									message.type === "success"
										? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
										: "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
								}`}
							>
								{message.text}
							</div>
						)}

						<div className="flex justify-end">
							<button
								type="button"
								onClick={handleSubmit}
								disabled={loading}
								className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{loading ? "添加中..." : "添加知识"}
							</button>
						</div>
					</form>
				</div>
			</main>
		</div>
	);
}

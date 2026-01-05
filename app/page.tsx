"use client";

import Link from "next/link";

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
			{/* 导航菜单 */}
			<nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center">
							<h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
								RAG 知识库系统
							</h1>
						</div>
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
			<main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
				<div className="text-center">
					<h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
						欢迎使用 RAG 知识库系统
					</h2>
					<p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
						这是一个基于向量检索的智能问答系统
					</p>
					<div className="mt-8 grid gap-4 sm:grid-cols-2">
						<Link
							href="/add"
							className="rounded-lg border border-zinc-200 bg-white p-6 text-left transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
						>
							<h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
								添加知识
							</h3>
							<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
								向知识库中添加新的文档和内容
							</p>
						</Link>
						<Link
							href="/chat"
							className="rounded-lg border border-zinc-200 bg-white p-6 text-left transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
						>
							<h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
								智能问答
							</h3>
							<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
								基于知识库进行智能问答
							</p>
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}

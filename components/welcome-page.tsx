"use client"

import { Button } from "@/components/ui/button"
import {
  FileUp,
  HelpCircle,
  Users,
  Settings,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Keyboard,
  Volume2,
  Lock,
  UserPlus,
  History,
} from "lucide-react"

interface WelcomePageProps {
  onImport: () => void
  onUsePrevious: () => void
  hasPreviousData: boolean
}

export default function WelcomePage({ onImport, onUsePrevious, hasPreviousData }: WelcomePageProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          课堂随机选人工具
        </h1>
        <p className="text-gray-500 dark:text-gray-400">高效、公平的随机选人系统，支持Excel导入和翻页笔控制</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-3xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
                <FileUp className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">导入名单</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">支持Excel、CSV和文本格式</p>
              </div>
            </div>
            <Button onClick={onImport} className="w-full">
              开始导入 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start mb-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4">
                <History className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">使用上次数据</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">继续使用上次导入的名单</p>
              </div>
            </div>
            <Button
              onClick={onUsePrevious}
              className="w-full"
              variant={hasPreviousData ? "default" : "outline"}
              disabled={!hasPreviousData}
            >
              {hasPreviousData ? "继续使用上次数据" : "无可用数据"}
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-start mb-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
              <HelpCircle className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">详细使用说明</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">了解如何使用随机选人工具的各项功能</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium flex items-center mb-2">
                <FileUp className="h-4 w-4 mr-2 text-blue-500" />
                导入学生名单
              </h3>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>支持Excel文件导入，可选择姓名列和学号列</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>也可以直接粘贴文本名单，每行一个名字或用逗号分隔</span>
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium flex items-center mb-2">
                <Users className="h-4 w-4 mr-2 text-green-500" />
                随机选人
              </h3>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex items-center">
                    <ArrowDown className="h-4 w-4 mr-1 text-green-500" />
                    <span>使用翻页笔下键开始随机选人</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
                    <span>使用翻页笔上键清除当前选择</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-1 text-green-500" />
                    <span>可以设置同时选择多名学生</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-medium flex items-center mb-2">
                <Settings className="h-4 w-4 mr-2 text-orange-500" />
                高级功能
              </h3>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex items-center">
                    <Volume2 className="h-4 w-4 mr-1 text-orange-500" />
                    <span>自定义音效，支持导入或URL</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-1 text-orange-500" />
                    <span>加密导出历史记录，保护学生隐私</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="flex items-center">
                    <Keyboard className="h-4 w-4 mr-1 text-orange-500" />
                    <span>支持自定义按键，适配不同翻页笔</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

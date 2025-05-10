"use client"

import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Lock, AlertTriangle } from "lucide-react"
import type { Student } from "@/lib/types"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

interface StudentSelectorProps {
  students: Student[]
  selectedStudents: Student[]
  isSelecting: boolean
  onStart: () => void
  onClear: () => void
  showStudentIds: boolean
  selectionCount: number
  onSettings: () => void
  onHistory: () => void
  themeColor?: string
  isMember: boolean
  selectionUsed: number
  maxSelections: number
  onVerify: () => void
}

export default function StudentSelector({
  students,
  selectedStudents,
  isSelecting,
  onStart,
  onClear,
  showStudentIds,
  selectionCount,
  onSettings,
  onHistory,
  themeColor = "blue",
  isMember,
  selectionUsed,
  maxSelections,
  onVerify,
}: StudentSelectorProps) {
  // Create multiple slots for animation
  const [animationStudents, setAnimationStudents] = useState<Student[][]>([])
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Get theme color class
  const getThemeColorClass = () => {
    switch (themeColor) {
      case "purple":
        return "text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800"
      case "green":
        return "text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
      case "red":
        return "text-red-600 border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
      case "orange":
        return "text-orange-600 border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800"
      default:
        return "text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800"
    }
  }

  // Initialize animation slots when selection count changes
  useEffect(() => {
    // Create empty slots for each selection
    const newSlots = Array(selectionCount)
      .fill(0)
      .map(() => [])
    setAnimationStudents(newSlots)
  }, [selectionCount])

  // Handle animation during selection
  useEffect(() => {
    if (isSelecting && students.length > 0) {
      // Clear any existing animation
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current)
      }

      // Start the animation
      animationIntervalRef.current = setInterval(() => {
        setAnimationStudents((currentSlots) => {
          return Array(selectionCount)
            .fill(0)
            .map(() => {
              // Get a random student for each slot
              const randomIndex = Math.floor(Math.random() * students.length)
              return [students[randomIndex]]
            })
        })
      }, 100) // Update every 100ms for smooth animation

      return () => {
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current)
          animationIntervalRef.current = null
        }
      }
    } else {
      // When selection stops, show the selected students
      if (selectedStudents.length > 0) {
        // Create slots with selected students
        const newSlots = selectedStudents.map((student) => [student])
        // If we have fewer selected students than slots, fill the rest with empty arrays
        while (newSlots.length < selectionCount) {
          newSlots.push([])
        }
        setAnimationStudents(newSlots)
      }
    }
  }, [isSelecting, students, selectedStudents, selectionCount])

  const handleStartSelection = () => {
    if (!isMember && selectionUsed >= maxSelections) {
      toast({
        title: "已达到免费使用次数上限",
        description: "请验证会员以解锁无限使用",
        variant: "destructive",
      })
      return
    }

    onStart()
  }

  return (
    <div className="flex flex-col items-center justify-between h-full py-4">
      {!isMember && (
        <div className="w-full max-w-md mb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 dark:bg-amber-900/20 dark:border-amber-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                <h3 className="font-medium text-amber-700 dark:text-amber-400">免费版限制</h3>
              </div>
              <Button size="sm" variant="outline" onClick={onVerify}>
                <Lock className="h-4 w-4 mr-2" />
                验证会员
              </Button>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-amber-600 dark:text-amber-300">
                已使用 {selectionUsed}/{maxSelections} 次选人功能
              </div>
              <Progress value={(selectionUsed / maxSelections) * 100} className="h-2" />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="mb-8 flex flex-col items-center">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-4">
              {isSelecting ? "正在选择中..." : selectedStudents.length > 0 ? "被选中的学生" : "准备就绪"}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl">
              {animationStudents.map((slot, slotIndex) => (
                <div
                  key={slotIndex}
                  className={`border rounded-lg p-4 min-h-[120px] flex flex-col items-center justify-center ${
                    slot.length > 0 ? getThemeColorClass() : "border-dashed border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {slot.length > 0 ? (
                      <motion.div
                        key={`${slotIndex}-${slot[0].id}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="text-center"
                      >
                        <div className="text-2xl font-bold mb-1">{slot[0].name}</div>
                        {showStudentIds && slot[0].id && <div className="text-sm opacity-80">学号: {slot[0].id}</div>}
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`empty-${slotIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="text-gray-400 dark:text-gray-600 text-center"
                      >
                        {isSelecting ? "选择中..." : "等待选择"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {animationStudents.length === 0 && !isSelecting && (
              <div className="text-xl text-gray-400 py-12">点击"开始随机选人"按钮开始</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 w-full max-w-md">
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={onClear} disabled={selectedStudents.length === 0}>
            <RotateCcw className="h-4 w-4 mr-2" /> 清除 (↑)
          </Button>
          <Button
            onClick={handleStartSelection}
            disabled={isSelecting || students.length === 0}
            size="lg"
            className="px-8"
          >
            <Play className="h-4 w-4 mr-2" /> 开始随机选人 (↓)
          </Button>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <Button variant="ghost" size="sm" onClick={onSettings}>
            设置
          </Button>
          <Button variant="ghost" size="sm" onClick={onHistory}>
            历史记录
          </Button>
        </div>
      </div>
    </div>
  )
}

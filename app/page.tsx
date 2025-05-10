"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import WelcomePage from "@/components/welcome-page"
import StudentSelector from "@/components/student-selector"
import ImportPanel from "@/components/import-panel"
import SettingsPanel from "@/components/settings-panel"
import HistoryPanel from "@/components/history-panel"
import HiddenSettings from "@/components/hidden-settings"
import RemoteControlModal from "@/components/remote-control-modal"
import VerifyMembership from "@/components/verify-membership"
import AdminPanel from "@/components/admin-panel"
import type { Student, AppSettings, AppPage } from "@/lib/types"
import { loadFromStorage, saveToStorage, removeFromStorage } from "@/lib/storage"
import { loadSelectionCount, saveSelectionCount, loadMembershipInfo } from "@/lib/membership"
import { ArrowLeft, Smartphone, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

// Maximum free selections
const MAX_FREE_SELECTIONS = 5

export default function Home() {
  // App state
  const [currentPage, setCurrentPage] = useState<AppPage>("welcome")
  const [pageHistory, setPageHistory] = useState<AppPage[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [history, setHistory] = useState<Student[]>([])
  const [showHiddenSettings, setShowHiddenSettings] = useState(false)
  const [showRemoteControl, setShowRemoteControl] = useState(false)
  const [selectionUsed, setSelectionUsed] = useState(0)
  const [isMember, setIsMember] = useState(false)
  const [memberInfo, setMemberInfo] = useState<any>(null)
  const [settings, setSettings] = useState<AppSettings>({
    animationSpeed: 50,
    enableSound: false, // 默认不开启音效
    selectionMode: "random",
    avoidRepeat: true,
    showStudentIds: false,
    secretStudents: [],
    selectionCount: 1,
    customSoundUrl: "",
    studentWeights: [],
    alwaysSelectStudents: [],
    neverSelectStudents: [],
    animationDuration: 1, // 默认动画持续时间为1秒
    nameSize: 3,
    themeColor: "blue",
    darkMode: false,
    startKey: "ArrowDown",
    clearKey: "ArrowUp",
  })
  const { toast } = useToast()

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedStudents = loadFromStorage<Student[]>("students", [])
    const savedHistory = loadFromStorage<Student[]>("history", [])
    const savedSettings = loadFromStorage<AppSettings>("settings", settings)
    const savedSelectionCount = loadSelectionCount()
    const savedMemberInfo = loadMembershipInfo()

    setStudents(savedStudents)
    setHistory(savedHistory)
    setSettings(savedSettings)
    setSelectionUsed(savedSelectionCount)

    if (savedMemberInfo) {
      setIsMember(savedMemberInfo.isMember)
      setMemberInfo(savedMemberInfo)
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    if (students.length > 0) {
      saveToStorage("students", students)
    }
    if (history.length > 0) {
      saveToStorage("history", history)
    }
    saveToStorage("settings", settings)
  }, [students, history, settings])

  // Save selection count when it changes
  useEffect(() => {
    saveSelectionCount(selectionUsed)
  }, [selectionUsed])

  // Apply dark mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [settings.darkMode])

  // Handle keyboard events for hidden settings and custom keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret key combination for hidden settings (Ctrl+Shift+H)
      if (e.ctrlKey && e.shiftKey && e.key === "H") {
        // Only allow access from settings page
        if (currentPage === "settings") {
          setShowHiddenSettings((prev) => !prev)
        }
        return
      }

      // Secret key combination for admin panel (Ctrl+Shift+A)
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        navigateTo("admin")
        return
      }

      // Only handle clicker keys when on selector page
      if (currentPage !== "selector") return

      // Custom start key
      if (e.code === settings.startKey || e.key === settings.startKey) {
        if (students.length > 0 && !isSelecting) {
          startSelection()
        } else if (students.length === 0) {
          toast({
            title: "无学生名单",
            description: "请先导入学生名单",
            variant: "destructive",
          })
        }
      }
      // Custom clear key
      else if (e.code === settings.clearKey || e.key === settings.clearKey) {
        setSelectedStudents([])
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [students, isSelecting, currentPage, settings.startKey, settings.clearKey])

  const playSelectionSound = () => {
    if (!settings.enableSound) return

    try {
      // Use custom sound if available, otherwise use default
      const soundUrl = settings.customSoundUrl || "/sounds/selection-complete.mp3"
      const audio = new Audio(soundUrl)

      // Add error handling
      audio.onerror = (e) => {
        console.error("Error loading sound:", e)
        // Try fallback sound if custom sound fails
        if (settings.customSoundUrl) {
          const fallbackAudio = new Audio("/sounds/selection-complete.mp3")
          fallbackAudio.play().catch((err) => console.error("Fallback sound error:", err))
        }
      }

      audio.play().catch((e) => console.error("Error playing sound:", e))
    } catch (e) {
      console.error("Sound playback error:", e)
    }
  }

  const startSelection = () => {
    if (students.length === 0) return

    // Check if user has reached the free limit
    if (!isMember && selectionUsed >= MAX_FREE_SELECTIONS) {
      toast({
        title: "已达到免费使用次数上限",
        description: "请验证会员以解锁无限使用",
        variant: "destructive",
      })
      navigateTo("verify")
      return
    }

    setIsSelecting(true)
    setSelectedStudents([]) // Clear previous selections

    // Increment selection count for non-members
    if (!isMember) {
      setSelectionUsed((prev) => prev + 1)
    }

    // Determine how many students to select
    const selectionCount = Math.min(settings.selectionCount, students.length)

    // Create a pool of students to select from
    let studentPool = [...students]

    // Filter out students that should never be selected
    if (settings.neverSelectStudents.length > 0) {
      studentPool = studentPool.filter((student) => !settings.neverSelectStudents.includes(student.id))
    }

    // If there are no students left after filtering, show an error
    if (studentPool.length === 0) {
      toast({
        title: "无可选学生",
        description: "所有学生都被设置为不可选",
        variant: "destructive",
      })
      setIsSelecting(false)
      return
    }

    // If avoiding repeats and we have history, prioritize students who haven't been selected recently
    if (settings.avoidRepeat && history.length > 0) {
      // Sort by frequency in history (least selected first)
      studentPool.sort((a, b) => {
        const aCount = history.filter((h) => h.id === a.id).length
        const bCount = history.filter((h) => h.id === b.id).length
        return aCount - bCount
      })
    }

    // Apply weights if available
    const weightedPool: Student[] = []
    if (settings.studentWeights.length > 0) {
      // Add students to the pool based on their weights
      settings.studentWeights.forEach((weightSetting) => {
        const student = studentPool.find((s) => s.id === weightSetting.studentId)
        if (student) {
          // Add the student to the pool multiple times based on weight
          for (let i = 0; i < weightSetting.weight; i++) {
            weightedPool.push(student)
          }
        }
      })

      // Add any students not in the weights list with default weight of 1
      studentPool.forEach((student) => {
        if (!settings.studentWeights.some((w) => w.studentId === student.id)) {
          weightedPool.push(student)
        }
      })

      // Replace the pool with the weighted pool if it's not empty
      if (weightedPool.length > 0) {
        studentPool = weightedPool
      }
    }

    // Set a timeout to stop the animation after the specified duration
    const animationDuration = (settings.animationDuration || 1) * 1000
    setTimeout(() => {
      setIsSelecting(false)

      // Final selection logic
      const finalSelectedStudents: Student[] = []

      // First, add any "always select" students
      if (settings.alwaysSelectStudents.length > 0) {
        const alwaysSelectCount = Math.min(settings.alwaysSelectStudents.length, selectionCount)
        for (let i = 0; i < alwaysSelectCount; i++) {
          const alwaysStudent = students.find((s) => s.id === settings.alwaysSelectStudents[i])
          if (alwaysStudent) {
            finalSelectedStudents.push(alwaysStudent)
          }
        }
      }

      // Then fill the remaining slots with random students
      const remainingSlots = selectionCount - finalSelectedStudents.length
      if (remainingSlots > 0) {
        // Remove already selected students from the pool
        let remainingPool = studentPool.filter((student) => !finalSelectedStudents.some((s) => s.id === student.id))

        // If pool is empty, use the original pool
        if (remainingPool.length === 0) {
          remainingPool = studentPool
        }

        // Select random students for remaining slots
        for (let i = 0; i < remainingSlots; i++) {
          if (remainingPool.length === 0) break

          const randomIndex = Math.floor(Math.random() * remainingPool.length)
          finalSelectedStudents.push(remainingPool[randomIndex])

          // Remove selected student from pool to avoid duplicates
          remainingPool = remainingPool.filter((_, idx) => idx !== randomIndex)
        }
      }

      setSelectedStudents(finalSelectedStudents)

      // Add to history
      setHistory((prev) => [...finalSelectedStudents, ...prev])

      // Play sound
      playSelectionSound()
    }, animationDuration)
  }

  const handleImport = (importedStudents: Student[]) => {
    setStudents(importedStudents)
    setSelectedStudents([])
    toast({
      title: "导入成功",
      description: `已成功导入 ${importedStudents.length} 名学生`,
    })
    navigateTo("selector")
  }

  const clearSelection = () => {
    setSelectedStudents([])
  }

  const clearHistory = () => {
    setHistory([])
    removeFromStorage("history")
    toast({
      title: "历史记录已清空",
      description: "所有历史记录已被删除",
    })
  }

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const handleMembershipVerified = () => {
    setIsMember(true)
    navigateTo("selector")
  }

  const navigateTo = (page: AppPage) => {
    // Save current page to history before navigating
    if (page !== currentPage) {
      setPageHistory((prev) => [...prev, currentPage])
    }
    setCurrentPage(page)
  }

  const goBack = () => {
    // Navigate to the previous page if available
    if (pageHistory.length > 0) {
      const prevPage = pageHistory[pageHistory.length - 1]
      setCurrentPage(prevPage)
      setPageHistory((prev) => prev.slice(0, -1))
    } else {
      // If no history, go to welcome page
      setCurrentPage("welcome")
    }
  }

  const usePreviousData = () => {
    if (students.length > 0) {
      navigateTo("selector")
      toast({
        title: "已加载上次数据",
        description: `已加载 ${students.length} 名学生`,
      })
    } else {
      toast({
        title: "无可用数据",
        description: "没有找到上次的学生数据",
        variant: "destructive",
      })
    }
  }

  // Animation variants - simplified for better performance
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.1 } },
  }

  // Get background color based on theme
  const getBackgroundColor = () => {
    return settings.darkMode ? "bg-gray-900" : "bg-gray-50"
  }

  return (
    <main className={`flex min-h-screen flex-col items-center p-4 ${getBackgroundColor()}`}>
      <div className="w-full max-w-5xl h-[calc(100vh-2rem)] flex flex-col">
        {currentPage !== "welcome" && (
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>

            {currentPage === "selector" && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowRemoteControl(true)}>
                  <Smartphone className="h-4 w-4 mr-2" />
                  手机控制
                </Button>
                {!isMember && (
                  <Button variant="outline" size="sm" onClick={() => navigateTo("verify")}>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    验证会员
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {currentPage === "welcome" && (
              <motion.div
                key="welcome"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0"
              >
                <WelcomePage
                  onImport={() => navigateTo("import")}
                  onUsePrevious={usePreviousData}
                  hasPreviousData={students.length > 0}
                />
              </motion.div>
            )}

            {currentPage === "selector" && (
              <motion.div
                key="selector"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0"
              >
                <StudentSelector
                  students={students}
                  selectedStudents={selectedStudents}
                  isSelecting={isSelecting}
                  onStart={startSelection}
                  onClear={clearSelection}
                  showStudentIds={settings.showStudentIds}
                  selectionCount={settings.selectionCount}
                  onSettings={() => navigateTo("settings")}
                  onHistory={() => navigateTo("history")}
                  themeColor={settings.themeColor}
                  isMember={isMember}
                  selectionUsed={selectionUsed}
                  maxSelections={MAX_FREE_SELECTIONS}
                  onVerify={() => navigateTo("verify")}
                />
              </motion.div>
            )}

            {currentPage === "import" && (
              <motion.div
                key="import"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0"
              >
                <ImportPanel onImport={handleImport} />
              </motion.div>
            )}

            {currentPage === "settings" && (
              <motion.div
                key="settings"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0"
              >
                <SettingsPanel
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onNavigateBack={() => navigateTo("selector")}
                />
              </motion.div>
            )}

            {currentPage === "history" && (
              <motion.div
                key="history"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0"
              >
                <HistoryPanel
                  history={history}
                  showStudentIds={settings.showStudentIds}
                  onClearHistory={clearHistory}
                />
              </motion.div>
            )}

            {currentPage === "verify" && (
              <motion.div
                key="verify"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0"
              >
                <VerifyMembership onVerified={handleMembershipVerified} onCancel={() => navigateTo("selector")} />
              </motion.div>
            )}

            {currentPage === "admin" && (
              <motion.div
                key="admin"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0"
              >
                <AdminPanel onBack={() => navigateTo("selector")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hidden settings panel */}
        {showHiddenSettings && (
          <HiddenSettings
            students={students}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClose={() => setShowHiddenSettings(false)}
          />
        )}

        {/* Remote control modal */}
        {showRemoteControl && (
          <RemoteControlModal
            onClose={() => setShowRemoteControl(false)}
            onStart={startSelection}
            onClear={clearSelection}
          />
        )}
      </div>
    </main>
  )
}

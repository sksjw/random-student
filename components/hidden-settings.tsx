"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Student, AppSettings, StudentWeight } from "@/lib/types"

interface HiddenSettingsProps {
  students: Student[]
  settings: AppSettings
  onUpdateSettings: (settings: Partial<AppSettings>) => void
  onClose: () => void
}

export default function HiddenSettings({ students, settings, onUpdateSettings, onClose }: HiddenSettingsProps) {
  const [activeTab, setActiveTab] = useState("weights")
  const [alwaysSelectStudents, setAlwaysSelectStudents] = useState<string[]>(settings.alwaysSelectStudents || [])
  const [neverSelectStudents, setNeverSelectStudents] = useState<string[]>(settings.neverSelectStudents || [])
  const [studentWeights, setStudentWeights] = useState<StudentWeight[]>(
    settings.studentWeights.length > 0
      ? settings.studentWeights
      : students.map((student) => ({ studentId: student.id, weight: 1 })),
  )

  const handleToggleAlwaysSelect = (studentId: string) => {
    setAlwaysSelectStudents((prev) => {
      const newList = prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]

      // Remove from never select if added to always select
      if (!prev.includes(studentId)) {
        setNeverSelectStudents((current) => current.filter((id) => id !== studentId))
      }

      return newList
    })
  }

  const handleToggleNeverSelect = (studentId: string) => {
    setNeverSelectStudents((prev) => {
      const newList = prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]

      // Remove from always select if added to never select
      if (!prev.includes(studentId)) {
        setAlwaysSelectStudents((current) => current.filter((id) => id !== studentId))
      }

      return newList
    })
  }

  const handleWeightChange = (studentId: string, weight: number) => {
    setStudentWeights((prev) => {
      const existing = prev.find((item) => item.studentId === studentId)
      if (existing) {
        return prev.map((item) => (item.studentId === studentId ? { ...item, weight } : item))
      } else {
        return [...prev, { studentId, weight }]
      }
    })
  }

  const handleSave = () => {
    onUpdateSettings({
      alwaysSelectStudents,
      neverSelectStudents,
      studentWeights,
    })
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="text-red-500 mr-2">🔒</span>
            高级设置
            <span className="text-xs text-gray-500 ml-2">(仅教师使用)</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="mb-4">
            <TabsTrigger value="weights">学生权重</TabsTrigger>
            <TabsTrigger value="always">必定选择</TabsTrigger>
            <TabsTrigger value="never">必定不选</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto py-4">
            <TabsContent value="weights" className="h-full">
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  设置每个学生被选中的权重，权重越高被选中的概率越大。默认权重为1。
                </p>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {students.length === 0 ? (
                  <div className="text-sm text-gray-500 p-2">请先导入学生名单</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    {students.map((student) => {
                      const weightSetting = studentWeights.find((w) => w.studentId === student.id)
                      const weight = weightSetting ? weightSetting.weight : 1

                      return (
                        <div
                          key={student.id}
                          className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{student.name}</div>
                            {student.id && <div className="text-xs text-gray-500">({student.id})</div>}
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <Label className="whitespace-nowrap text-sm">权重: {weight}</Label>
                            <Slider
                              min={0}
                              max={10}
                              step={1}
                              value={[weight]}
                              onValueChange={(value) => handleWeightChange(student.id, value[0])}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="always" className="h-full">
              <div className="mb-4">
                <p className="text-sm text-gray-500">设置必定会被选中的学生。这些学生将在每次选择中优先被选中。</p>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {students.length === 0 ? (
                  <div className="text-sm text-gray-500 p-2">请先导入学生名单</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {students.map((student) => (
                      <Card
                        key={student.id}
                        className={alwaysSelectStudents.includes(student.id) ? "border-green-500" : ""}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <Checkbox
                              id={`always-${student.id}`}
                              checked={alwaysSelectStudents.includes(student.id)}
                              onCheckedChange={() => handleToggleAlwaysSelect(student.id)}
                            />
                            <div className="flex-1">
                              <Label htmlFor={`always-${student.id}`} className="font-medium cursor-pointer">
                                {student.name}
                              </Label>
                              {student.id && <div className="text-xs text-gray-500">({student.id})</div>}
                              {alwaysSelectStudents.includes(student.id) && (
                                <Badge
                                  variant="outline"
                                  className="mt-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                >
                                  必定选择
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="never" className="h-full">
              <div className="mb-4">
                <p className="text-sm text-gray-500">设置永远不会被选中的学生。这些学生将被排除除在选择范围之外。</p>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {students.length === 0 ? (
                  <div className="text-sm text-gray-500 p-2">请先导入学生名单</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {students.map((student) => (
                      <Card
                        key={student.id}
                        className={neverSelectStudents.includes(student.id) ? "border-red-500" : ""}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <Checkbox
                              id={`never-${student.id}`}
                              checked={neverSelectStudents.includes(student.id)}
                              onCheckedChange={() => handleToggleNeverSelect(student.id)}
                            />
                            <div className="flex-1">
                              <Label htmlFor={`never-${student.id}`} className="font-medium cursor-pointer">
                                {student.name}
                              </Label>
                              {student.id && <div className="text-xs text-gray-500">({student.id})</div>}
                              {neverSelectStudents.includes(student.id) && (
                                <Badge
                                  variant="outline"
                                  className="mt-1 bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                >
                                  不会选择
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>保存设置</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

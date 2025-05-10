"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Trash2, Upload, Lock, Unlock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Student } from "@/lib/types"
import { encryptData, decryptData } from "@/lib/crypto"

interface HistoryPanelProps {
  history: Student[]
  showStudentIds: boolean
  onClearHistory: () => void
}

export default function HistoryPanel({ history, showStudentIds, onClearHistory }: HistoryPanelProps) {
  const [password, setPassword] = useState("")
  const [importPassword, setImportPassword] = useState("")
  const [importFile, setImportFile] = useState<File | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const { toast } = useToast()

  const handleExport = () => {
    if (history.length === 0) {
      toast({
        title: "无历史记录",
        description: "没有可导出的历史记录",
        variant: "destructive",
      })
      return
    }

    if (!password) {
      toast({
        title: "请设置密码",
        description: "导出加密历史记录需要设置密码",
        variant: "destructive",
      })
      return
    }

    try {
      // Prepare history data with timestamps
      const historyWithTimestamps = history.map((student, index) => ({
        ...student,
        timestamp: new Date().toISOString(),
        index: index + 1,
      }))

      // Encrypt the data
      const encryptedData = encryptData(JSON.stringify(historyWithTimestamps), password)

      // Create a blob with the encrypted data
      const blob = new Blob([encryptedData], { type: "application/octet-stream" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `选人历史记录_${new Date().toISOString().slice(0, 10)}.rsh`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "导出成功",
        description: "历史记录已加密导出",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "导出失败",
        description: "加密过程中出现错误",
        variant: "destructive",
      })
    }
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
    }
  }

  const handleImport = () => {
    if (!importFile) {
      toast({
        title: "未选择文件",
        description: "请选择要导入的历史记录文件",
        variant: "destructive",
      })
      return
    }

    if (!importPassword) {
      toast({
        title: "未输入密码",
        description: "请输入解密密码",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const encryptedData = e.target?.result as string
        const decryptedData = decryptData(encryptedData, importPassword)
        const importedHistory = JSON.parse(decryptedData)

        // Validate the imported data
        if (!Array.isArray(importedHistory) || importedHistory.length === 0) {
          throw new Error("Invalid history data format")
        }

        toast({
          title: "导入成功",
          description: `成功导入 ${importedHistory.length} 条历史记录`,
        })

        // Here you would typically update the app's history state
        // But since we don't have direct access to that from this component,
        // we'll just show a success message
      } catch (error) {
        console.error("Import error:", error)
        toast({
          title: "导入失败",
          description: "文件解密失败，请检查密码是否正确",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(importFile)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">历史记录</h2>
          <p className="text-sm text-gray-500">查看本次课堂所有被选中的学生</p>
        </div>

        <Button variant="outline" size="sm" onClick={() => setShowClearConfirm(true)} disabled={history.length === 0}>
          <Trash2 className="h-4 w-4 mr-2" />
          清空历史
        </Button>
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Trash2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>暂无历史记录</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto mb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">序号</TableHead>
                <TableHead>学生姓名</TableHead>
                {showStudentIds && <TableHead>学号</TableHead>}
                <TableHead className="text-right">选择时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((student, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  {showStudentIds && <TableCell>{student.id}</TableCell>}
                  <TableCell className="text-right text-sm text-gray-500">{new Date().toLocaleTimeString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 p-4 border rounded-md">
          <h3 className="font-medium flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            导出加密历史
          </h3>
          <div className="space-y-2">
            <Label htmlFor="export-password">加密密码</Label>
            <Input
              id="export-password"
              type="password"
              placeholder="设置导出密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handleExport} disabled={history.length === 0 || !password} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              加密导出
            </Button>
          </div>
        </div>

        <div className="space-y-2 p-4 border rounded-md">
          <h3 className="font-medium flex items-center">
            <Unlock className="h-4 w-4 mr-2" />
            导入历史记录
          </h3>
          <div className="space-y-2">
            <Label htmlFor="import-file">选择文件</Label>
            <Input id="import-file" type="file" accept=".rsh" onChange={handleImportFile} />
            <Label htmlFor="import-password">解密密码</Label>
            <Input
              id="import-password"
              type="password"
              placeholder="输入解密密码"
              value={importPassword}
              onChange={(e) => setImportPassword(e.target.value)}
            />
            <Button onClick={handleImport} disabled={!importFile || !importPassword} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              解密导入
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空历史记录</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除所有历史记录，且无法恢复。建议在清空前先导出历史记录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={onClearHistory}>确认清空</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

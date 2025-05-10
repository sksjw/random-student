"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { FileUp, Save, Upload, Table, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import * as XLSX from "xlsx"
import type { Student } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"

interface ImportPanelProps {
  onImport: (students: Student[]) => void
}

export default function ImportPanel({ onImport }: ImportPanelProps) {
  const [inputText, setInputText] = useState("")
  const [fileName, setFileName] = useState("")
  const [importMethod, setImportMethod] = useState("text")
  const [excelData, setExcelData] = useState<any[][]>([])
  const [excelHeaders, setExcelHeaders] = useState<string[]>([])
  const [nameColumn, setNameColumn] = useState<string>("")
  const [idColumn, setIdColumn] = useState<string>("")
  const [bindIds, setBindIds] = useState(true)
  const [previewData, setPreviewData] = useState<Student[]>([])
  const [hasHeaders, setHasHeaders] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleTextImport = () => {
    if (!inputText.trim()) {
      toast({
        title: "输入为空",
        description: "请输入学生名单",
        variant: "destructive",
      })
      return
    }

    // Split by newlines, commas, or spaces and filter out empty entries
    const names = inputText
      .split(/[\n,，\s]+/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0)

    if (names.length === 0) {
      toast({
        title: "无有效学生",
        description: "请检查输入格式",
        variant: "destructive",
      })
      return
    }

    // Convert to Student objects
    const students: Student[] = names.map((name, index) => ({
      name,
      id: `S${String(index + 1).padStart(3, "0")}`, // Generate placeholder IDs
    }))

    onImport(students)
  }

  const handleExcelImport = () => {
    if (!nameColumn) {
      toast({
        title: "未选择姓名列",
        description: "请选择包含学生姓名的列",
        variant: "destructive",
      })
      return
    }

    if (previewData.length === 0) {
      toast({
        title: "无有效数据",
        description: "请检查Excel文件格式",
        variant: "destructive",
      })
      return
    }

    onImport(previewData)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      // Handle Excel file
      setImportMethod("excel")
      parseExcelFile(file)
    } else {
      // Handle text file
      setImportMethod("text")
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setInputText(content)
      }
      reader.readAsText(file)
    }
  }

  const parseExcelFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convert to array of arrays
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        if (jsonData.length < 1) {
          toast({
            title: "Excel文件无效",
            description: "文件中没有足够的数据",
            variant: "destructive",
          })
          return
        }

        // Extract headers if the file has them
        let headers: string[] = []
        let dataRows: any[][] = []

        if (hasHeaders && jsonData.length > 1) {
          // Use first row as headers
          headers = jsonData[0].map(String)
          dataRows = jsonData.slice(1)
        } else {
          // Generate column letters as headers (A, B, C, etc.)
          if (jsonData[0] && jsonData[0].length > 0) {
            headers = Array.from(
              { length: jsonData[0].length },
              (_, i) => String.fromCharCode(65 + i), // A, B, C, ...
            )
          }
          dataRows = jsonData
        }

        setExcelData(dataRows)
        setExcelHeaders(headers)

        // Auto-detect name and ID columns
        const possibleNameColumns = ["姓名", "名字", "name", "学生", "学生姓名"]
        const possibleIdColumns = ["学号", "id", "编号", "序号", "工号"]

        const nameCol = headers.find((h) =>
          possibleNameColumns.some((nc) => String(h).toLowerCase().includes(nc.toLowerCase())),
        )
        const idCol = headers.find((h) =>
          possibleIdColumns.some((ic) => String(h).toLowerCase().includes(ic.toLowerCase())),
        )

        if (nameCol) setNameColumn(nameCol)
        if (idCol) setIdColumn(idCol)

        updatePreview(dataRows, headers, nameCol || "", idCol || "")
      } catch (error) {
        console.error("Error parsing Excel file:", error)
        toast({
          title: "解析Excel失败",
          description: "文件格式可能不受支持",
          variant: "destructive",
        })
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const updatePreview = (data: any[][], headers: string[], nameCol: string, idCol: string) => {
    if (!nameCol) return

    const nameIndex = headers.indexOf(nameCol)
    const idIndex = idCol ? headers.indexOf(idCol) : -1

    const students: Student[] = data
      .filter((row) => row[nameIndex]) // Filter out rows without names
      .map((row, index) => ({
        name: String(row[nameIndex]),
        id: idIndex >= 0 && row[idIndex] ? String(row[idIndex]) : `S${String(index + 1).padStart(3, "0")}`,
      }))

    setPreviewData(students)
  }

  const handleColumnChange = (type: "name" | "id", value: string) => {
    if (type === "name") {
      setNameColumn(value)
    } else {
      setIdColumn(value)
    }

    updatePreview(excelData, excelHeaders, type === "name" ? value : nameColumn, type === "id" ? value : idColumn)
  }

  const handleBindIdsChange = (checked: boolean) => {
    setBindIds(checked)
  }

  const handleHasHeadersChange = (checked: boolean) => {
    setHasHeaders(checked)

    // Re-parse the file with the new header setting
    if (fileName && (fileName.endsWith(".xlsx") || fileName.endsWith(".xls"))) {
      const file = fileInputRef.current?.files?.[0]
      if (file) {
        parseExcelFile(file)
      }
    }
  }

  const handleSaveTemplate = () => {
    if (importMethod === "text") {
      if (!inputText.trim()) {
        toast({
          title: "输入为空",
          description: "请先输入学生名单",
          variant: "destructive",
        })
        return
      }

      // Create a blob and download it
      const blob = new Blob([inputText], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "学生名单.txt"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (importMethod === "excel" && previewData.length > 0) {
      // Convert preview data back to CSV
      const csvContent = ["姓名,学号", ...previewData.map((student) => `${student.name},${student.id}`)].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "学生名单.csv"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    toast({
      title: "保存成功",
      description: "学生名单已保存为文件",
    })
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div className="h-full flex flex-col" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="mb-4" variants={itemVariants}>
        <h2 className="text-xl font-bold mb-2">导入学生名单</h2>
        <p className="text-sm text-gray-500 mb-4">支持Excel、CSV和文本格式导入，可以选择姓名和学号列</p>
      </motion.div>

      <div className="flex-1 flex flex-col">
        <motion.div className="mb-4" variants={itemVariants}>
          <Label htmlFor="file-upload" className="mb-2 block">
            上传文件
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              as={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileUp className="h-4 w-4 mr-2" />
              选择文件
            </Button>
            {fileName && <div className="text-sm">{fileName}</div>}
          </div>
        </motion.div>

        <Tabs value={importMethod} onValueChange={setImportMethod} className="flex-1">
          <TabsList className="mb-4">
            <TabsTrigger value="text" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              文本导入
            </TabsTrigger>
            <TabsTrigger value="excel" className="flex items-center">
              <Table className="h-4 w-4 mr-2" />
              Excel导入
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="flex-1 flex flex-col">
            <motion.div className="flex-1 mb-4" variants={itemVariants}>
              <Label htmlFor="student-list" className="mb-2 block">
                学生名单
              </Label>
              <Textarea
                id="student-list"
                placeholder="例如：张三&#10;李四&#10;王五"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="h-[calc(100%-2rem)] min-h-[200px]"
              />
            </motion.div>

            <motion.div className="flex justify-between" variants={itemVariants}>
              <Button
                variant="outline"
                onClick={handleSaveTemplate}
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="h-4 w-4 mr-2" />
                保存为模板
              </Button>
              <Button
                onClick={handleTextImport}
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="h-4 w-4 mr-2" />
                导入名单
              </Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="excel" className="flex-1 flex flex-col">
            {excelHeaders.length > 0 ? (
              <>
                <motion.div className="flex items-center space-x-2 mb-4" variants={itemVariants}>
                  <Checkbox id="has-headers" checked={hasHeaders} onCheckedChange={handleHasHeadersChange} />
                  <Label htmlFor="has-headers">第一行是表头</Label>
                </motion.div>

                <motion.div className="grid grid-cols-2 gap-4 mb-4" variants={itemVariants}>
                  <div>
                    <Label htmlFor="name-column" className="mb-2 block">
                      姓名列
                    </Label>
                    <Select value={nameColumn} onValueChange={(value) => handleColumnChange("name", value)}>
                      <SelectTrigger id="name-column">
                        <SelectValue placeholder="选择姓名列" />
                      </SelectTrigger>
                      <SelectContent>
                        {excelHeaders.map((header, index) => (
                          <SelectItem key={index} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="id-column" className="mb-2 block">
                      学号列
                    </Label>
                    <Select value={idColumn} onValueChange={(value) => handleColumnChange("id", value)}>
                      <SelectTrigger id="id-column">
                        <SelectValue placeholder="选择学号列 (可选)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">不使用学号</SelectItem>
                        {excelHeaders.map((header, index) => (
                          <SelectItem key={index} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>

                <motion.div className="flex items-center space-x-2 mb-4" variants={itemVariants}>
                  <Switch id="bind-ids" checked={bindIds} onCheckedChange={handleBindIdsChange} />
                  <Label htmlFor="bind-ids">显示学生学号 (选中时会同时显示姓名和学号)</Label>
                </motion.div>

                <motion.div className="flex-1 mb-4 overflow-auto border rounded-md" variants={itemVariants}>
                  <div className="text-sm font-medium p-2 bg-gray-100 dark:bg-gray-800 sticky top-0">
                    预览 ({previewData.length} 名学生)
                  </div>
                  <div className="p-2 max-h-[200px] overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">序号</th>
                          <th className="text-left p-2">姓名</th>
                          {bindIds && <th className="text-left p-2">学号</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 10).map((student, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{student.name}</td>
                            {bindIds && <td className="p-2">{student.id}</td>}
                          </tr>
                        ))}
                        {previewData.length > 10 && (
                          <tr>
                            <td colSpan={bindIds ? 3 : 2} className="p-2 text-center text-gray-500">
                              ...还有 {previewData.length - 10} 名学生
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                <motion.div className="flex justify-between" variants={itemVariants}>
                  <Button
                    variant="outline"
                    onClick={handleSaveTemplate}
                    as={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    保存为模板
                  </Button>
                  <Button
                    onClick={handleExcelImport}
                    as={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!nameColumn || previewData.length === 0}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    导入名单
                  </Button>
                </motion.div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col">
                <Table className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500">请上传Excel文件以查看内容</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  )
}

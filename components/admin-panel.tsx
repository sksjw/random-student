"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { generateLicenseFile } from "@/lib/membership"
import { ShieldCheck, Download, ArrowLeft } from "lucide-react"

interface AdminPanelProps {
  onBack: () => void
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [username, setUsername] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLicense, setGeneratedLicense] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerateLicense = () => {
    if (!username.trim()) {
      toast({
        title: "请输入用户名",
        description: "用户名不能为空",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const licenseContent = generateLicenseFile(username.trim())
      setGeneratedLicense(licenseContent)
      toast({
        title: "生成成功",
        description: "验证文件已生成，请点击下载按钮保存",
      })
    } catch (error) {
      console.error("License generation error:", error)
      toast({
        title: "生成失败",
        description: "生成验证文件时出错，请重试",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedLicense) return

    // Create a blob and download it
    const blob = new Blob([generatedLicense], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${username.trim()}_license.lic`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "下载成功",
      description: "验证文件已下载",
    })
  }

  return (
    <div className="container max-w-2xl py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="h-5 w-5 mr-2" />
            管理员控制台 - 生成验证文件
          </CardTitle>
          <CardDescription>为用户生成会员验证文件</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-username">用户名</Label>
            <Input
              id="admin-username"
              placeholder="输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <p className="text-xs text-gray-500">用户名将显示在验证成功后的界面中</p>
          </div>

          <Button onClick={handleGenerateLicense} disabled={isGenerating || !username.trim()} className="w-full">
            {isGenerating ? "生成中..." : "生成验证文件"}
          </Button>

          {generatedLicense && (
            <div className="space-y-2">
              <Alert>
                <AlertDescription>
                  验证文件已生成，包含用户 <strong>{username}</strong> 的信息，有效期为一年。
                </AlertDescription>
              </Alert>

              <Button onClick={handleDownload} className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                下载验证文件
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-xs text-gray-500">注意：验证文件包含加密信息，请妥善保管</div>
        </CardFooter>
      </Card>
    </div>
  )
}

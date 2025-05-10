"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { verifyLicenseFile, saveMembershipInfo } from "@/lib/membership"
import { FileUp, CheckCircle, XCircle, Lock } from "lucide-react"

interface VerifyMembershipProps {
  onVerified: () => void
  onCancel: () => void
}

export default function VerifyMembership({ onVerified, onCancel }: VerifyMembershipProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{ success: boolean; message: string } | null>(null)
  const [username, setUsername] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsVerifying(true)
    setVerificationResult(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string
        const result = verifyLicenseFile(fileContent)

        if (result.valid && result.data) {
          // Save membership info
          saveMembershipInfo({
            isMember: true,
            username: result.data.username,
            expiryDate: result.data.expiryDate,
            verificationDate: result.data.verificationDate,
            key: result.data.key,
          })

          setVerificationResult({
            success: true,
            message: `验证成功！${result.data.username}，您的会员有效期至 ${new Date(result.data.expiryDate).toLocaleDateString()}`,
          })

          // Notify parent component after a short delay
          setTimeout(() => {
            onVerified()
            toast({
              title: "会员验证成功",
              description: "您已成功解锁所有功能",
            })
          }, 2000)
        } else {
          setVerificationResult({
            success: false,
            message: "验证失败，无效的验证文件或已过期",
          })
        }
      } catch (error) {
        console.error("Verification error:", error)
        setVerificationResult({
          success: false,
          message: "验证过程中出错，请检查文件格式",
        })
      } finally {
        setIsVerifying(false)
      }
    }

    reader.onerror = () => {
      setVerificationResult({
        success: false,
        message: "读取文件时出错，请重试",
      })
      setIsVerifying(false)
    }

    reader.readAsText(file)
  }

  return (
    <div className="flex justify-center items-center min-h-[500px]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            会员验证
          </CardTitle>
          <CardDescription>上传验证文件以解锁所有功能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名 (可选)</Label>
            <Input
              id="username"
              placeholder="输入您的用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <p className="text-xs text-gray-500">如果验证文件中包含用户名，将覆盖此处输入</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="license-file">验证文件</Label>
            <Input
              ref={fileInputRef}
              id="license-file"
              type="file"
              accept=".license,.lic,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 border-dashed"
              disabled={isVerifying}
            >
              <div className="flex flex-col items-center">
                <FileUp className="h-8 w-8 mb-2 text-gray-400" />
                <span>{isVerifying ? "验证中..." : "点击上传验证文件"}</span>
              </div>
            </Button>
          </div>

          {verificationResult && (
            <Alert variant={verificationResult.success ? "default" : "destructive"}>
              <div className="flex items-center">
                {verificationResult.success ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                <AlertTitle>{verificationResult.success ? "验证成功" : "验证失败"}</AlertTitle>
              </div>
              <AlertDescription>{verificationResult.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button
            onClick={() => {
              window.open("https://example.com/get-license", "_blank")
            }}
          >
            获取验证文件
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

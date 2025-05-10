"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Smartphone, Loader2, RefreshCw } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useToast } from "@/components/ui/use-toast"

interface RemoteControlModalProps {
  onClose: () => void
  onStart: () => void
  onClear: () => void
}

export default function RemoteControlModal({ onClose, onStart, onClear }: RemoteControlModalProps) {
  const [controlUrl, setControlUrl] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [connectionError, setConnectionError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { toast } = useToast()
  const wsRef = useRef<WebSocket | null>(null)

  // Check if current device is mobile
  useEffect(() => {
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    setIsMobile(checkMobile())
  }, [])

  // Generate a unique session ID and setup connection
  useEffect(() => {
    const newSessionId = Math.random().toString(36).substring(2, 10)
    setSessionId(newSessionId)

    // Get the current URL without query parameters
    const baseUrl = window.location.origin + window.location.pathname

    // Create control URL
    if (isMobile) {
      // For mobile, try to connect to the desktop
      setControlUrl(`${baseUrl}?controller=true&id=${newSessionId}`)
    } else {
      // For desktop, create a URL for mobile to scan
      setControlUrl(`${baseUrl}?controller=true&id=${newSessionId}`)
    }

    // Setup WebSocket connection
    setupWebSocket(newSessionId)

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [isMobile])

  const setupWebSocket = (sid: string) => {
    setIsConnecting(true)
    setConnectionError(false)

    try {
      // In a real implementation, this would connect to your WebSocket server
      // For demo purposes, we'll create a mock WebSocket

      // Simulate connection delay
      setTimeout(() => {
        try {
          // Create a mock WebSocket that simulates the behavior
          const mockWs = {
            send: (data: string) => {
              console.log("Sent data:", data)

              // If this is mobile, simulate sending commands to desktop
              if (isMobile) {
                const command = JSON.parse(data)
                if (command.action === "start") {
                  onStart()
                } else if (command.action === "clear") {
                  onClear()
                }
              }
            },
            close: () => {
              setIsConnected(false)
              console.log("WebSocket closed")
            },
            addEventListener: (event: string, callback: Function) => {
              if (event === "message") {
                // Store the message handler to call it later in our simulation
                ;(mockWs as any).messageHandler = callback
              } else if (event === "open") {
                // Simulate connection success
                setTimeout(() => {
                  callback()
                }, 500)
              }
            },
            onopen: () => {
              setIsConnected(true)
              setIsConnecting(false)

              if (isMobile) {
                toast({
                  title: "已连接到电脑",
                  description: "您现在可以控制电脑上的选人工具",
                })
              } else {
                toast({
                  title: "远程控制已准备就绪",
                  description: "请使用手机扫描二维码连接",
                })
              }
            },
          } as unknown as WebSocket

          // Simulate successful connection after a delay
          setTimeout(() => {
            mockWs.onopen()
          }, 1500)

          wsRef.current = mockWs

          // If mobile, simulate receiving a connection from desktop
          if (isMobile) {
            setTimeout(() => {
              setIsConnected(true)
              setIsConnecting(false)
            }, 2000)
          }
        } catch (error) {
          console.error("WebSocket connection error:", error)
          setConnectionError(true)
          setIsConnecting(false)

          toast({
            title: "连接失败",
            description: "无法建立远程控制连接",
            variant: "destructive",
          })
        }
      }, 1000)
    } catch (error) {
      console.error("WebSocket setup error:", error)
      setConnectionError(true)
      setIsConnecting(false)

      toast({
        title: "连接失败",
        description: "无法建立远程控制连接",
        variant: "destructive",
      })
    }
  }

  const handleRetryConnection = () => {
    if (sessionId) {
      setupWebSocket(sessionId)
    } else {
      const newSessionId = Math.random().toString(36).substring(2, 10)
      setSessionId(newSessionId)
      setupWebSocket(newSessionId)
    }
  }

  // Handle remote control commands
  const handleRemoteStart = () => {
    if (!isConnected) {
      toast({
        title: "未连接",
        description: "请先等待连接成功",
        variant: "destructive",
      })
      return
    }

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ action: "start" }))
    }

    // If this is desktop, the command will be received by the mobile
    // If this is mobile, we'll directly call onStart
    if (isMobile) {
      onStart()
    }
  }

  const handleRemoteClear = () => {
    if (!isConnected) {
      toast({
        title: "未连接",
        description: "请先等待连接成功",
        variant: "destructive",
      })
      return
    }

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ action: "clear" }))
    }

    // If this is desktop, the command will be received by the mobile
    // If this is mobile, we'll directly call onClear
    if (isMobile) {
      onClear()
    }
  }

  // If connected and on desktop, auto-close the modal
  useEffect(() => {
    if (isConnected && !isMobile) {
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        toast({
          title: "远程控制已连接",
          description: "手机已成功连接，可以开始远程控制",
        })
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isConnected, isMobile, onClose])

  // Mobile view - full screen controller
  if (isMobile) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              手机远程控制
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4 py-4">
            {isConnected ? (
              <>
                <div className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium">
                  已连接到电脑
                </div>

                <div className="grid grid-cols-1 gap-4 w-full">
                  <Button onClick={handleRemoteClear} className="h-24 text-lg" variant="outline">
                    <RotateCcw className="h-6 w-6 mr-3" />
                    清除选择
                  </Button>
                  <Button onClick={handleRemoteStart} className="h-24 text-lg">
                    <Play className="h-6 w-6 mr-3" />
                    开始随机选人
                  </Button>
                </div>
              </>
            ) : isConnecting ? (
              <>
                <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>正在连接到电脑...</span>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">正在尝试连接到同一网络的电脑</p>
                  <p className="text-xs text-gray-400">请确保电脑已开启远程控制功能</p>
                  <p className="text-xs font-mono mt-2 bg-gray-100 dark:bg-gray-800 p-1 rounded">会话ID: {sessionId}</p>
                </div>
              </>
            ) : connectionError ? (
              <>
                <div className="text-red-500 mb-4">连接失败，请检查网络连接</div>

                <Button onClick={handleRetryConnection}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重试连接
                </Button>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Desktop view - QR code for mobile to scan
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            手机远程控制
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {isConnected ? (
            <>
              <div className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium">
                已连接
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-gray-500 mb-2">手机已成功连接，可以开始远程控制</p>
                <p className="text-xs text-gray-400">此窗口将自动关闭...</p>
              </div>
            </>
          ) : isConnecting ? (
            <>
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>正在准备远程控制...</span>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">正在初始化远程控制连接</p>
                <p className="text-xs text-gray-400">请稍候...</p>
              </div>
            </>
          ) : connectionError ? (
            <>
              <div className="text-red-500 mb-4">连接失败，请检查网络连接</div>

              <Button onClick={handleRetryConnection}>
                <RefreshCw className="h-4 w-4 mr-2" />
                重试连接
              </Button>
            </>
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <QRCodeSVG value={controlUrl} size={200} />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">使用手机扫描上方二维码连接</p>
                <p className="text-xs text-gray-400">确保手机和电脑在同一局域网内</p>
                <p className="text-xs font-mono mt-2 bg-gray-100 dark:bg-gray-800 p-1 rounded">会话ID: {sessionId}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

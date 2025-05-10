"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Save, Volume2, Upload, Sliders, Users, Keyboard } from "lucide-react"
import type { AppSettings } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SettingsPanelProps {
  settings: AppSettings
  onUpdateSettings: (settings: Partial<AppSettings>) => void
  onNavigateBack: () => void
}

export default function SettingsPanel({ settings, onUpdateSettings, onNavigateBack }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings })
  const audioFileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [testAudioPlaying, setTestAudioPlaying] = useState(false)

  const handleSave = () => {
    onUpdateSettings(localSettings)
    toast({
      title: "设置已保存",
      description: "您的设置已成功保存",
    })
    onNavigateBack()
  }

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a blob URL for the audio file
    const audioUrl = URL.createObjectURL(file)
    updateSetting("customSoundUrl", audioUrl)

    toast({
      title: "音效已上传",
      description: `已设置自定义音效: ${file.name}`,
    })
  }

  const testAudio = () => {
    if (testAudioPlaying) return

    try {
      setTestAudioPlaying(true)
      const soundUrl = localSettings.customSoundUrl || "/sounds/selection-complete.mp3"
      const audio = new Audio(soundUrl)

      audio.onended = () => {
        setTestAudioPlaying(false)
      }

      audio.onerror = () => {
        setTestAudioPlaying(false)
        toast({
          title: "音效测试失败",
          description: "无法播放音效，请检查URL或文件格式",
          variant: "destructive",
        })
      }

      audio.play().catch((e) => {
        console.error("Error playing test sound:", e)
        setTestAudioPlaying(false)
        toast({
          title: "音效测试失败",
          description: "无法播放音效，请检查URL或文件格式",
          variant: "destructive",
        })
      })
    } catch (e) {
      setTestAudioPlaying(false)
      toast({
        title: "音效测试失败",
        description: "无法播放音效，请检查URL或文件格式",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="h-full py-2 overflow-hidden flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">设置</h2>
        <p className="text-sm text-gray-500">自定义随机选人工具的行为</p>
      </div>

      <Tabs defaultValue="general" className="flex-1 overflow-hidden">
        <TabsList className="mb-4">
          <TabsTrigger value="general" className="flex items-center gap-1">
            <Sliders className="h-4 w-4" />
            <span>基本设置</span>
          </TabsTrigger>
          <TabsTrigger value="selection" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>选择设置</span>
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-1">
            <Keyboard className="h-4 w-4" />
            <span>控制设置</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto pr-2">
          <TabsContent value="general" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Volume2 className="h-4 w-4 mr-2" />
                    音效设置
                  </CardTitle>
                  <CardDescription>自定义选人完成时的提示音</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-toggle" className="cursor-pointer">
                      启用音效
                    </Label>
                    <Switch
                      id="sound-toggle"
                      checked={localSettings.enableSound}
                      onCheckedChange={(checked) => updateSetting("enableSound", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-sound-url">自定义音效URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="custom-sound-url"
                        placeholder="输入音效文件URL或上传文件"
                        value={localSettings.customSoundUrl}
                        onChange={(e) => updateSetting("customSoundUrl", e.target.value)}
                        disabled={!localSettings.enableSound}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={testAudio}
                        disabled={!localSettings.enableSound || testAudioPlaying}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Input
                      ref={audioFileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => audioFileInputRef.current?.click()}
                      disabled={!localSettings.enableSound}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      上传音效文件
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">支持mp3、wav、ogg等格式</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">动画设置</CardTitle>
                  <CardDescription>调整选人动画的速度和效果</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="animation-speed">动画速度</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">慢</span>
                      <Slider
                        id="animation-speed"
                        min={0}
                        max={100}
                        step={1}
                        value={[localSettings.animationSpeed]}
                        onValueChange={(value) => updateSetting("animationSpeed", value[0])}
                        className="flex-1"
                      />
                      <span className="text-sm">快</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="animation-duration">动画持续时间</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">短</span>
                      <Slider
                        id="animation-duration"
                        min={1}
                        max={10}
                        step={1}
                        value={[localSettings.animationDuration || 1]}
                        onValueChange={(value) => updateSetting("animationDuration", value[0])}
                        className="flex-1"
                      />
                      <span className="text-sm">{localSettings.animationDuration || 1}秒</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="selection" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">选择设置</CardTitle>
                  <CardDescription>调整选人的方式和数量</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="selection-count">同时选择人数</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">1人</span>
                      <Slider
                        id="selection-count"
                        min={1}
                        max={10}
                        step={1}
                        value={[localSettings.selectionCount]}
                        onValueChange={(value) => updateSetting("selectionCount", value[0])}
                        className="flex-1"
                      />
                      <span className="text-sm">{localSettings.selectionCount}人</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selection-mode">选择模式</Label>
                    <Select
                      value={localSettings.selectionMode}
                      onValueChange={(value: any) => updateSetting("selectionMode", value)}
                    >
                      <SelectTrigger id="selection-mode">
                        <SelectValue placeholder="选择模式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="random">完全随机</SelectItem>
                        <SelectItem value="weighted">加权随机（被点名少的优先）</SelectItem>
                        <SelectItem value="sequential">顺序选择</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="repeat-toggle" className="cursor-pointer">
                      避免重复选择同一学生
                    </Label>
                    <Switch
                      id="repeat-toggle"
                      checked={localSettings.avoidRepeat}
                      onCheckedChange={(checked) => updateSetting("avoidRepeat", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="id-toggle" className="cursor-pointer">
                      显示学生学号
                    </Label>
                    <Switch
                      id="id-toggle"
                      checked={localSettings.showStudentIds}
                      onCheckedChange={(checked) => updateSetting("showStudentIds", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">显示设置</CardTitle>
                  <CardDescription>调整界面显示效果</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name-size">姓名大小</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">小</span>
                      <Slider
                        id="name-size"
                        min={1}
                        max={5}
                        step={1}
                        value={[localSettings.nameSize || 3]}
                        onValueChange={(value) => updateSetting("nameSize", value[0])}
                        className="flex-1"
                      />
                      <span className="text-sm">大</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme-color">主题颜色</Label>
                    <Select
                      value={localSettings.themeColor || "blue"}
                      onValueChange={(value: any) => updateSetting("themeColor", value)}
                    >
                      <SelectTrigger id="theme-color">
                        <SelectValue placeholder="选择颜色" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">蓝色</SelectItem>
                        <SelectItem value="purple">紫色</SelectItem>
                        <SelectItem value="green">绿色</SelectItem>
                        <SelectItem value="red">红色</SelectItem>
                        <SelectItem value="orange">橙色</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode" className="cursor-pointer">
                      深色模式
                    </Label>
                    <Switch
                      id="dark-mode"
                      checked={localSettings.darkMode || false}
                      onCheckedChange={(checked) => updateSetting("darkMode", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="controls" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">按键设置</CardTitle>
                <CardDescription>自定义控制按键，适配不同翻页笔</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-key">开始选人按键</Label>
                    <Select
                      value={localSettings.startKey || "ArrowDown"}
                      onValueChange={(value: any) => updateSetting("startKey", value)}
                    >
                      <SelectTrigger id="start-key">
                        <SelectValue placeholder="选择按键" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ArrowDown">下箭头 (↓)</SelectItem>
                        <SelectItem value="PageDown">翻页键 (Page Down)</SelectItem>
                        <SelectItem value="Space">空格键 (Space)</SelectItem>
                        <SelectItem value="Enter">回车键 (Enter)</SelectItem>
                        <SelectItem value="KeyB">B键</SelectItem>
                        <SelectItem value="KeyN">N键</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clear-key">清除选择按键</Label>
                    <Select
                      value={localSettings.clearKey || "ArrowUp"}
                      onValueChange={(value: any) => updateSetting("clearKey", value)}
                    >
                      <SelectTrigger id="clear-key">
                        <SelectValue placeholder="选择按键" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ArrowUp">上箭头 (↑)</SelectItem>
                        <SelectItem value="PageUp">翻页键 (Page Up)</SelectItem>
                        <SelectItem value="Escape">ESC键</SelectItem>
                        <SelectItem value="Backspace">退格键 (Backspace)</SelectItem>
                        <SelectItem value="KeyC">C键</SelectItem>
                        <SelectItem value="KeyX">X键</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      updateSetting("startKey", "ArrowDown")
                      updateSetting("clearKey", "ArrowUp")
                      toast({
                        title: "已重置按键设置",
                        description: "按键设置已恢复默认",
                      })
                    }}
                  >
                    恢复默认按键设置
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <div className="pt-4">
        <Button onClick={handleSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          保存设置
        </Button>
      </div>
    </div>
  )
}

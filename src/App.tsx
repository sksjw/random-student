import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Shuffle, Users, X, Settings, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import gsap from 'gsap';

function App() {
  const [names, setNames] = useState<string[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [multipleCount, setMultipleCount] = useState<number>(1);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedNamesRef = useRef<HTMLDivElement>(null);
  const spinningNamesRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const { toast } = useToast();

  useEffect(() => {
    if (selectedNames.length > 0 && selectedNamesRef.current) {
      gsap.fromTo(
        selectedNamesRef.current.children,
        {
          opacity: 0,
          y: 20,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.1,
          ease: "back.out(1.7)",
          duration: 0.6,
        }
      );
    }
  }, [selectedNames]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      toast({
        title: "错误",
        description: "请添加TXT格式名单，一行一个",
        variant: "destructive"
      });
      return;
    }

    setCurrentFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const nameList = text.split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      if (nameList.length === 0) {
        toast({
          title: "错误",
          description: "文件内容为空",
          variant: "destructive"
        });
        return;
      }

      gsap.to(".name-list", {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => {
          setNames(nameList);
          setSelectedNames([]);
          gsap.fromTo(".name-list",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5 }
          );
        }
      });

      toast({
        title: "成功",
        description: `已导入 ${nameList.length} 个名字`,
      });
    };
    reader.readAsText(file);
  };

  const pickRandomNames = () => {
    if (names.length === 0) {
      toast({
        title: "提示",
        description: "请先上传名单",
        variant: "destructive"
      });
      return;
    }

    if (multipleCount > names.length) {
      toast({
        title: "错误",
        description: "选择人数不能大于名单总人数",
        variant: "destructive"
      });
      return;
    }

    setIsSpinning(true);

    if (!showAnimation) {
      // If animation is disabled, just show the final result
      const shuffled = [...names].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, multipleCount);
      setSelectedNames(selected);
      setIsSpinning(false);
      return;
    }

    // Initialize with random names
    const initialSelection = Array(multipleCount).fill('').map(() => 
      names[Math.floor(Math.random() * names.length)]
    );
    setSelectedNames(initialSelection);

    let count = 0;
    const duration = 2000; // 2 seconds
    const interval = 50; // Update every 50ms
    const totalSteps = duration / interval;
    
    const timer = setInterval(() => {
      // Generate new random names for each position
      const newSelected = Array(multipleCount).fill('').map(() => 
        names[Math.floor(Math.random() * names.length)]
      );
      setSelectedNames(newSelected);

      // Animate each name independently
      Object.values(spinningNamesRef.current).forEach((element) => {
        if (element) {
          gsap.to(element, {
            scale: 1.1,
            duration: 0.1,
            yoyo: true,
            ease: "power1.inOut",
            repeat: 1
          });
        }
      });

      count++;
      
      if (count >= totalSteps) {
        clearInterval(timer);
        // Final selection
        const shuffled = [...names].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, multipleCount);
        setSelectedNames(selected);
        setIsSpinning(false);
      }
    }, interval);
  };

  const clearList = () => {
    gsap.to(".name-list", {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => {
        setNames([]);
        setSelectedNames([]);
        setCurrentFileName("");
        setShowClearConfirm(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    });
  };

  const clearSelection = () => {
    if (selectedNamesRef.current) {
      gsap.to(selectedNamesRef.current.children, {
        opacity: 0,
        y: -20,
        stagger: 0.1,
        duration: 0.3,
        onComplete: () => setSelectedNames([])
      });
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <Card className="border-[0.5px] border-neutral-800 bg-black/50 shadow-2xl backdrop-blur-sm">
          <CardHeader className="border-b border-neutral-800">
            <CardTitle className="text-4xl font-light tracking-tight text-white text-center">
              随机选人
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 bg-white text-black hover:bg-neutral-200 hover:scale-105 transition-all hover:text-black"
                variant="outline"
              >
                <Upload size={18} />
                上传名单
              </Button>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-neutral-900 text-white border-neutral-700 hover:bg-neutral-800"
                    >
                      <Settings size={18} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-neutral-900 border-neutral-800">
                    <DialogHeader>
                      <DialogTitle className="text-white">设置</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-white">选择人数</h4>
                        <Slider
                          value={[multipleCount]}
                          onValueChange={(value) => setMultipleCount(value[0])}
                          max={20}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="text-center text-white">
                          当前选择: {multipleCount} 人
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-animation" className="text-white">
                          显示随机动画
                        </Label>
                        <Switch
                          id="show-animation"
                          checked={showAnimation}
                          onCheckedChange={setShowAnimation}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={pickRandomNames}
                  className="gap-2 bg-black text-white border border-white hover:bg-white hover:text-black hover:scale-105 transition-all"
                  disabled={isSpinning}
                >
                  <Shuffle size={18} />
                  开始选择
                </Button>
              </div>
            </div>

            {currentFileName && (
              <div className="flex items-center justify-center gap-2 text-neutral-400 animate-fadeIn">
                <span className="text-sm">当前文件: {currentFileName}</span>
              </div>
            )}

            {selectedNames.length > 0 && (
              <div className="text-center py-12 border-y border-neutral-800 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 text-neutral-500 hover:text-white"
                  onClick={clearSelection}
                >
                  <X size={18} />
                </Button>
                <div ref={selectedNamesRef} className="flex flex-wrap justify-center gap-4">
                  {selectedNames.map((name, index) => (
                    <div
                      key={index}
                      ref={el => spinningNamesRef.current[index] = el}
                      className={`text-4xl font-light text-white tracking-wider transition-all duration-200
                        ${isSpinning ? 'blur-sm' : 'blur-0'}`}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {names.length > 0 && (
              <div className="space-y-4 name-list">
                <div className="flex items-center justify-between text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Users size={18} />
                    <span className="text-sm font-medium">
                      已导入名单 ({names.length})
                    </span>
                  </div>
                  <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-neutral-500 hover:text-white"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-neutral-900 border-neutral-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">确认清除</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                          确定要清除当前名单吗？此操作无法撤销。
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="sm:justify-start">
                        <div className="flex gap-2 w-full">
                          <Button
                            type="button"
                            variant="ghost"
                            className="flex-1 text-white hover:bg-neutral-800"
                            onClick={() => setShowClearConfirm(false)}
                          >
                            取消
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            className="flex-1"
                            onClick={clearList}
                          >
                            确认清除
                          </Button>
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <ScrollArea className="h-[200px] rounded-md border border-neutral-800 bg-neutral-900/30">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4">
                    {names.map((name, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 rounded-md bg-neutral-800/50 text-neutral-200 text-center text-sm hover:bg-neutral-700/50 transition-colors"
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
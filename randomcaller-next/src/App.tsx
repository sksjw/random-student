import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Container, TextField, Button, Typography, Box, Paper } from '@mui/material';
import "./App.css";

function App() {
  const [names, setNames] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");

  /**
   * 处理名单文本区域的变化
   * @param event - 文本区域变化事件
   */
  const handleNameInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNameInput(event.target.value);
  };

  /**
   * 导入名单，将文本区域内容按行分割成数组
   */
  const importNames = () => {
    const namesArray = nameInput.split('\n').map(name => name.trim()).filter(name => name !== '');
    setNames(namesArray);
    setSelectedName(null);
  };

  /**
   * 从文件导入名单
   */
  const importFromFile = async () => {
    try {
      const content = await invoke<string>('open_file_dialog');
      setNameInput(content);
      const namesArray = content.split('\n').map(name => name.trim()).filter(name => name !== '');
      setNames(namesArray);
      setSelectedName(null);
    } catch (error) {
      console.error('导入文件失败:', error);
    }
  };

  /**
   * 从导入的名单中随机选择一个名字
   */
  const selectRandomName = () => {
    if (names.length > 0) {
      const randomIndex = Math.floor(Math.random() * names.length);
      setSelectedName(names[randomIndex]);
    } else {
      setSelectedName("请先导入名单");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          随机选人工具
        </Typography>
        <TextField
          label="输入或粘贴名单 (每行一个名字)"
          multiline
          rows={10}
          fullWidth
          value={nameInput}
          onChange={handleNameInputChange}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="contained" onClick={importNames}>
            导入文本
          </Button>
          <Button variant="contained" color="primary" onClick={importFromFile}>
            从文件导入
          </Button>
        </Box>
        <Button variant="contained" color="secondary" onClick={selectRandomName} disabled={names.length === 0}>
          随机选择
        </Button>
        {selectedName && (
          <Paper elevation={3} sx={{ mt: 4, p: 2, width: '100%', textAlign: 'center' }}>
            <Typography variant="h5">
              选中的人是:
            </Typography>
            <Typography variant="h3" color="primary">
              {selectedName}
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default App;

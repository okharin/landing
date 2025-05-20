import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  IconButton,
  Collapse,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { API_URL } from '@/config/api';

interface TaskCardProps {
  task: {
    id: number;
    title: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    progress: number;
    error?: string;
    outputFiles: string[];
    createdAt: string;
  };
  onDelete: (id: number) => void;
}

const ExpandMore = styled((props: any) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [downloadableFiles, setDownloadableFiles] = useState<string[]>([]);

  useEffect(() => {
    // Обновляем список доступных для скачивания файлов при изменении outputFiles
    setDownloadableFiles(task.outputFiles);
  }, [task.outputFiles]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleDownload = async (filename: string) => {
    try {
      const response = await fetch(`${API_URL}/files/${filename}`, {
        headers: {
          'user-id': localStorage.getItem('userId') || '',
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при скачивании файла');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'COMPLETED':
        return 'success.main';
      case 'PROCESSING':
        return 'info.main';
      case 'FAILED':
        return 'error.main';
      default:
        return 'warning.main';
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case 'PENDING':
        return 'Ожидает';
      case 'PROCESSING':
        return 'В обработке';
      case 'COMPLETED':
        return 'Завершено';
      case 'FAILED':
        return 'Ошибка';
      default:
        return task.status;
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {task.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: getStatusColor(), mr: 2 }}
          >
            {getStatusText()}
          </Typography>
          <IconButton
            onClick={() => onDelete(task.id)}
            color="error"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="показать больше"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </Box>

        {task.status === 'PROCESSING' && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={task.progress}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 0.5 }}>
              {task.progress}%
            </Typography>
          </Box>
        )}

        {/* Показываем блок с результатами, если есть хотя бы один файл */}
        {downloadableFiles.length > 0 && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Доступные файлы:
            </Typography>
            <List dense>
              {downloadableFiles.map((filename, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`Файл ${index + 1}`}
                    secondary={filename}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(filename)}
                    >
                      Скачать
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Детали задачи:
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Создано: {new Date(task.createdAt).toLocaleString('ru-RU')}
            </Typography>

            {task.error && (
              <Typography variant="body2" color="error" paragraph>
                Ошибка: {task.error}
              </Typography>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default TaskCard; 
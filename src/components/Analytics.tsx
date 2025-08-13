import React, { useEffect, useState } from 'react';
import { API_URL } from '@/config/api';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Paper,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  processingTasks: number;
  pendingTasks: number;
  tasksByDay: Array<{
    date: string;
    count: number;
  }>;
  completionRate: number;
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const response = await fetch(`${API_URL}/analytics/${user.id}`, {
          headers: {
            'user-id': user.id || '',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Ошибка при получении данных:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(errorData?.error || 'Ошибка при получении данных');
        }

        const analyticsData = await response.json();
        // Сортируем данные по дате по возрастанию
        if (analyticsData.tasksByDay) {
          analyticsData.tasksByDay.sort((a: { date: string }, b: { date: string }) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        }
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Box p={3}>
      <Grid container direction="column" spacing={3} component="div">
        {/* Первый ряд */}
        <Grid item component="div">
          <Grid container spacing={3} component="div">
            {/* Общая статистика */}
            <Grid item xs={12} component="div">
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Общая статистика
                  </Typography>
                  <Grid container spacing={2} component="div">
                    <Grid item xs={6} component="div">
                      <Typography variant="subtitle2" color="textSecondary">
                        Всего задач
                      </Typography>
                      <Typography variant="h4">{data.totalTasks}</Typography>
                    </Grid>
                    <Grid item xs={6} component="div">
                      <Typography variant="subtitle2" color="textSecondary">
                        Процент выполнения
                      </Typography>
                      <Typography variant="h4">
                        {typeof data.completionRate === 'number' ? data.completionRate.toFixed(1) : '0.0'}%
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Статусы задач */}
            <Grid item xs={12} component="div">
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Статусы задач
                  </Typography>
                  <Grid container spacing={2} component="div">
                    <Grid item xs={6} component="div">
                      <Typography variant="subtitle2" color="textSecondary">
                        Выполнено
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {data.completedTasks}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} component="div">
                      <Typography variant="subtitle2" color="textSecondary">
                        В обработке
                      </Typography>
                      <Typography variant="h4" color="info.main">
                        {data.processingTasks}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} component="div">
                      <Typography variant="subtitle2" color="textSecondary">
                        Ожидает
                      </Typography>
                      <Typography variant="h4" color="warning.main">
                        {data.pendingTasks}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} component="div">
                      <Typography variant="subtitle2" color="textSecondary">
                        Ошибки
                      </Typography>
                      <Typography variant="h4" color="error.main">
                        {data.failedTasks}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Второй ряд */}
        <Grid item component="div">
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Задачи по дням
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tasksByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                    formatter={(value) => [`${value} задач`, 'Количество']}
                  />
                  <Bar dataKey="count" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 
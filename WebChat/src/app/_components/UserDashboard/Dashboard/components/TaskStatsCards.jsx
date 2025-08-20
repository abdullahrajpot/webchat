import React from 'react';
import { Grid } from '@mui/material';
import { 
  Assignment, 
  HourglassEmpty, 
  PlayArrow, 
  CheckCircle, 
  Pause,
  Warning 
} from '@mui/icons-material';
import { FeaturedCard1 } from '../components/FeaturedCard1/FeaturedCard1';

const TaskStatsCards = ({ stats = {} }) => {
  const {
    total = 0,
    pending = 0,
    inProgress = 0,
    completed = 0,
    onHold = 0,
    overdue = 0
  } = stats;

  const cardData = [
    {
      id: 'total',
      title: total.toString(),
      subheader: 'Total Tasks',
      icon: <Assignment sx={{ fontSize: 32, color: 'primary.main' }} />,
      bgcolor: ['135deg', '#667eea', '#764ba2']
    },
    {
      id: 'pending',
      title: pending.toString(),
      subheader: 'Pending Tasks',
      icon: <HourglassEmpty sx={{ fontSize: 32, color: 'warning.main' }} />,
      bgcolor: ['135deg', '#f093fb', '#f5576c']
    },
    {
      id: 'inProgress',
      title: inProgress.toString(),
      subheader: 'In Progress',
      icon: <PlayArrow sx={{ fontSize: 32, color: 'info.main' }} />,
      bgcolor: ['135deg', '#4facfe', '#00f2fe']
    },
    {
      id: 'completed',
      title: completed.toString(),
      subheader: 'Completed',
      icon: <CheckCircle sx={{ fontSize: 32, color: 'success.main' }} />,
      bgcolor: ['135deg', '#43e97b', '#38f9d7']
    },
    {
      id: 'onHold',
      title: onHold.toString(),
      subheader: 'On Hold',
      icon: <Pause sx={{ fontSize: 32, color: 'grey.600' }} />,
      bgcolor: ['135deg', '#667eea', '#764ba2']
    },
    {
      id: 'overdue',
      title: overdue.toString(),
      subheader: 'Overdue',
      icon: <Warning sx={{ fontSize: 32, color: 'error.main' }} />,
      bgcolor: ['135deg', '#fa709a', '#fee140']
    }
  ];

  return (
    <Grid container spacing={3}>
      {cardData.map((card) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={card.id}>
          <FeaturedCard1
            icon={card.icon}
            title={card.title}
            subheader={card.subheader}
            bgcolor={card.bgcolor}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default TaskStatsCards;
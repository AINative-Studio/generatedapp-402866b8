import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../components/Dashboard';

// Mock fetch globally
global.fetch = jest.fn();

describe('Dashboard Component', () => {
  const mockTasks = [
    { id: 1, title: 'Task 1', description: 'Description 1', status: 'completed' },
    { id: 2, title: 'Task 2', description: 'Description 2', status: 'pending' }
  ];

  const mockAnalytics = {
    totalTasks: 15,
    completedTasks: 8,
    pendingTasks: 7,
    teamMembers: 5
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard container with correct testid', () => {
    render(<Dashboard />);
    
    const dashboardContainer = screen.getByTestId('dashboard-container');
    expect(dashboardContainer).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [], analytics: {} })
      }), 100))
    );
    
    render(<Dashboard />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('loads and displays tasks and analytics data successfully', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: mockTasks, analytics: mockAnalytics })
      })
    );
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Total Tasks: 15')).toBeInTheDocument();
      expect(screen.getByText('Completed: 8')).toBeInTheDocument();
      expect(screen.getByText('Pending: 7')).toBeInTheDocument();
      expect(screen.getByText('Team Members: 5')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal Server Error' })
      })
    );
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard data/i)).toBeInTheDocument();
    });
  });

  test('handles empty tasks data', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: [], analytics: mockAnalytics })
      })
    );
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No tasks found')).toBeInTheDocument();
      expect(screen.getByText('Total Tasks: 15')).toBeInTheDocument();
    });
  });

  test('has proper accessibility attributes', async () => {
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tasks: mockTasks, analytics: mockAnalytics })
      })
    );
    
    render(<Dashboard />);
    
    const dashboardContainer = screen.getByTestId('dashboard-container');
    expect(dashboardContainer).toHaveAttribute('role', 'main');
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });
});
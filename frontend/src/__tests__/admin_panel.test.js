import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPanel from '../components/AdminPanel';

// Mock fetch globally
global.fetch = jest.fn();

describe('AdminPanel', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders admin panel container with correct test id', () => {
    render(<AdminPanel />);
    
    const container = screen.getByTestId('admin_panel-container');
    expect(container).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    render(<AdminPanel />);
    
    const loadingElement = screen.getByText(/loading/i);
    expect(loadingElement).toBeInTheDocument();
  });

  test('fetches and displays admin data on mount', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });
    
    render(<AdminPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.ainative.studio/api/v1/admin/users',
      expect.any(Object)
    );
  });

  test('handles API error gracefully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });
    
    render(<AdminPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading admin data/i)).toBeInTheDocument();
    });
  });

  test('allows user to toggle user status', async () => {
    const user = userEvent.setup();
    const mockUsers = [{ id: 1, name: 'John Doe', email: 'john@example.com', active: true }];
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/users')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockUsers
        });
      }
      if (url.includes('/users/1/toggle')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ...mockUsers[0], active: false })
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
    
    render(<AdminPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const toggleButton = screen.getByRole('button', { name: /toggle status/i });
    await user.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByText('User status updated')).toBeInTheDocument();
    });
  });

  test('passes accessibility checks', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' }
    ];
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });
    
    const { container } = render(<AdminPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(container).toHaveNoAxeViolations();
  });
});
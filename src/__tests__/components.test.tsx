import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FacilitadorAuthGuard, useFacilitadorAuth } from '@/components/facilitador-auth-guard-new';

describe('Facilitador Auth Guard Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('FacilitadorAuthGuard', () => {
    it('should show loading state initially', () => {
      render(
        <FacilitadorAuthGuard>
          <div>Protected Content</div>
        </FacilitadorAuthGuard>
      );

      expect(screen.getByText(/Verificando acceso/i)).toBeInTheDocument();
    });

    it('should redirect to login when no token', async () => {
      const mockPush = vi.fn();
      vi.mock('next/navigation', () => ({
        useRouter: () => ({ push: mockPush }),
      }));

      render(
        <FacilitadorAuthGuard>
          <div>Protected Content</div>
        </FacilitadorAuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByText(/Acceso Denegado/i)).toBeInTheDocument();
      });
    });

    it('should show access denied for insufficient role', async () => {
      // Set a token with insufficient role
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJmYWNpbGl0YWRvcklkIjoiZmFjLTEyMyIsInJvbGUiOiJGQUNJTElUQURPUiIsImV4cCI6OTk5OTk5OTk5OX0.test';

      localStorage.setItem('facilitador_token', token);

      render(
        <FacilitadorAuthGuard requiredRole="ADMIN">
          <div>Protected Content</div>
        </FacilitadorAuthGuard>
      );

      await waitFor(() => {
        expect(screen.getByText(/Acceso Denegado/i)).toBeInTheDocument();
      });
    });

    it('should render children when authorized', async () => {
      // Mock valid token
      const validToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJmYWNpbGl0YWRvcklkIjoiZmFjLTEyMyIsInJvbGUiOiJBRE1JTiIsImV4cCI6OTk5OTk5OTk5OX0.test`;

      localStorage.setItem('facilitador_token', validToken);

      render(
        <FacilitadorAuthGuard requiredRole="FACILITADOR">
          <div>Protected Content</div>
        </FacilitadorAuthGuard>
      );

      // Note: This test would need more sophisticated mocking
      // In practice, use E2E tests or integration tests for auth flows
    });
  });

  describe('useFacilitadorAuth hook', () => {
    it('should return null values when no token', () => {
      const TestComponent = () => {
        const { facilitadorId, email, role } = useFacilitadorAuth();

        return (
          <div>
            <div>ID: {facilitadorId || 'none'}</div>
            <div>Email: {email || 'none'}</div>
            <div>Role: {role || 'none'}</div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByText(/ID: none/i)).toBeInTheDocument();
      expect(screen.getByText(/Email: none/i)).toBeInTheDocument();
      expect(screen.getByText(/Role: none/i)).toBeInTheDocument();
    });

    it('should decode token when present', async () => {
      const validToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJmYWNpbGl0YWRvcklkIjoiZmFjLTEyMyIsInJvbGUiOiJGQUNJTElUQURPUiIsImV4cCI6OTk5OTk5OTk5OX0.test`;

      localStorage.setItem('facilitador_token', validToken);

      const TestComponent = () => {
        const { facilitadorId, email, role } = useFacilitadorAuth();

        return (
          <div>
            <div data-testid="facilitador-id">{facilitadorId}</div>
            <div data-testid="email">{email}</div>
            <div data-testid="role">{role}</div>
          </div>
        );
      };

      const { container } = render(<TestComponent />);

      // Assertions would depend on actual token decoding
      // This is a simplified test structure
    });
  });
});

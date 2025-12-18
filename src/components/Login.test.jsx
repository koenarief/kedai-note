import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

// 1. Mocking Firebase Hooks dan Auth
jest.mock('react-firebase-hooks/auth');
jest.mock('firebase/auth');
jest.mock('../firebase', () => ({
  auth: {},
  provider: {},
  db: {}
}));

// const mockOnSnapshot = jest.fn();
const mockDeleteDoc = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockDoc = jest.fn();
const mockServerTimestamp = jest.fn();

// Create a mock unsubscribe function
  const mockUnsubscribe = jest.fn();

  // Mock the onSnapshot function to return the mockUnsubscribe function
  const mockOnSnapshot = jest.fn((...args) => {
    // You can add logic here to call the callback immediately for testing
    // For example: args[0](mockSnapshot);
    return mockUnsubscribe; // This is the key part: returning the mock unsub
  });

jest.mock("firebase/firestore", () => {
    return {
        collection: (...args) => mockCollection(...args),
        query: (...args) => mockQuery(...args),
        orderBy: (...args) => mockOrderBy(...args),
        where: (...args) => mockWhere(...args),
        onSnapshot: (...args) => mockOnSnapshot(...args),
        deleteDoc: (...args) => mockDeleteDoc(...args),
        doc: (...args) => mockDoc(...args),
        getDoc: (...args) => mockGetDoc(...args),
        setDoc: (...args) => mockSetDoc(...args),
        serverTimestamp: (...args) => mockServerTimestamp(...args),
    };
});

describe('Login Component', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('menampilkan form login saat user belum terautentikasi', () => {
    // Simulasi user belum login (null)
    useAuthState.mockReturnValue([null]);

    render(<Login />);

    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  test('mengupdate nilai input saat diketik', () => {
    useAuthState.mockReturnValue([null]);
    render(<Login />);

    const emailInput = screen.getByLabelText(/Email address/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('memanggil signInWithEmailAndPassword saat form dikirim', async () => {
    useAuthState.mockReturnValue([null]);
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: '123' } });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@example.com', 'password123');
    });
  });

  test('menampilkan profil dan tombol logout jika user sudah login', () => {
    // Simulasi user sudah login
    const mockUser = {
      displayName: 'Budi Santoso',
      email: 'budi@example.com',
      photoURL: 'https://example.com/photo.jpg'
    };
    useAuthState.mockReturnValue([mockUser]);

    render(<Login />);

    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });

  test('memanggil signInWithPopup saat tombol Google diklik', () => {
    useAuthState.mockReturnValue([null]);
    render(<Login />);

    const googleBtn = screen.getByText(/Daftar\/Login dengan Google/i);
    fireEvent.click(googleBtn);

    expect(signInWithPopup).toHaveBeenCalled();
  });
});

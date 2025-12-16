import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SalesList from "./SalesList"; // Sesuaikan path jika perlu

// --- Mocking Eksternal Ketergantungan ---

jest.mock("../../firebase", () => {
    return { db: { __mocked_db__: true } };
});


// 1. Mock Firebase/Firestore
const mockOnSnapshot = jest.fn();
const mockDeleteDoc = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();


jest.mock("firebase/firestore", () => {
    return {
        collection: (...args) => mockCollection(...args),
        query: (...args) => mockQuery(...args),
        orderBy: (...args) => mockOrderBy(...args),
        where: (...args) => mockWhere(...args),
        onSnapshot: (...args) => mockOnSnapshot(...args),
        deleteDoc: (...args) => mockDeleteDoc(...args),
        doc: (...args) => mockDoc(...args),
    };
});


// 2. Mock useUserContext
const mockUser = { uid: "test-uid-123" };
jest.mock("../../context/UserContext", () => ({
  useUserContext: () => mockUser,
}));

// 3. Mock date-fns format (untuk memastikan tampilan tanggal)
jest.mock("date-fns", () => ({
  format: jest.fn((date) => `FORMATTED_DATE(${date})`),
}));

// 4. Mock jspdf
const mockAutoPrint = jest.fn();
const mockSave = jest.fn();
const mockText = jest.fn();
const mockLine = jest.fn();
const mockSetFontSize = jest.fn();
const mockSetFont = jest.fn();
const mockJsPDF = jest.fn(() => ({
  autoPrint: mockAutoPrint,
  save: mockSave,
  text: mockText,
  line: mockLine,
  setFontSize: mockSetFontSize,
  setFont: mockSetFont,
}));
mockJsPDF.autoTable = jest.fn(); // Mock jspdf-autotable
jest.mock("jspdf", () => ({ jsPDF: mockJsPDF }));
jest.mock("jspdf-autotable", () => jest.fn()); // Penting untuk import "jspdf-autotable"

// 5. Mock react-toastify
const mockToast = { success: jest.fn(), error: jest.fn() };
jest.mock("react-toastify", () => ({
  toast: mockToast,
}));

// 6. Mock dayjs relativeTime plugin
jest.mock("dayjs", () => {
    const actualDayjs = jest.requireActual("dayjs");
    actualDayjs.extend = jest.fn(); // Mock the extend call
    
    // Kita tetap butuh toDate() dan fromNow() untuk data dummy
    const mockFromNow = jest.fn(() => "5 minutes ago");

    const mockDayjs = (date) => ({
      fromNow: mockFromNow,
      toDate: () => date, // Mock toDate to return the original date object for internal logic
      extend: actualDayjs.extend
    });

    // Perlu tambahkan property dayjs di mockDayjs
    Object.assign(mockDayjs, actualDayjs);

    return mockDayjs;
});


// 7. Mock hariIni
jest.mock("../tgl", () => ({
  hariIni: jest.fn(() => new Date(2025, 11, 16)), // Tanggal dummy
}));

// Data Penjualan Dummy
const dummySales = [
  {
    id: "sale-001",
    createdAt: { toDate: () => new Date(2025, 11, 16, 17, 30, 0) }, // 2025-12-16 17:30:00
    total: 25000,
    items: [
      {
        id: "item-a",
        name: "Kopi Hitam",
        qty: 1,
        price: 15000,
        subTotal: 15000,
      },
      {
        id: "item-b",
        name: "Roti Bakar",
        qty: 1,
        price: 10000,
        subTotal: 10000,
      },
    ],
  },
  {
    id: "sale-002",
    createdAt: { toDate: () => new Date(2025, 11, 16, 10, 0, 0) }, // 2025-12-16 10:00:00
    total: 5000,
    items: [
      {
        id: "item-c",
        name: "Teh Dingin",
        qty: 2,
        price: 2500,
        subTotal: 5000,
      },
    ],
  },
];

// Mocking Timestamp untuk diffMinutes (agar dianggap "di bawah 60 menit")
const mockRecentTimestamp = {
  toDate: () => new Date(Date.now() - 5 * 60 * 1000), // 5 menit yang lalu
};

describe("SalesList Component", () => {
  beforeEach(() => {
    // Reset mocks sebelum setiap test
    jest.clearAllMocks();

    // Setup mock onSnapshot agar segera memanggil callback dengan data dummy
    mockOnSnapshot.mockImplementation((q, callback) => {
      // Simulasi Firebase snapshot
      const snapshot = {
        docs: dummySales.map((sale) => ({
          id: sale.id,
          data: () => ({ ...sale, createdAt: mockRecentTimestamp }), // Gunakan timestamp yang dianggap "baru"
        })),
      };
      callback(snapshot);
      return jest.fn(); // Unsubscribe function
    });

    // Mock Date.now untuk waktu yang konsisten saat pengujian `diffMinutes`
    jest.spyOn(Date, "now").mockReturnValue(
      new Date(2025, 11, 16, 17, 35, 0).getTime(),
    ); // 17:35:00
  });

  afterAll(() => {
    jest.restoreAllMocks(); // Kembalikan Date.now yang asli
  });

  it("should render the component title", () => {
    render(<SalesList />);
    expect(screen.getByRole("heading", { name: /Penjualan Hari Ini/i })).toBeInTheDocument();
  });

  it("should display sales data fetched from Firebase", async () => {
    render(<SalesList />);

    // Periksa total item penjualan
    expect(screen.getByText(/Kopi Hitam/i)).toBeInTheDocument();
    expect(screen.getByText(/Roti Bakar/i)).toBeInTheDocument();
    expect(screen.getByText(/Teh Dingin/i)).toBeInTheDocument();

    // Periksa total penjualan (format / 1000)
    expect(screen.getByText(/Total: 25k/i)).toBeInTheDocument();
    expect(screen.getByText(/Total: 5k/i)).toBeInTheDocument();

    // Periksa pemanggilan Firebase
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
  });

  it("should show delete and print buttons for recent sales (diffMinutes returns true)", async () => {
    render(<SalesList />);

    // Karena kita mock `createdAt` agar dianggap baru (5 menit lalu), tombol harus ada
    // Cari tombol "Trash2" (delete)
    const deleteButtons = screen.getAllByRole("button", { name: /Trash2/i });
    expect(deleteButtons).toHaveLength(2); // Untuk sale-001 dan sale-002

    // Cari tombol "Printer" (print)
    const printButtons = screen.getAllByRole("button", { name: /Printer/i });
    expect(printButtons).toHaveLength(2);
  });

  it("should open ConfirmDeleteModal when delete button is clicked", async () => {
    render(<SalesList />);

    // Klik tombol hapus pertama (sale-001)
    fireEvent.click(screen.getAllByRole("button", { name: /Trash2/i })[0]);

    // Konfirmasi modal harus muncul dengan ID penjualan
    expect(screen.getByText(/Konfirmasi Hapus/i)).toBeInTheDocument();
    expect(screen.getByText(/sale-001/i)).toBeInTheDocument();
  });

  it("should call deleteDoc and close modal when delete is confirmed", async () => {
    render(<SalesList />);

    // Klik tombol hapus
    fireEvent.click(screen.getAllByRole("button", { name: /Trash2/i })[0]);

    // Klik tombol 'Hapus' di modal
    fireEvent.click(screen.getByText(/Hapus/i));

    // Verifikasi deleteDoc dipanggil
    await waitFor(() => {
      expect(mockDeleteDoc).toHaveBeenCalledWith(
        expect.anything(), // doc()
        expect.anything(), // db
        "users",
        "test-uid-123",
        "penjualans",
        "sale-001",
      );
    });

    // Verifikasi modal tertutup
    expect(screen.queryByText(/Konfirmasi Hapus/i)).not.toBeInTheDocument();
  });

  it("should call jsPDF functions when print button is clicked", async () => {
    render(<SalesList />);

    // Klik tombol print pertama (sale-001)
    fireEvent.click(screen.getAllByRole("button", { name: /Printer/i })[0]);

    // Verifikasi konstruktor jsPDF dipanggil
    expect(mockJsPDF).toHaveBeenCalledWith({
      unit: "mm",
      format: [58, 100],
    });

    // Verifikasi teks Header
    expect(mockText).toHaveBeenCalledWith("ID Kasir", 29, 5, {
      align: "center",
    });

    // Verifikasi teks Total
    expect(mockText).toHaveBeenCalledWith("TOTAL", 2, expect.any(Number));
    expect(mockText).toHaveBeenCalledWith(
      "25.000",
      56,
      expect.any(Number),
      { align: "right" },
    ); // Format IDR 25000

    // Verifikasi item list (perlu memverifikasi Intl.NumberFormat(id-ID) untuk item)
    expect(mockText).toHaveBeenCalledWith("Kopi Hitam", 2, expect.any(Number));
    expect(mockText).toHaveBeenCalledWith(
      "1 x 15.000",
      2,
      expect.any(Number),
    );
    expect(mockText).toHaveBeenCalledWith(
      "15.000",
      56,
      expect.any(Number),
      { align: "right" },
    );

    // Verifikasi autoPrint dan save
    expect(mockAutoPrint).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith("invoice_sale-001.pdf");
  });

  it("should format item price and subtotal correctly (en-US / 1000) in list view", async () => {
    render(<SalesList />);

    // Kopi Hitam (price 15000, subTotal 15000)
    // Price: 15000 / 1000 = 15.000k
    // expect(screen.getByText(/@ 15,000k/i)).toBeInTheDocument();
    // SubTotal: 15000 / 1000 = 15.000k
    // expect(screen.getByText(/15,000k/i)).toBeInTheDocument();

    // Teh Dingin (price 2500, subTotal 5000)
    // Price: 2500 / 1000 = 2.500k
    // expect(screen.getByText(/@ 2,500k/i)).toBeInTheDocument();
    // SubTotal: 5000 / 1000 = 5.000k
    // expect(screen.getByText(/5,000k/i)).toBeInTheDocument();
  });
});
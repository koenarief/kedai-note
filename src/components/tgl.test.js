import { jest } from "@jest/globals";

import {
  bulanSebelumnya,
  bulanIni,
  hariIni,
  kemarin,
} from "./tgl";

describe("tgl utilities", () => {
  // Tetapkan waktu sistem agar test deterministik
  const fixedNow = new Date("2025-12-12T10:00:00.000Z"); // 12 Des 2025
  beforeAll(() => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(fixedNow);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("hariIni returns start of today (00:00:00.000)", () => {
    const start = hariIni();
    expect(start.getFullYear()).toBe(2025);
    expect(start.getMonth()).toBe(11); // Desember => month index 11
    expect(start.getDate()).toBe(12);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
  });

  test("kemarin(1) returns start and end for yesterday", () => {
    const [start, akhir] = kemarin(1);
    // yesterday = 11 Dec 2025
    expect(start.getFullYear()).toBe(2025);
    expect(start.getMonth()).toBe(11);
    expect(start.getDate()).toBe(11);
    expect(start.getHours()).toBe(0);
    expect(akhir.getFullYear()).toBe(2025);
    expect(akhir.getMonth()).toBe(11);
    expect(akhir.getDate()).toBe(11);
    // akhir should be 23:59:59.999
    expect(akhir.getHours()).toBe(23);
    expect(akhir.getMinutes()).toBe(59);
    expect(akhir.getSeconds()).toBe(59);
    expect(akhir.getMilliseconds()).toBe(999);
    // range sanity: akhir is next day start - 1ms
    const nextDayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1, 0, 0, 0, 0);
    expect(akhir.getTime()).toBe(nextDayStart.getTime() - 1);
  });

  test("kemarin(0) returns today's full range", () => {
    const [start, akhir] = kemarin(0);
    // today = 12 Dec 2025
    expect(start.getDate()).toBe(12);
    expect(akhir.getDate()).toBe(12);
    const nextDayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1, 0, 0, 0, 0);
    expect(akhir.getTime()).toBe(nextDayStart.getTime() - 1);
  });

  test("bulanIni returns first day start and last day end of current month", () => {
    const [start, akhir] = bulanIni();
    // December 2025
    expect(start.getFullYear()).toBe(2025);
    expect(start.getMonth()).toBe(11);
    expect(start.getDate()).toBe(1);
    expect(start.getHours()).toBe(0);
    // akhir should be last millisecond of December: check via next month start -1
    const nextMonthStart = new Date(2026, 0, 1, 0, 0, 0, 0); // Jan 1 2026
    expect(akhir.getTime()).toBe(nextMonthStart.getTime() - 1);
  });

  test("bulanSebelumnya(1) returns previous month start and end", () => {
    const [start, akhir] = bulanSebelumnya(1);
    // previous month = November 2025
    expect(start.getFullYear()).toBe(2025);
    expect(start.getMonth()).toBe(10); // November => 10
    expect(start.getDate()).toBe(1);
    const nextMonthStart = new Date(start.getFullYear(), start.getMonth() + 1, 1, 0, 0, 0, 0);
    expect(akhir.getTime()).toBe(nextMonthStart.getTime() - 1);
  });

  test("bulanSebelumnya(0) equals bulanIni()", () => {
    const b0 = bulanSebelumnya(0);
    const bi = bulanIni();
    expect(b0[0].getTime()).toBe(bi[0].getTime());
    expect(b0[1].getTime()).toBe(bi[1].getTime());
  });
});
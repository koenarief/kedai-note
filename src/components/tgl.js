export const bulanSebelumnya = (n = 1) => {
  const months = Math.max(0, Math.floor(Number(n) || 0));
  if (months === 0) return bulanIni();

  const today = new Date();

  // Awal bulan target pada pukul 00:00:00.000
  const start = new Date(
    today.getFullYear(),
    today.getMonth() - months,
    1,
    0,
    0,
    0,
    0,
  );

  // Awal bulan berikutnya, lalu kurangi 1 ms untuk mendapatkan akhir bulan target
  const nextMonthStart = new Date(start.getFullYear(), start.getMonth() + 1, 1, 0, 0, 0, 0);
  const end = new Date(nextMonthStart.getTime() - 1);

  return [start, end];
};

export const bulanIni = () => {
  const today = new Date();
  // Awal bulan pada pukul 00:00:00.000
  const start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
  // Awal bulan berikutnya pada pukul 00:00:00.000 -> dikurangi 1 ms untuk akhir bulan ini
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1, 0, 0, 0, 0);
  const akhir = new Date(nextMonthStart.getTime() - 1);
  return [start, akhir];
};

export const hariIni = () => {
  const now = new Date();
  // Pastikan waktu di-reset ke awal hari (00:00:00.000)
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  return start;
};


export const kemarin = (n = 1) => {
  const days = Math.max(0, Math.floor(Number(n) || 0));
  const today = new Date();

  // Mulai hari yang diminta pada pukul 00:00:00.000
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - days,
    0,
    0,
    0,
    0,
  );

  // Hari berikutnya pukul 00:00:00.000, lalu kurangi 1 ms untuk dapat 23:59:59.999
  const nextDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  const akhir = new Date(nextDay.getTime() - 1);

  return [start, akhir];
};

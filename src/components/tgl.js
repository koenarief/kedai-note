export const bulanSebelumnya = (n) => {
  if (n == 0) return bulanIni();

  const today = new Date();

  // 1. **Awal Bulan Sebelumnya**
  // Ambil tahun dan bulan saat ini
  const previousMonthStart = new Date(
    today.getFullYear(),
    today.getMonth() - n, // Kurangi 1 dari bulan saat ini
    1, // Selalu set hari ke 1
  );

  // 2. **Akhir Bulan Sebelumnya**
  // Mulai dari awal bulan saat ini (hari ke-1 bulan ini)
  const currentMonthStart = new Date(
    previousMonthStart.getFullYear(),
    previousMonthStart.getMonth() + 1,
    1,
  );

  // Kurangi 1 milidetik dari awal bulan ini
  // Ini akan membawa kita ke hari terakhir bulan sebelumnya
  const previousMonthEnd = new Date(currentMonthStart.getTime() - 1);

  return [previousMonthStart, previousMonthEnd];
};

export const bulanIni = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const akhir = new Date(endMonth.getTime() - 1);
  return [start, akhir];
};

export const hariIni = () => {
  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return start;
};


export const kemarin = (n) => {
  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - n,
  );
  const nextDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + 1,
  );
  const akhir = new Date(nextDay.getTime() - 1);
  return [start, akhir];
};

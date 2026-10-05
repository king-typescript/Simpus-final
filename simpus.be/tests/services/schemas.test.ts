import { describe, expect, it } from "vitest";
import { z } from "zod";

// Test Student schema validation rules (FR-01)
const PASSWORD_MIN_LENGTH = 12;
const createStudentSchema = z.object({
  username: z.string().trim().min(1, "Username wajib diisi").max(100, "Username terlalu panjang"),
  password: z.string().min(PASSWORD_MIN_LENGTH, `Password minimal ${PASSWORD_MIN_LENGTH} karakter`).max(256),
  nis: z.string().trim().min(1, "NIS wajib diisi").max(50, "NIS terlalu panjang"),
  name: z.string().trim().min(1, "Nama wajib diisi").max(150, "Nama terlalu panjang"),
  className: z.string().trim().min(1, "Kelas wajib diisi").max(100, "Kelas terlalu panjang"),
  libraryCardNumber: z.string().trim().min(1, "Nomor kartu wajib diisi").max(100),
  phone: z.string().trim().max(30).nullable().optional(),
});

// Test Book schema validation rules (FR-02)
const createBookSchema = z.object({
  title: z.string().trim().min(1, "Judul buku wajib diisi").max(300, "Judul terlalu panjang"),
  isbn: z.string().trim().max(20).nullable().optional(),
  publisher: z.string().trim().max(200).nullable().optional(),
  edition: z.string().trim().max(100).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  coverUrl: z.string().url("URL cover harus valid").max(2048).nullable().optional(),
  categoryId: z.string().uuid("ID kategori tidak valid").optional(),
  categoryName: z.string().trim().min(1).optional(),
  publicationYear: z.number().int().min(1000).max(new Date().getFullYear() + 1).nullable().optional(),
  stock: z.coerce.number().int().min(0).max(100).optional(),
});

// Test Loan schema validation rules (FR-03)
const createLoanSchema = z.object({
  studentId: z.string().uuid("ID siswa tidak valid"),
  copyIds: z.array(z.string().uuid("ID eksemplar tidak valid")).optional(),
  bookId: z.string().uuid("ID buku tidak valid").optional(),
  dueDate: z.string().optional(),
  notes: z.string().trim().max(1000, "Catatan maksimal 1000 karakter").nullable().optional(),
});

describe("Student Validation Schema", () => {
  const validStudent = {
    username: "siswa_01",
    password: "PasswordAman123!",
    nis: "12345678",
    name: "Ahmad Siswa",
    className: "XII-RPL-1",
    libraryCardNumber: "CARD-12345678",
    phone: "081234567890",
  };

  it("validates correct student data", () => {
    const result = createStudentSchema.safeParse(validStudent);
    expect(result.success).toBe(true);
  });

  it("rejects password shorter than 12 characters", () => {
    const result = createStudentSchema.safeParse({
      ...validStudent,
      password: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Password minimal 12 karakter");
    }
  });

  it("rejects empty student name or empty NIS", () => {
    const result = createStudentSchema.safeParse({
      ...validStudent,
      name: "   ",
      nis: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("Book Validation Schema", () => {
  const validBook = {
    title: "Algoritma dan Struktur Data",
    isbn: "978-602-000-000-0",
    publisher: "Informatika",
    publicationYear: 2024,
    stock: 5,
    coverUrl: "https://example.com/cover.jpg",
  };

  it("validates correct book data", () => {
    const result = createBookSchema.safeParse(validBook);
    expect(result.success).toBe(true);
  });

  it("rejects invalid cover URL", () => {
    const result = createBookSchema.safeParse({
      ...validBook,
      coverUrl: "not-a-valid-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative stock", () => {
    const result = createBookSchema.safeParse({
      ...validBook,
      stock: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = createBookSchema.safeParse({
      ...validBook,
      title: "   ",
    });
    expect(result.success).toBe(false);
  });
});

describe("Loan Validation Schema", () => {
  it("validates correct loan request with UUIDs", () => {
    const validLoan = {
      studentId: "123e4567-e89b-12d3-a456-426614174000",
      copyIds: ["123e4567-e89b-12d3-a456-426614174001"],
      notes: "Peminjaman tugas sekolah",
    };
    const result = createLoanSchema.safeParse(validLoan);
    expect(result.success).toBe(true);
  });

  it("rejects invalid non-UUID studentId", () => {
    const result = createLoanSchema.safeParse({
      studentId: "invalid-student-id",
    });
    expect(result.success).toBe(false);
  });
});

// Utilities for handling E-Book data & Online E-Book Loans on the Frontend (Local Storage backed)

const EBOOK_STORAGE_KEY = 'simpus_ebook_collection'
const LOAN_STORAGE_KEY = 'simpus_ebook_loans'

// Default sample e-books (kosongkan untuk mengandalkan database riil)
const DEFAULT_EBOOKS = []

// Initialize LocalStorage with default e-books if empty
export function getStoredEbooks() {
  try {
    const data = localStorage.getItem(EBOOK_STORAGE_KEY)
    if (!data) return []
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveStoredEbook(ebook) {
  try {
    const list = getStoredEbooks()
    const updated = [ebook, ...list.filter(b => b.id !== ebook.id)]
    localStorage.setItem(EBOOK_STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch (err) {
    console.error('Error saving ebook:', err)
    return []
  }
}

export function deleteStoredEbook(id) {
  try {
    const list = getStoredEbooks()
    const updated = list.filter(b => b.id !== id)
    localStorage.setItem(EBOOK_STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch (err) {
    console.error('Error deleting ebook:', err)
    return []
  }
}

// Manage E-Book Loans
export function getActiveEbookLoans(studentId) {
  try {
    const data = localStorage.getItem(LOAN_STORAGE_KEY)
    if (!data) return []
    const allLoans = JSON.parse(data)
    const now = new Date().getTime()

    // Filter by studentId and remove expired (more than 7 days)
    const validLoans = allLoans.filter((loan) => {
      const isUserMatch = !studentId || loan.studentId === studentId
      const isNotExpired = new Date(loan.dueDate).getTime() > now && loan.status !== 'SELESAI'
      return isUserMatch && isNotExpired
    })

    return validLoans
  } catch {
    return []
  }
}

export function getAllEbookLoans(studentId) {
  try {
    const data = localStorage.getItem(LOAN_STORAGE_KEY)
    if (!data) return []
    const allLoans = JSON.parse(data)
    return allLoans.filter((loan) => !studentId || loan.studentId === studentId)
  } catch {
    return []
  }
}

export function returnEbookEarly(loanId) {
  try {
    const data = localStorage.getItem(LOAN_STORAGE_KEY)
    if (!data) return false
    const allLoans = JSON.parse(data)
    const updated = allLoans.map(loan => {
      if (loan.id === loanId) {
        return { ...loan, status: 'SELESAI', returnedAt: new Date().toISOString() }
      }
      return loan
    })
    localStorage.setItem(LOAN_STORAGE_KEY, JSON.stringify(updated))
    return true
  } catch {
    return false
  }
}

export function borrowEbookOnline(studentId, book, durationDays = 7) {
  try {
    const currentLoans = getActiveEbookLoans(studentId)
    
    // Check if already borrowed
    const existing = currentLoans.find(l => l.bookId === book.id)
    if (existing) {
      return { success: true, loan: existing, message: 'E-Book sudah ada dalam pinjaman aktif Anda.' }
    }

    const borrowedAt = new Date()
    const dueDate = new Date(borrowedAt.getTime() + durationDays * 24 * 60 * 60 * 1000)

    const newLoan = {
      id: `ebk-loan-${Date.now()}`,
      studentId: studentId || 'siswa-demo',
      bookId: book.id,
      title: book.title,
      author: book.author || 'Penulis',
      coverUrl: book.coverUrl,
      fileUrl: book.fileUrl || 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
      borrowedAt: borrowedAt.toISOString(),
      dueDate: dueDate.toISOString(),
      durationDays,
      status: 'AKTIF'
    }

    const updatedLoans = [newLoan, ...currentLoans]
    localStorage.setItem(LOAN_STORAGE_KEY, JSON.stringify(updatedLoans))

    return {
      success: true,
      loan: newLoan,
      message: `Berhasil meminjam E-Book "${book.title}" secara online selama ${durationDays} hari.`
    }
  } catch (err) {
    return { success: false, error: err.message || 'Gagal meminjam E-Book' }
  }
}

export function formatTimeRemaining(dueDateString) {
  const diff = new Date(dueDateString).getTime() - new Date().getTime()
  if (diff <= 0) return 'Kadaluarsa'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days} Hari ${hours} Jam lagi`
  if (hours > 0) return `${hours} Jam ${minutes} Mnt lagi`
  return `${minutes} Menit lagi`
}

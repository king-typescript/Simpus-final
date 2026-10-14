BEGIN;

-- 0. Ensure unique constraint (id, schoolId) exists on authors and books
ALTER TABLE public.authors DROP CONSTRAINT IF EXISTS authors_id_schoolId_key;
ALTER TABLE public.authors ADD CONSTRAINT authors_id_schoolId_key UNIQUE (id, "schoolId");

ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_id_schoolId_key;
ALTER TABLE public.books ADD CONSTRAINT books_id_schoolId_key UNIQUE (id, "schoolId");

-- 1. Create table book_authors
CREATE TABLE IF NOT EXISTS public.book_authors (
    "bookId" text NOT NULL,
    "authorId" text NOT NULL,
    "schoolId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT book_authors_pkey PRIMARY KEY ("bookId", "authorId")
);

CREATE UNIQUE INDEX IF NOT EXISTS book_authors_authorId_bookId_schoolId_key ON public.book_authors ("authorId", "bookId", "schoolId");
CREATE INDEX IF NOT EXISTS book_authors_schoolId_idx ON public.book_authors ("schoolId");
CREATE INDEX IF NOT EXISTS book_authors_bookId_idx ON public.book_authors ("bookId");
CREATE INDEX IF NOT EXISTS book_authors_authorId_idx ON public.book_authors ("authorId");

-- Backfill from implicit _AuthorToBook if exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_AuthorToBook') THEN
        INSERT INTO public.book_authors ("bookId", "authorId", "schoolId", "createdAt")
        SELECT ab."B", ab."A", b."schoolId", CURRENT_TIMESTAMP
        FROM public."_AuthorToBook" ab
        JOIN public.books b ON b.id = ab."B"
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Foreign keys
ALTER TABLE public.book_authors DROP CONSTRAINT IF EXISTS book_authors_schoolId_fkey;
ALTER TABLE public.book_authors ADD CONSTRAINT book_authors_schoolId_fkey FOREIGN KEY ("schoolId") REFERENCES public.schools(id) ON DELETE CASCADE;

ALTER TABLE public.book_authors DROP CONSTRAINT IF EXISTS book_authors_bookId_schoolId_fkey;
ALTER TABLE public.book_authors ADD CONSTRAINT book_authors_bookId_schoolId_fkey FOREIGN KEY ("bookId", "schoolId") REFERENCES public.books(id, "schoolId") ON DELETE CASCADE;

ALTER TABLE public.book_authors DROP CONSTRAINT IF EXISTS book_authors_authorId_schoolId_fkey;
ALTER TABLE public.book_authors ADD CONSTRAINT book_authors_authorId_schoolId_fkey FOREIGN KEY ("authorId", "schoolId") REFERENCES public.authors(id, "schoolId") ON DELETE CASCADE;

-- 2. Student table updates: add classId, make className nullable
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS "classId" text;
ALTER TABLE public.students ALTER COLUMN "className" DROP NOT NULL;
CREATE INDEX IF NOT EXISTS students_classId_idx ON public.students ("classId");

ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_classId_fkey;
ALTER TABLE public.students ADD CONSTRAINT students_classId_fkey FOREIGN KEY ("classId") REFERENCES public.school_classes(id) ON DELETE SET NULL;

-- 3. AuditLog index
CREATE INDEX IF NOT EXISTS audit_logs_schoolId_createdAt_idx ON public.audit_logs ("schoolId", "createdAt");

COMMIT;

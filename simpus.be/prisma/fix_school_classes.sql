BEGIN;

-- 1. Tambah schoolId ke school_classes jika belum ada
ALTER TABLE public.school_classes ADD COLUMN IF NOT EXISTS "schoolId" text;

-- Isi default schoolId jika masih null
UPDATE public.school_classes sc
SET "schoolId" = (SELECT id FROM public.schools WHERE code = 'DEFAULT' LIMIT 1)
WHERE sc."schoolId" IS NULL;

-- Make schoolId NOT NULL
ALTER TABLE public.school_classes ALTER COLUMN "schoolId" SET NOT NULL;

-- Relasi FK ke schools
ALTER TABLE public.school_classes DROP CONSTRAINT IF EXISTS school_classes_schoolId_fkey;
ALTER TABLE public.school_classes ADD CONSTRAINT school_classes_schoolId_fkey 
FOREIGN KEY ("schoolId") REFERENCES public.schools(id) ON DELETE CASCADE;

-- Update unique constraints: dari (name) menjadi (schoolId, name)
DROP INDEX IF EXISTS public.school_classes_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS school_classes_schoolId_name_key ON public.school_classes ("schoolId", "name");
CREATE INDEX IF NOT EXISTS school_classes_schoolId_idx ON public.school_classes ("schoolId");

-- 2. Backfill classes dari students
INSERT INTO public.school_classes (id, "schoolId", name, "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    s."schoolId",
    TRIM(s."className"),
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM public.students s
WHERE s."className" IS NOT NULL 
  AND TRIM(s."className") <> ''
  AND NOT EXISTS (
      SELECT 1 FROM public.school_classes sc 
      WHERE sc."schoolId" = s."schoolId" AND LOWER(sc.name) = LOWER(TRIM(s."className"))
  )
GROUP BY s."schoolId", TRIM(s."className");

-- 3. Update students.classId
UPDATE public.students s
SET "classId" = sc.id
FROM public.school_classes sc
WHERE sc."schoolId" = s."schoolId" 
  AND LOWER(sc.name) = LOWER(TRIM(s."className"))
  AND s."classId" IS NULL;

COMMIT;

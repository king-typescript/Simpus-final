BEGIN;

-- Insert missing classes into school_classes from students.className
INSERT INTO public.school_classes (id, "schoolId", name, "isActive", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    s."schoolId",
    s."className",
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
GROUP BY s."schoolId", s."className";

-- Update students.classId
UPDATE public.students s
SET "classId" = sc.id
FROM public.school_classes sc
WHERE sc."schoolId" = s."schoolId" 
  AND LOWER(sc.name) = LOWER(TRIM(s."className"))
  AND s."classId" IS NULL;

COMMIT;

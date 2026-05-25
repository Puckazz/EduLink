UPDATE `AcademicTerm` t
JOIN `AcademicYear` y ON y.`academic_year_id` = t.`academic_year_id`
SET t.`name` = CONCAT(
  CASE
    WHEN t.`code` = 'HK1' THEN 'Học kỳ I'
    WHEN t.`code` = 'HK2' THEN 'Học kỳ II'
    ELSE 'Học kỳ hè'
  END,
  ' - ',
  y.`name`
);

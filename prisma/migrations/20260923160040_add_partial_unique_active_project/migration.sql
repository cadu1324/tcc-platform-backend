CREATE UNIQUE INDEX "uq_projects_student_active" ON "projects" ("student_id") WHERE ("status" = 'in_progress');

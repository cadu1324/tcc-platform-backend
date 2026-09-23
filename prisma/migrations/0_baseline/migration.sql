-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "delivery_status_enum" AS ENUM ('pending', 'submitted', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "milestone_status_enum" AS ENUM ('pending', 'completed');

-- CreateEnum
CREATE TYPE "notification_type_enum" AS ENUM ('delivery_created', 'feedback_registered', 'milestone_created', 'milestone_updated', 'message_received', 'milestone_due_soon', 'milestone_overdue');

-- CreateEnum
CREATE TYPE "project_status_enum" AS ENUM ('in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "user_type_enum" AS ENUM ('student', 'advisor', 'admin');

-- CreateTable
CREATE TABLE "deliveries" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "deadline" TIMESTAMPTZ(6),
    "status" "delivery_status_enum" NOT NULL DEFAULT 'pending',
    "file_url" VARCHAR(1000),
    "submitted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_name" VARCHAR(255),
    "milestone_id" INTEGER,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_files" (
    "id" SERIAL NOT NULL,
    "delivery_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "content" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "delivery_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" SERIAL NOT NULL,
    "delivery_id" INTEGER NOT NULL,
    "advisor_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "grade" DECIMAL(4,2),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMPTZ(6),
    "status" "milestone_status_enum" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" SMALLINT NOT NULL DEFAULT 1,
    "notify_student_on_feedback" BOOLEAN NOT NULL DEFAULT true,
    "notify_advisor_on_delivery_submitted" BOOLEAN NOT NULL DEFAULT true,
    "notify_admin_on_milestone_overdue" BOOLEAN NOT NULL DEFAULT true,
    "email_copy_enabled" BOOLEAN NOT NULL DEFAULT false,
    "email_digest_frequency" VARCHAR(10) NOT NULL DEFAULT 'daily',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "notification_type_enum" NOT NULL,
    "message" TEXT NOT NULL,
    "project_id" INTEGER,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "status" "project_status_enum" NOT NULL DEFAULT 'in_progress',
    "start_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "expected_delivery_date" DATE,
    "student_id" INTEGER NOT NULL,
    "advisor_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "knowledge_area" VARCHAR(150),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "user_type" "user_type_enum" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_deliveries_deadline" ON "deliveries"("deadline");

-- CreateIndex
CREATE INDEX "idx_deliveries_milestone_id" ON "deliveries"("milestone_id");

-- CreateIndex
CREATE INDEX "idx_deliveries_project_id" ON "deliveries"("project_id");

-- CreateIndex
CREATE INDEX "idx_deliveries_project_status" ON "deliveries"("project_id", "status");

-- CreateIndex
CREATE INDEX "idx_deliveries_status" ON "deliveries"("status");

-- CreateIndex
CREATE INDEX "idx_delivery_files_delivery_id" ON "delivery_files"("delivery_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_delivery_files_delivery_version" ON "delivery_files"("delivery_id", "version");

-- CreateIndex
CREATE INDEX "idx_feedbacks_advisor_id" ON "feedbacks"("advisor_id");

-- CreateIndex
CREATE INDEX "idx_feedbacks_created_at" ON "feedbacks"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_feedbacks_delivery_id" ON "feedbacks"("delivery_id");

-- CreateIndex
CREATE INDEX "idx_messages_conversation" ON "messages"("sender_id", "recipient_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_messages_recipient_unread" ON "messages"("recipient_id", "is_read");

-- CreateIndex
CREATE INDEX "idx_milestones_due_date" ON "milestones"("due_date");

-- CreateIndex
CREATE INDEX "idx_milestones_project_id" ON "milestones"("project_id");

-- CreateIndex
CREATE INDEX "idx_milestones_status" ON "milestones"("status");

-- CreateIndex
CREATE INDEX "idx_notifications_created_at" ON "notifications"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notifications_is_read" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "idx_notifications_project_id" ON "notifications"("project_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user_id" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user_unread" ON "notifications"("user_id", "is_read") WHERE (is_read = false);

-- CreateIndex
CREATE UNIQUE INDEX "uq_password_reset_tokens_token_hash" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "idx_password_reset_tokens_expires_at" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "idx_password_reset_tokens_user_id" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "idx_projects_advisor_id" ON "projects"("advisor_id");

-- CreateIndex
CREATE INDEX "idx_projects_status" ON "projects"("status");

-- CreateIndex
CREATE INDEX "idx_projects_student_id" ON "projects"("student_id");

-- CreateIndex
CREATE INDEX "idx_projects_student_status" ON "projects"("student_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_refresh_tokens_token_hash" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_expires_at" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_is_active" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "idx_users_user_type" ON "users"("user_type");

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "fk_deliveries_milestone" FOREIGN KEY ("milestone_id") REFERENCES "milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "fk_deliveries_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_files" ADD CONSTRAINT "fk_delivery_files_delivery" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "fk_feedbacks_advisor" FOREIGN KEY ("advisor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "fk_feedbacks_delivery" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "fk_milestones_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "fk_notifications_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "fk_notifications_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "fk_password_reset_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "fk_projects_advisor" FOREIGN KEY ("advisor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "fk_projects_student" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "fk_refresh_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CheckConstraints
-- Prisma nao modela CHECK constraints (aviso do "prisma db pull"); adicionadas
-- a mao para o baseline conseguir recriar o schema completo se replayado.
ALTER TABLE "feedbacks" ADD CONSTRAINT "chk_feedbacks_grade_range" CHECK (grade IS NULL OR (grade >= 0 AND grade <= 10));
ALTER TABLE "delivery_files" ADD CONSTRAINT "chk_delivery_files_size_positive" CHECK (size_bytes > 0);
ALTER TABLE "notification_settings" ADD CONSTRAINT "chk_notification_settings_singleton" CHECK (id = 1);
ALTER TABLE "notification_settings" ADD CONSTRAINT "chk_notification_settings_digest_frequency" CHECK (email_digest_frequency IN ('daily', 'weekly'));

-- UpdatedAtTrigger
-- Prisma tambem nao modela funcoes/triggers; sem isso, um replay deste
-- baseline (ex.: prisma migrate reset num banco novo) deixaria updated_at
-- parado no valor de created_at para sempre.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_projects_updated_at BEFORE UPDATE ON "projects" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_deliveries_updated_at BEFORE UPDATE ON "deliveries" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_notifications_updated_at BEFORE UPDATE ON "notifications" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_milestones_updated_at BEFORE UPDATE ON "milestones" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_delivery_files_updated_at BEFORE UPDATE ON "delivery_files" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_notification_settings_updated_at BEFORE UPDATE ON "notification_settings" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


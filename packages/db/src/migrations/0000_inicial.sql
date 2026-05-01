CREATE TYPE "public"."account_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."availability_status" AS ENUM('available', 'busy', 'blocked', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."blood_type" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');--> statement-breakpoint
CREATE TYPE "public"."coverage_type" AS ENUM('basic', 'complete', 'dental', 'vision', 'comprehensive');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('sent', 'delivered', 'read', 'failed');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('appointment', 'block', 'vacation', 'meeting');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('confirmation', 'reminder', 'cancellation', 'rescheduling');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('pending', 'synced', 'error');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('doctor', 'patient', 'receptionist');--> statement-breakpoint
CREATE TABLE "Accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" uuid NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" uuid NOT NULL,
	CONSTRAINT "Sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "Users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) DEFAULT '' NOT NULL,
	"email" varchar(255) NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'patient' NOT NULL,
	"accountStatus" "account_status" DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "MedicalInsurances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"insurerName" varchar(255) NOT NULL,
	"coverageType" "coverage_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Patients" (
	"dui" varchar(10) PRIMARY KEY NOT NULL,
	"userId" uuid,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"whatsappPhone" varchar(20) NOT NULL,
	"birthDate" date NOT NULL,
	"insuranceId" uuid
);
--> statement-breakpoint
CREATE TABLE "MedicalRecords" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patientDui" varchar(10) NOT NULL,
	"bloodType" "blood_type",
	"knownAllergies" text,
	"familyHistory" text,
	"chronicConditions" text,
	"openedAt" date DEFAULT CURRENT_DATE NOT NULL,
	CONSTRAINT "MedicalRecords_patientDui_unique" UNIQUE("patientDui")
);
--> statement-breakpoint
CREATE TABLE "ScheduleEvents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doctorId" uuid NOT NULL,
	"eventDate" date NOT NULL,
	"startTime" time NOT NULL,
	"endTime" time NOT NULL,
	"eventType" "event_type" NOT NULL,
	"availabilityStatus" "availability_status" DEFAULT 'available' NOT NULL,
	"googleEventId" varchar(255),
	"googleHtmlLink" varchar(500),
	"syncStatus" "sync_status" DEFAULT 'pending' NOT NULL,
	"auditUserId" uuid
);
--> statement-breakpoint
CREATE TABLE "MedicalAppointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eventId" uuid NOT NULL,
	"patientDui" varchar(10) NOT NULL,
	"bookingReason" varchar(500) NOT NULL,
	"bookedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "MedicalAppointments_eventId_unique" UNIQUE("eventId")
);
--> statement-breakpoint
CREATE TABLE "ClinicalConsultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recordId" uuid NOT NULL,
	"appointmentId" uuid NOT NULL,
	"presentedSymptoms" text NOT NULL,
	"bloodPressure" varchar(20),
	"weightKg" numeric(5, 2),
	"mainDiagnosis" text NOT NULL,
	"prescribedTreatment" text NOT NULL,
	"doctorPrivateNotes" text,
	CONSTRAINT "ClinicalConsultations_appointmentId_unique" UNIQUE("appointmentId")
);
--> statement-breakpoint
CREATE TABLE "WhatsAppMessages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointmentId" uuid NOT NULL,
	"destinationPhone" varchar(20) NOT NULL,
	"messageType" "message_type" NOT NULL,
	"messageBody" varchar(1000) NOT NULL,
	"sentAt" timestamp DEFAULT now() NOT NULL,
	"deliveryStatus" "delivery_status" DEFAULT 'sent' NOT NULL,
	"whatsappMessageId" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "Accounts" ADD CONSTRAINT "Accounts_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Patients" ADD CONSTRAINT "Patients_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Patients" ADD CONSTRAINT "Patients_insuranceId_MedicalInsurances_id_fk" FOREIGN KEY ("insuranceId") REFERENCES "public"."MedicalInsurances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "MedicalRecords" ADD CONSTRAINT "MedicalRecords_patientDui_Patients_dui_fk" FOREIGN KEY ("patientDui") REFERENCES "public"."Patients"("dui") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ScheduleEvents" ADD CONSTRAINT "ScheduleEvents_doctorId_Users_id_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ScheduleEvents" ADD CONSTRAINT "ScheduleEvents_auditUserId_Users_id_fk" FOREIGN KEY ("auditUserId") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "MedicalAppointments" ADD CONSTRAINT "MedicalAppointments_eventId_ScheduleEvents_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."ScheduleEvents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "MedicalAppointments" ADD CONSTRAINT "MedicalAppointments_patientDui_Patients_dui_fk" FOREIGN KEY ("patientDui") REFERENCES "public"."Patients"("dui") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ClinicalConsultations" ADD CONSTRAINT "ClinicalConsultations_recordId_MedicalRecords_id_fk" FOREIGN KEY ("recordId") REFERENCES "public"."MedicalRecords"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ClinicalConsultations" ADD CONSTRAINT "ClinicalConsultations_appointmentId_MedicalAppointments_id_fk" FOREIGN KEY ("appointmentId") REFERENCES "public"."MedicalAppointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WhatsAppMessages" ADD CONSTRAINT "WhatsAppMessages_appointmentId_MedicalAppointments_id_fk" FOREIGN KEY ("appointmentId") REFERENCES "public"."MedicalAppointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "Accounts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "Sessions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "Verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "patients_user_id_idx" ON "Patients" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "patients_insurance_id_idx" ON "Patients" USING btree ("insuranceId");--> statement-breakpoint
CREATE INDEX "schedule_events_audit_user_id_idx" ON "ScheduleEvents" USING btree ("auditUserId");--> statement-breakpoint
CREATE INDEX "schedule_events_doctor_date_idx" ON "ScheduleEvents" USING btree ("doctorId","eventDate");--> statement-breakpoint
CREATE INDEX "medical_appointments_patient_dui_idx" ON "MedicalAppointments" USING btree ("patientDui");--> statement-breakpoint
CREATE INDEX "clinical_consultations_record_id_idx" ON "ClinicalConsultations" USING btree ("recordId");--> statement-breakpoint
CREATE INDEX "whatsapp_messages_appointment_id_idx" ON "WhatsAppMessages" USING btree ("appointmentId");--> statement-breakpoint
CREATE VIEW "public"."DailyScheduleView" AS (
  SELECT
    se.id                 AS "eventId",
    se."doctorId",
    se."eventDate",
    se."startTime",
    se."endTime",
    se."availabilityStatus",
    ma.id                 AS "appointmentId",
    ma."bookingReason",
    p.dui                 AS "patientDui",
    p."firstName",
    p."lastName",
    p."whatsappPhone"
  FROM "ScheduleEvents" se
  LEFT JOIN "MedicalAppointments" ma ON ma."eventId" = se.id
  LEFT JOIN "Patients" p             ON p.dui = ma."patientDui"
  WHERE se."eventType" = 'appointment'
);--> statement-breakpoint
CREATE VIEW "public"."PatientFullRecordView" AS (
  SELECT
    p.dui,
    p."firstName",
    p."lastName",
    p."birthDate",
    p."whatsappPhone",
    mi."insurerName",
    mi."coverageType",
    mr.id                      AS "recordId",
    mr."bloodType",
    mr."knownAllergies",
    mr."familyHistory",
    mr."chronicConditions",
    mr."openedAt"              AS "recordOpenedAt",
    cc.id                      AS "lastConsultationId",
    cc."mainDiagnosis"         AS "lastDiagnosis",
    cc."prescribedTreatment"   AS "lastTreatment",
    ma."bookedAt"              AS "lastVisitDate"
  FROM "Patients" p
  LEFT JOIN "MedicalInsurances" mi ON mi.id = p."insuranceId"
  LEFT JOIN "MedicalRecords"    mr ON mr."patientDui" = p.dui
  LEFT JOIN LATERAL (
    SELECT cc.*, ma."bookedAt"
    FROM "ClinicalConsultations" cc
    JOIN "MedicalAppointments"   ma ON ma.id = cc."appointmentId"
    WHERE cc."recordId" = mr.id
    ORDER BY ma."bookedAt" DESC
    LIMIT 1
  ) cc ON true
  LEFT JOIN "MedicalAppointments" ma ON ma.id = cc."appointmentId"
);
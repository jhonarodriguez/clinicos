-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "trade_name" VARCHAR(200),
    "nit" VARCHAR(20) NOT NULL,
    "verification_digit" CHAR(1),
    "ips_code" VARCHAR(20),
    "complexity_level" VARCHAR(20),
    "ips_type" VARCHAR(50),
    "legal_rep_name" VARCHAR(200),
    "legal_rep_document" VARCHAR(20),
    "phone" VARCHAR(20),
    "email" VARCHAR(200),
    "logo_url" VARCHAR(500),
    "branding" JSONB NOT NULL DEFAULT '{}',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'America/Bogota',
    "subscription_plan" VARCHAR(50) NOT NULL DEFAULT 'starter',
    "subscription_status" VARCHAR(20) NOT NULL DEFAULT 'trial',
    "trial_ends_at" TIMESTAMPTZ(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_sites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" VARCHAR(300) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "department" VARCHAR(100),
    "municipality_code" VARCHAR(10),
    "phone" VARCHAR(20),
    "email" VARCHAR(200),
    "schedule" JSONB NOT NULL DEFAULT '{}',
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_features" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "feature_key" VARCHAR(100) NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL DEFAULT '{}',
    "enabled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "password_hash" VARCHAR(200) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "avatar_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "has_mfa" BOOLEAN NOT NULL DEFAULT false,
    "mfa_secret" VARCHAR(200),
    "password_changed_at" TIMESTAMPTZ(6),
    "failed_login_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ(6),
    "last_login_at" TIMESTAMPTZ(6),
    "last_login_ip" VARCHAR(45),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "module" VARCHAR(50) NOT NULL,
    "resource" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "scope" VARCHAR(50) NOT NULL DEFAULT 'all',

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "site_id" UUID,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" UUID,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "refresh_token" VARCHAR(500) NOT NULL,
    "ip_address" VARCHAR(45) NOT NULL,
    "user_agent" TEXT,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialties" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(20),
    "parent_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professionals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "professional_card" VARCHAR(50),
    "registration_number" VARCHAR(50),
    "document_type" VARCHAR(10) NOT NULL,
    "document_number" VARCHAR(20) NOT NULL,
    "digital_signature_url" VARCHAR(500),
    "stamp_url" VARCHAR(500),
    "qr_verification_data" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "professionals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_specialties" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "professional_id" UUID NOT NULL,
    "specialty_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "professional_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20),
    "room_type" VARCHAR(50) NOT NULL,
    "capacity" INTEGER DEFAULT 1,
    "floor" VARCHAR(20),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(50),
    "equipment_type" VARCHAR(100) NOT NULL,
    "brand" VARCHAR(100),
    "model" VARCHAR(100),
    "serial_number" VARCHAR(100),
    "room_id" UUID,
    "maintenance_status" VARCHAR(20) NOT NULL DEFAULT 'operational',
    "last_maintenance_at" TIMESTAMPTZ(6),
    "next_maintenance_at" TIMESTAMPTZ(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(50),
    "cups_code" VARCHAR(20),
    "category" VARCHAR(50) NOT NULL,
    "default_duration_min" INTEGER NOT NULL,
    "recovery_duration_min" INTEGER NOT NULL DEFAULT 0,
    "cleanup_duration_min" INTEGER NOT NULL DEFAULT 0,
    "requires_sedation" BOOLEAN NOT NULL DEFAULT false,
    "requires_companion" BOOLEAN NOT NULL DEFAULT false,
    "requires_authorization" BOOLEAN NOT NULL DEFAULT false,
    "requires_consent" BOOLEAN NOT NULL DEFAULT false,
    "consent_template_id" UUID,
    "preparation_protocol_id" UUID,
    "can_self_schedule" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_resource_requirements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_type_id" UUID NOT NULL,
    "resource_type" VARCHAR(50) NOT NULL,
    "resource_value" VARCHAR(100) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "is_required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "service_resource_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_schedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "professional_id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "slot_duration_min" INTEGER NOT NULL DEFAULT 20,
    "max_overbooking" INTEGER NOT NULL DEFAULT 0,
    "allowed_service_types" UUID[],
    "valid_from" DATE NOT NULL,
    "valid_until" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professional_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_blocks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "block_type" VARCHAR(50) NOT NULL,
    "professional_id" UUID,
    "room_id" UUID,
    "equipment_id" UUID,
    "start_datetime" TIMESTAMPTZ(6) NOT NULL,
    "end_datetime" TIMESTAMPTZ(6) NOT NULL,
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "professional_id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "room_id" UUID,
    "service_type_id" UUID NOT NULL,
    "specialty_id" UUID,
    "scheduled_start" TIMESTAMPTZ(6) NOT NULL,
    "scheduled_end" TIMESTAMPTZ(6) NOT NULL,
    "actual_start" TIMESTAMPTZ(6),
    "actual_end" TIMESTAMPTZ(6),
    "status" VARCHAR(30) NOT NULL DEFAULT 'scheduled',
    "is_first_visit" BOOLEAN NOT NULL DEFAULT false,
    "is_overbooking" BOOLEAN NOT NULL DEFAULT false,
    "authorization_number" VARCHAR(50),
    "cancellation_reason" TEXT,
    "cancelled_by" VARCHAR(20),
    "cancelled_at" TIMESTAMPTZ(6),
    "arrival_at" TIMESTAMPTZ(6),
    "source" VARCHAR(30) NOT NULL DEFAULT 'reception',
    "notes" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedures" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "service_type_id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "primary_professional_id" UUID NOT NULL,
    "anesthesiologist_id" UUID,
    "room_id" UUID NOT NULL,
    "equipment_id" UUID,
    "scheduled_start" TIMESTAMPTZ(6) NOT NULL,
    "scheduled_end" TIMESTAMPTZ(6) NOT NULL,
    "recovery_until" TIMESTAMPTZ(6),
    "actual_start" TIMESTAMPTZ(6),
    "actual_end" TIMESTAMPTZ(6),
    "recovery_start" TIMESTAMPTZ(6),
    "recovery_end" TIMESTAMPTZ(6),
    "status" VARCHAR(30) NOT NULL DEFAULT 'scheduled',
    "originating_order_id" UUID,
    "authorization_number" VARCHAR(50),
    "companion_name" VARCHAR(200),
    "companion_document" VARCHAR(20),
    "companion_phone" VARCHAR(20),
    "companion_relationship" VARCHAR(50),
    "prep_instructions_sent" BOOLEAN NOT NULL DEFAULT false,
    "prep_instructions_sent_at" TIMESTAMPTZ(6),
    "prep_confirmed_by_patient" BOOLEAN DEFAULT false,
    "prep_adequate" BOOLEAN,
    "cancellation_reason" TEXT,
    "cancelled_by" VARCHAR(20),
    "cancelled_at" TIMESTAMPTZ(6),
    "is_late_cancellation" BOOLEAN DEFAULT false,
    "procedure_report_id" UUID,
    "source" VARCHAR(30) NOT NULL DEFAULT 'reception',
    "notes" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "service_type_id" UUID NOT NULL,
    "preferred_professional_id" UUID,
    "preferred_site_id" UUID,
    "date_range_start" DATE,
    "date_range_end" DATE,
    "preferred_time" VARCHAR(20),
    "priority" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "status" VARCHAR(20) NOT NULL DEFAULT 'waiting',
    "notified_at" TIMESTAMPTZ(6),
    "notification_expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "document_type" VARCHAR(10) NOT NULL,
    "document_number" VARCHAR(20) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "second_name" VARCHAR(100),
    "first_last_name" VARCHAR(100) NOT NULL,
    "second_last_name" VARCHAR(100),
    "birth_date" DATE NOT NULL,
    "biological_sex" CHAR(1) NOT NULL,
    "gender_identity" VARCHAR(50),
    "blood_type" VARCHAR(5),
    "phone" VARCHAR(20),
    "phone_secondary" VARCHAR(20),
    "email" VARCHAR(200),
    "address" VARCHAR(300),
    "municipality_code" VARCHAR(10),
    "zone" VARCHAR(10),
    "marital_status" VARCHAR(20),
    "education_level" VARCHAR(50),
    "occupation" VARCHAR(100),
    "ethnicity" VARCHAR(50) NOT NULL DEFAULT 'none',
    "disability" VARCHAR(50) NOT NULL DEFAULT 'none',
    "payer_type" VARCHAR(30),
    "payer_id" UUID,
    "payer_name" VARCHAR(200),
    "affiliate_type" VARCHAR(20),
    "emergency_contact" JSONB,
    "default_companion" JSONB,
    "no_show_count" INTEGER NOT NULL DEFAULT 0,
    "self_schedule_blocked" BOOLEAN NOT NULL DEFAULT false,
    "merged_into_id" UUID,
    "merged_at" TIMESTAMPTZ(6),
    "data_consent_signed" BOOLEAN NOT NULL DEFAULT false,
    "data_consent_signed_at" TIMESTAMPTZ(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_consents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "consent_type" VARCHAR(50) NOT NULL,
    "template_version" VARCHAR(20),
    "content_snapshot" TEXT,
    "signed_at" TIMESTAMPTZ(6) NOT NULL,
    "signed_by_name" VARCHAR(200) NOT NULL,
    "signed_by_document" VARCHAR(20),
    "signed_by_relationship" VARCHAR(50),
    "signature_image_url" VARCHAR(500),
    "signature_ip" VARCHAR(45),
    "signature_method" VARCHAR(20),
    "professional_id" UUID,
    "pdf_url" VARCHAR(500),
    "related_entity_type" VARCHAR(50),
    "related_entity_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "professional_id" UUID NOT NULL,
    "appointment_id" UUID,
    "site_id" UUID NOT NULL,
    "record_type" VARCHAR(50) NOT NULL,
    "template_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    "signed_at" TIMESTAMPTZ(6),
    "signature_hash" VARCHAR(100),
    "sign_deadline" TIMESTAMPTZ(6),
    "addendum_of" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_record_sections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "medical_record_id" UUID NOT NULL,
    "section_type" VARCHAR(50) NOT NULL,
    "content" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_record_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "procedure_id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "report_number" VARCHAR(50),
    "procedure_type" VARCHAR(100) NOT NULL,
    "primary_professional_id" UUID NOT NULL,
    "anesthesiologist_id" UUID,
    "pre_diagnosis_cie" VARCHAR(20),
    "indication" TEXT NOT NULL,
    "anesthetic_note" JSONB,
    "procedure_description" JSONB NOT NULL,
    "complications" TEXT,
    "recommendations" TEXT,
    "clinical_summary" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    "primary_signed_at" TIMESTAMPTZ(6),
    "primary_signature_hash" VARCHAR(100),
    "anesthesiologist_signed_at" TIMESTAMPTZ(6),
    "anesthesiologist_signature_hash" VARCHAR(100),
    "sign_deadline" TIMESTAMPTZ(6),
    "pdf_url" VARCHAR(500),
    "pdf_generated_at" TIMESTAMPTZ(6),
    "published_to_portal" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "procedure_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "medical_record_id" UUID,
    "procedure_report_id" UUID,
    "patient_id" UUID,
    "professional_id" UUID,
    "cie_version" VARCHAR(10) NOT NULL DEFAULT 'CIE-10',
    "cie_code" VARCHAR(20) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "diagnosis_type" VARCHAR(20) NOT NULL,
    "confirmation_type" VARCHAR(20),
    "is_first_time" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "medical_record_id" UUID,
    "procedure_report_id" UUID,
    "patient_id" UUID NOT NULL,
    "professional_id" UUID NOT NULL,
    "order_type" VARCHAR(30) NOT NULL,
    "cups_code" VARCHAR(20),
    "description" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "diagnosis_cie" VARCHAR(20),
    "is_urgent" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'created',
    "notes" TEXT,
    "pdf_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "medical_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "medical_record_id" UUID,
    "procedure_report_id" UUID,
    "patient_id" UUID NOT NULL,
    "professional_id" UUID NOT NULL,
    "prescription_number" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "pdf_url" VARCHAR(500),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "prescription_id" UUID NOT NULL,
    "medication_name" VARCHAR(300) NOT NULL,
    "medication_code" VARCHAR(50),
    "concentration" VARCHAR(100),
    "pharmaceutical_form" VARCHAR(100),
    "administration_route" VARCHAR(50),
    "dose" VARCHAR(100) NOT NULL,
    "frequency" VARCHAR(100) NOT NULL,
    "duration_days" INTEGER,
    "total_quantity" INTEGER,
    "special_instructions" TEXT,
    "is_controlled" BOOLEAN NOT NULL DEFAULT false,
    "requires_mipres" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "procedure_report_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "original_filename" VARCHAR(300),
    "storage_key" VARCHAR(500) NOT NULL,
    "thumbnail_key" VARCHAR(500),
    "mime_type" VARCHAR(50) DEFAULT 'image/jpeg',
    "size_bytes" BIGINT,
    "anatomical_segment" VARCHAR(100),
    "annotation" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_selected_for_report" BOOLEAN NOT NULL DEFAULT true,
    "captured_at" TIMESTAMPTZ(6),
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procedure_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biopsy_samples" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "procedure_report_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "professional_id" UUID NOT NULL,
    "sample_number" INTEGER NOT NULL,
    "site_description" VARCHAR(200) NOT NULL,
    "sample_type" VARCHAR(50) NOT NULL,
    "num_fragments" INTEGER DEFAULT 1,
    "num_jars" INTEGER DEFAULT 1,
    "fixative" VARCHAR(50) DEFAULT 'formalin',
    "pathology_lab_name" VARCHAR(200),
    "sent_date" DATE,
    "sent_by" UUID,
    "tracking_number" VARCHAR(100),
    "result_received_date" DATE,
    "result_summary" TEXT,
    "result_diagnosis_cie" VARCHAR(20),
    "result_document_url" VARCHAR(500),
    "result_reviewed_by" UUID,
    "result_reviewed_at" TIMESTAMPTZ(6),
    "is_published_to_portal" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(30) NOT NULL DEFAULT 'registered',
    "alert_triggered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "biopsy_samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "nit" VARCHAR(20),
    "payer_type" VARCHAR(30) NOT NULL,
    "code" VARCHAR(20),
    "contact_email" VARCHAR(200),
    "contact_phone" VARCHAR(20),
    "filing_address" VARCHAR(300),
    "filing_email" VARCHAR(200),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "payer_id" UUID NOT NULL,
    "contract_number" VARCHAR(50) NOT NULL,
    "contract_type" VARCHAR(30) NOT NULL,
    "tariff_base" VARCHAR(50) NOT NULL,
    "tariff_percentage" DECIMAL(6,2),
    "valid_from" DATE NOT NULL,
    "valid_until" DATE NOT NULL,
    "requires_authorization" BOOLEAN NOT NULL DEFAULT true,
    "max_per_event" DECIMAL(15,2),
    "max_monthly" DECIMAL(15,2),
    "max_annual" DECIMAL(15,2),
    "filing_deadline_days" INTEGER DEFAULT 30,
    "payment_deadline_days" INTEGER DEFAULT 60,
    "covered_services" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "invoice_number" VARCHAR(50) NOT NULL,
    "prefix" VARCHAR(10),
    "cufe" VARCHAR(200),
    "patient_id" UUID NOT NULL,
    "payer_id" UUID,
    "contract_id" UUID,
    "payer_type" VARCHAR(30) NOT NULL,
    "appointment_id" UUID,
    "procedure_id" UUID,
    "subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "copay_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "payer_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "patient_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "xml_url" VARCHAR(500),
    "pdf_url" VARCHAR(500),
    "rips_json_url" VARCHAR(500),
    "filed_at" TIMESTAMPTZ(6),
    "filed_number" VARCHAR(50),
    "paid_at" TIMESTAMPTZ(6),
    "paid_amount" DECIMAL(15,2),
    "voided_at" TIMESTAMPTZ(6),
    "void_reason" TEXT,
    "credit_note_id" UUID,
    "issued_at" TIMESTAMPTZ(6),
    "issued_by" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "item_type" VARCHAR(30) NOT NULL,
    "cups_code" VARCHAR(20),
    "description" VARCHAR(500) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(15,2) NOT NULL,
    "total_price" DECIMAL(15,2) NOT NULL,
    "diagnosis_cie" VARCHAR(20),
    "professional_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claims" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "payer_id" UUID NOT NULL,
    "claim_number" VARCHAR(50),
    "claim_type" VARCHAR(30) NOT NULL,
    "claimed_amount" DECIMAL(15,2) NOT NULL,
    "received_at" TIMESTAMPTZ(6) NOT NULL,
    "response_deadline" TIMESTAMPTZ(6) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'received',
    "ips_response" TEXT,
    "ips_response_at" TIMESTAMPTZ(6),
    "accepted_amount" DECIMAL(15,2),
    "support_documents_url" VARCHAR(500),
    "responded_by" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "invoice_id" UUID,
    "patient_id" UUID,
    "payment_type" VARCHAR(30) NOT NULL,
    "payment_method" VARCHAR(30) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "reference_number" VARCHAR(100),
    "receipt_number" VARCHAR(50),
    "cash_register_id" UUID,
    "received_by" UUID,
    "payment_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "copayment_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "year" INTEGER NOT NULL,
    "regime" VARCHAR(20) NOT NULL,
    "level" VARCHAR(5) NOT NULL,
    "service_category" VARCHAR(50) NOT NULL,
    "moderating_fee" DECIMAL(10,2),
    "copay_percentage" DECIMAL(5,2),
    "copay_max_per_event" DECIMAL(15,2),
    "copay_max_annual" DECIMAL(15,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "copayment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_copay_accumulator" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "total_paid" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "patient_copay_accumulator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_programs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "program_type" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "start_date" DATE NOT NULL,
    "expected_end_date" DATE,
    "actual_end_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "responsible_professional_id" UUID NOT NULL,
    "notes" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "treatment_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_phases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "program_id" UUID NOT NULL,
    "phase_number" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "expected_date" DATE,
    "actual_date" DATE,
    "appointment_id" UUID,
    "procedure_id" UUID,
    "required_professionals" JSONB NOT NULL DEFAULT '[]',
    "required_services" JSONB NOT NULL DEFAULT '[]',
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "program_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preparation_protocols" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "service_type_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "content_html" TEXT NOT NULL,
    "content_plain" TEXT NOT NULL,
    "pdf_url" VARCHAR(500),
    "days_before_send" INTEGER NOT NULL DEFAULT 3,
    "reminder_hours" JSONB NOT NULL DEFAULT '[72, 24, 4]',
    "requires_read_confirmation" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "preparation_protocols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "patient_id" UUID,
    "user_id" UUID,
    "channel" VARCHAR(20) NOT NULL,
    "notification_type" VARCHAR(50) NOT NULL,
    "recipient" VARCHAR(200) NOT NULL,
    "subject" VARCHAR(300),
    "content" TEXT NOT NULL,
    "related_entity_type" VARCHAR(50),
    "related_entity_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "external_id" VARCHAR(200),
    "error_message" TEXT,
    "sent_at" TIMESTAMPTZ(6),
    "delivered_at" TIMESTAMPTZ(6),
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(30) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" UUID,
    "changes" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "session_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adverse_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "reported_by" UUID NOT NULL,
    "event_date" TIMESTAMPTZ(6) NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "description" TEXT NOT NULL,
    "immediate_actions" TEXT,
    "root_cause_analysis" TEXT,
    "corrective_actions" TEXT,
    "related_procedure_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'reported',
    "resolved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "adverse_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cie10_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(10) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "chapter" VARCHAR(10),
    "group_code" VARCHAR(10),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cie10_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cie11_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(20) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "cie10_equivalent" VARCHAR(10),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cie11_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cups_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(20) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "group_name" VARCHAR(200),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cups_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ium_medications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50),
    "generic_name" VARCHAR(500) NOT NULL,
    "atc_code" VARCHAR(20),
    "pharmaceutical_form" VARCHAR(100),
    "concentration" VARCHAR(100),
    "administration_route" VARCHAR(50),
    "is_pbs" BOOLEAN NOT NULL DEFAULT false,
    "is_controlled" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ium_medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dane_municipalities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "department_code" VARCHAR(5) NOT NULL,
    "department_name" VARCHAR(200) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "dane_municipalities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_nit_key" ON "tenants"("nit");

-- CreateIndex
CREATE INDEX "idx_tenant_sites_tenant" ON "tenant_sites"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_sites_tenant_id_name_key" ON "tenant_sites"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "idx_tenant_features_tenant" ON "tenant_features"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_features_tenant_id_feature_key_key" ON "tenant_features"("tenant_id", "feature_key");

-- CreateIndex
CREATE INDEX "idx_users_tenant" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_users_tenant_email" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "idx_roles_tenant" ON "roles"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenant_id_name_key" ON "roles"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_module_resource_action_key" ON "permissions"("module", "resource", "action");

-- CreateIndex
CREATE INDEX "idx_role_permissions_role" ON "role_permissions"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "idx_user_roles_user" ON "user_roles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_site_id_key" ON "user_roles"("user_id", "role_id", "site_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_key" ON "sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "idx_sessions_user" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "idx_sessions_token" ON "sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "idx_sessions_expires" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "idx_specialties_tenant" ON "specialties"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_specialties_parent" ON "specialties"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_user_id_key" ON "professionals"("user_id");

-- CreateIndex
CREATE INDEX "idx_professionals_tenant" ON "professionals"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_professionals_user" ON "professionals"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_tenant_id_user_id_key" ON "professionals"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_tenant_id_document_number_key" ON "professionals"("tenant_id", "document_number");

-- CreateIndex
CREATE INDEX "idx_prof_spec_professional" ON "professional_specialties"("professional_id");

-- CreateIndex
CREATE UNIQUE INDEX "professional_specialties_professional_id_specialty_id_key" ON "professional_specialties"("professional_id", "specialty_id");

-- CreateIndex
CREATE INDEX "idx_rooms_tenant_site" ON "rooms"("tenant_id", "site_id");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_tenant_id_site_id_code_key" ON "rooms"("tenant_id", "site_id", "code");

-- CreateIndex
CREATE INDEX "idx_equipment_tenant" ON "equipment"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_equipment_room" ON "equipment"("room_id");

-- CreateIndex
CREATE INDEX "idx_service_types_tenant" ON "service_types"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_types_tenant_id_code_key" ON "service_types"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "service_resource_requirements_service_type_id_resource_type_key" ON "service_resource_requirements"("service_type_id", "resource_type", "resource_value");

-- CreateIndex
CREATE INDEX "idx_prof_schedules_tenant_prof" ON "professional_schedules"("tenant_id", "professional_id");

-- CreateIndex
CREATE INDEX "idx_prof_schedules_day" ON "professional_schedules"("tenant_id", "professional_id", "day_of_week");

-- CreateIndex
CREATE INDEX "idx_schedule_blocks_tenant" ON "schedule_blocks"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_schedule_blocks_prof" ON "schedule_blocks"("tenant_id", "professional_id", "start_datetime", "end_datetime");

-- CreateIndex
CREATE INDEX "idx_schedule_blocks_room" ON "schedule_blocks"("tenant_id", "room_id", "start_datetime", "end_datetime");

-- CreateIndex
CREATE INDEX "idx_appointments_tenant_date" ON "appointments"("tenant_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "idx_appointments_tenant_prof" ON "appointments"("tenant_id", "professional_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "idx_appointments_tenant_patient" ON "appointments"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "idx_appointments_status" ON "appointments"("tenant_id", "status", "scheduled_start");

-- CreateIndex
CREATE INDEX "idx_procedures_tenant_date" ON "procedures"("tenant_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "idx_procedures_tenant_prof" ON "procedures"("tenant_id", "primary_professional_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "idx_procedures_tenant_anest" ON "procedures"("tenant_id", "anesthesiologist_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "idx_procedures_tenant_room" ON "procedures"("tenant_id", "room_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "idx_procedures_tenant_patient" ON "procedures"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "idx_procedures_status" ON "procedures"("tenant_id", "status", "scheduled_start");

-- CreateIndex
CREATE INDEX "idx_waitlist_tenant_service" ON "waitlist_entries"("tenant_id", "service_type_id", "status");

-- CreateIndex
CREATE INDEX "idx_patients_tenant" ON "patients"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_patients_tenant_doc" ON "patients"("tenant_id", "document_number");

-- CreateIndex
CREATE INDEX "idx_patients_tenant_name" ON "patients"("tenant_id", "first_last_name", "first_name");

-- CreateIndex
CREATE INDEX "idx_patients_tenant_phone" ON "patients"("tenant_id", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "patients_tenant_id_document_type_document_number_key" ON "patients"("tenant_id", "document_type", "document_number");

-- CreateIndex
CREATE INDEX "idx_consents_tenant_patient" ON "patient_consents"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "idx_consents_type" ON "patient_consents"("tenant_id", "patient_id", "consent_type");

-- CreateIndex
CREATE UNIQUE INDEX "medical_records_appointment_id_key" ON "medical_records"("appointment_id");

-- CreateIndex
CREATE INDEX "idx_med_records_tenant_patient" ON "medical_records"("tenant_id", "patient_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_med_records_tenant_prof" ON "medical_records"("tenant_id", "professional_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_med_records_appointment" ON "medical_records"("appointment_id");

-- CreateIndex
CREATE INDEX "idx_record_sections_record" ON "medical_record_sections"("medical_record_id");

-- CreateIndex
CREATE INDEX "idx_record_sections_type" ON "medical_record_sections"("medical_record_id", "section_type");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_reports_procedure_id_key" ON "procedure_reports"("procedure_id");

-- CreateIndex
CREATE INDEX "idx_proc_reports_tenant_patient" ON "procedure_reports"("tenant_id", "patient_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_proc_reports_procedure" ON "procedure_reports"("procedure_id");

-- CreateIndex
CREATE INDEX "idx_diagnoses_record" ON "diagnoses"("medical_record_id");

-- CreateIndex
CREATE INDEX "idx_diagnoses_report" ON "diagnoses"("procedure_report_id");

-- CreateIndex
CREATE INDEX "idx_diagnoses_tenant_code" ON "diagnoses"("tenant_id", "cie_code");

-- CreateIndex
CREATE INDEX "idx_orders_tenant_patient" ON "medical_orders"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "idx_orders_record" ON "medical_orders"("medical_record_id");

-- CreateIndex
CREATE INDEX "idx_orders_type_status" ON "medical_orders"("tenant_id", "order_type", "status");

-- CreateIndex
CREATE INDEX "idx_prescriptions_tenant_patient" ON "prescriptions"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "idx_prescription_items_prescription" ON "prescription_items"("prescription_id");

-- CreateIndex
CREATE INDEX "idx_proc_images_report" ON "procedure_images"("procedure_report_id");

-- CreateIndex
CREATE INDEX "idx_proc_images_tenant_patient" ON "procedure_images"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "idx_biopsies_tenant_patient" ON "biopsy_samples"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "idx_biopsies_report" ON "biopsy_samples"("procedure_report_id");

-- CreateIndex
CREATE INDEX "idx_biopsies_status" ON "biopsy_samples"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "idx_payers_tenant" ON "payers"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "payers_tenant_id_nit_key" ON "payers"("tenant_id", "nit");

-- CreateIndex
CREATE INDEX "idx_contracts_tenant_payer" ON "contracts"("tenant_id", "payer_id");

-- CreateIndex
CREATE INDEX "idx_contracts_validity" ON "contracts"("tenant_id", "valid_from", "valid_until");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_tenant_id_contract_number_key" ON "contracts"("tenant_id", "contract_number");

-- CreateIndex
CREATE INDEX "idx_invoices_tenant" ON "invoices"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_invoices_tenant_patient" ON "invoices"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "idx_invoices_tenant_payer" ON "invoices"("tenant_id", "payer_id", "status");

-- CreateIndex
CREATE INDEX "idx_invoices_status" ON "invoices"("tenant_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenant_id_invoice_number_key" ON "invoices"("tenant_id", "invoice_number");

-- CreateIndex
CREATE INDEX "idx_invoice_items_invoice" ON "invoice_items"("invoice_id");

-- CreateIndex
CREATE INDEX "idx_claims_tenant" ON "claims"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "idx_claims_invoice" ON "claims"("invoice_id");

-- CreateIndex
CREATE INDEX "idx_claims_deadline" ON "claims"("tenant_id", "response_deadline");

-- CreateIndex
CREATE INDEX "idx_payments_tenant" ON "payments"("tenant_id", "payment_date" DESC);

-- CreateIndex
CREATE INDEX "idx_payments_invoice" ON "payments"("invoice_id");

-- CreateIndex
CREATE INDEX "idx_payments_patient" ON "payments"("tenant_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "copayment_rules_tenant_id_year_regime_level_service_categor_key" ON "copayment_rules"("tenant_id", "year", "regime", "level", "service_category");

-- CreateIndex
CREATE INDEX "idx_copay_accum_tenant_patient" ON "patient_copay_accumulator"("tenant_id", "patient_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "patient_copay_accumulator_tenant_id_patient_id_year_key" ON "patient_copay_accumulator"("tenant_id", "patient_id", "year");

-- CreateIndex
CREATE INDEX "idx_programs_tenant_patient" ON "treatment_programs"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "idx_programs_status" ON "treatment_programs"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "idx_phases_program" ON "program_phases"("program_id");

-- CreateIndex
CREATE INDEX "idx_phases_status" ON "program_phases"("program_id", "status");

-- CreateIndex
CREATE INDEX "idx_prep_protocols_tenant" ON "preparation_protocols"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_prep_protocols_service" ON "preparation_protocols"("service_type_id");

-- CreateIndex
CREATE INDEX "idx_notifications_tenant" ON "notifications"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notifications_status" ON "notifications"("tenant_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "idx_notifications_patient" ON "notifications"("tenant_id", "patient_id");

-- CreateIndex
CREATE INDEX "idx_audit_tenant_time" ON "audit_logs"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_entity" ON "audit_logs"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_audit_user" ON "audit_logs"("tenant_id", "user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_adverse_events_tenant" ON "adverse_events"("tenant_id", "event_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "cie10_codes_code_key" ON "cie10_codes"("code");

-- CreateIndex
CREATE INDEX "idx_cie10_code" ON "cie10_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cie11_codes_code_key" ON "cie11_codes"("code");

-- CreateIndex
CREATE INDEX "idx_cie11_code" ON "cie11_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cups_codes_code_key" ON "cups_codes"("code");

-- CreateIndex
CREATE INDEX "idx_cups_code" ON "cups_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ium_medications_code_key" ON "ium_medications"("code");

-- CreateIndex
CREATE INDEX "idx_ium_atc" ON "ium_medications"("atc_code");

-- CreateIndex
CREATE UNIQUE INDEX "dane_municipalities_code_key" ON "dane_municipalities"("code");

-- CreateIndex
CREATE INDEX "idx_dane_code" ON "dane_municipalities"("code");

-- AddForeignKey
ALTER TABLE "tenant_sites" ADD CONSTRAINT "tenant_sites_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_features" ADD CONSTRAINT "tenant_features_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tenant_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialties" ADD CONSTRAINT "specialties_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialties" ADD CONSTRAINT "specialties_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_specialties" ADD CONSTRAINT "professional_specialties_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_specialties" ADD CONSTRAINT "professional_specialties_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tenant_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tenant_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_types" ADD CONSTRAINT "service_types_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_resource_requirements" ADD CONSTRAINT "service_resource_requirements_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_schedules" ADD CONSTRAINT "professional_schedules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_schedules" ADD CONSTRAINT "professional_schedules_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_schedules" ADD CONSTRAINT "professional_schedules_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tenant_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tenant_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tenant_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_primary_professional_id_fkey" FOREIGN KEY ("primary_professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_anesthesiologist_id_fkey" FOREIGN KEY ("anesthesiologist_id") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_preferred_professional_id_fkey" FOREIGN KEY ("preferred_professional_id") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_merged_into_id_fkey" FOREIGN KEY ("merged_into_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_consents" ADD CONSTRAINT "patient_consents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_consents" ADD CONSTRAINT "patient_consents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_consents" ADD CONSTRAINT "patient_consents_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tenant_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_addendum_of_fkey" FOREIGN KEY ("addendum_of") REFERENCES "medical_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_record_sections" ADD CONSTRAINT "medical_record_sections_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_record_sections" ADD CONSTRAINT "medical_record_sections_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_reports" ADD CONSTRAINT "procedure_reports_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_reports" ADD CONSTRAINT "procedure_reports_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_reports" ADD CONSTRAINT "procedure_reports_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_reports" ADD CONSTRAINT "procedure_reports_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tenant_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_reports" ADD CONSTRAINT "procedure_reports_primary_professional_id_fkey" FOREIGN KEY ("primary_professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_reports" ADD CONSTRAINT "procedure_reports_anesthesiologist_id_fkey" FOREIGN KEY ("anesthesiologist_id") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_procedure_report_id_fkey" FOREIGN KEY ("procedure_report_id") REFERENCES "procedure_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_orders" ADD CONSTRAINT "medical_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_orders" ADD CONSTRAINT "medical_orders_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_orders" ADD CONSTRAINT "medical_orders_procedure_report_id_fkey" FOREIGN KEY ("procedure_report_id") REFERENCES "procedure_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_orders" ADD CONSTRAINT "medical_orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_orders" ADD CONSTRAINT "medical_orders_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_procedure_report_id_fkey" FOREIGN KEY ("procedure_report_id") REFERENCES "procedure_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_images" ADD CONSTRAINT "procedure_images_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_images" ADD CONSTRAINT "procedure_images_procedure_report_id_fkey" FOREIGN KEY ("procedure_report_id") REFERENCES "procedure_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_images" ADD CONSTRAINT "procedure_images_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_images" ADD CONSTRAINT "procedure_images_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biopsy_samples" ADD CONSTRAINT "biopsy_samples_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biopsy_samples" ADD CONSTRAINT "biopsy_samples_procedure_report_id_fkey" FOREIGN KEY ("procedure_report_id") REFERENCES "procedure_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biopsy_samples" ADD CONSTRAINT "biopsy_samples_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biopsy_samples" ADD CONSTRAINT "biopsy_samples_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biopsy_samples" ADD CONSTRAINT "biopsy_samples_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biopsy_samples" ADD CONSTRAINT "biopsy_samples_result_reviewed_by_fkey" FOREIGN KEY ("result_reviewed_by") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payers" ADD CONSTRAINT "payers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "payers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "payers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "payers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_responded_by_fkey" FOREIGN KEY ("responded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copayment_rules" ADD CONSTRAINT "copayment_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_copay_accumulator" ADD CONSTRAINT "patient_copay_accumulator_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_copay_accumulator" ADD CONSTRAINT "patient_copay_accumulator_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_programs" ADD CONSTRAINT "treatment_programs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_programs" ADD CONSTRAINT "treatment_programs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_programs" ADD CONSTRAINT "treatment_programs_responsible_professional_id_fkey" FOREIGN KEY ("responsible_professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_programs" ADD CONSTRAINT "treatment_programs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_phases" ADD CONSTRAINT "program_phases_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "treatment_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_phases" ADD CONSTRAINT "program_phases_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_phases" ADD CONSTRAINT "program_phases_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preparation_protocols" ADD CONSTRAINT "preparation_protocols_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preparation_protocols" ADD CONSTRAINT "preparation_protocols_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adverse_events" ADD CONSTRAINT "adverse_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adverse_events" ADD CONSTRAINT "adverse_events_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adverse_events" ADD CONSTRAINT "adverse_events_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adverse_events" ADD CONSTRAINT "adverse_events_related_procedure_id_fkey" FOREIGN KEY ("related_procedure_id") REFERENCES "procedures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

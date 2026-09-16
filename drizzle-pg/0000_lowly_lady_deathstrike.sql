CREATE TABLE "ab_experiments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ab_experiments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(140) NOT NULL,
	"status" varchar(64) DEFAULT 'draft' NOT NULL,
	"objective" varchar(80) DEFAULT 'booked_call' NOT NULL,
	"variants" jsonb NOT NULL,
	"allocation" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_health" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "account_health_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"accountId" integer NOT NULL,
	"status" varchar(64) DEFAULT 'unknown' NOT NULL,
	"lastSuccessAt" timestamp,
	"lastErrorCode" varchar(80),
	"lastError" text,
	"consecutiveFailures" integer DEFAULT 0 NOT NULL,
	"cooldownUntil" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "account_health_accountId_unique" UNIQUE("accountId")
);
--> statement-breakpoint
CREATE TABLE "adapter_configs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "adapter_configs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"adapterKey" varchar(80) NOT NULL,
	"displayName" varchar(140) NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"mode" varchar(64) DEFAULT 'disabled' NOT NULL,
	"settings" jsonb,
	"secretRef" varchar(160),
	"lastHealthAt" timestamp,
	"lastError" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "adapter_configs_adapterKey_unique" UNIQUE("adapterKey")
);
--> statement-breakpoint
CREATE TABLE "api_clients" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "api_clients_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(120) NOT NULL,
	"keyPrefix" varchar(20) NOT NULL,
	"keyHash" varchar(128) NOT NULL,
	"scopes" jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"createdBy" integer NOT NULL,
	"lastUsedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"revokedAt" timestamp,
	CONSTRAINT "api_clients_keyPrefix_unique" UNIQUE("keyPrefix"),
	CONSTRAINT "api_clients_keyHash_unique" UNIQUE("keyHash")
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "app_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"settingKey" varchar(120) NOT NULL,
	"settingValue" text NOT NULL,
	"updatedBy" integer,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_settingKey_unique" UNIQUE("settingKey")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"actorUserId" integer,
	"action" varchar(120) NOT NULL,
	"targetType" varchar(80),
	"targetId" integer,
	"details" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_jobs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "automation_jobs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"jobType" varchar(100) NOT NULL,
	"adapterKey" varchar(80),
	"accountId" integer,
	"status" varchar(64) DEFAULT 'queued' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"leaseOwner" varchar(120),
	"leaseExpiresAt" timestamp,
	"correlationId" varchar(160),
	"lastErrorCode" varchar(80),
	"lastError" text,
	"payload" jsonb,
	"runAfter" timestamp,
	"startedAt" timestamp,
	"finishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_leads" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "campaign_leads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"campaignId" integer NOT NULL,
	"leadId" integer NOT NULL,
	"accountId" integer,
	"idempotencyKey" varchar(200),
	"sequenceState" varchar(64) DEFAULT 'queued' NOT NULL,
	"assignedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_leads_idempotencyKey_unique" UNIQUE("idempotencyKey")
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "campaigns_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(160) NOT NULL,
	"status" varchar(64) DEFAULT 'draft' NOT NULL,
	"sourceFilter" varchar(80),
	"followerMin" integer,
	"followerMax" integer,
	"includeKeywords" jsonb,
	"excludeKeywords" jsonb,
	"nonResponderFollowupsEnabled" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "conversations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"leadId" integer NOT NULL,
	"accountId" integer NOT NULL,
	"campaignId" integer,
	"state" varchar(64) DEFAULT 'no_reply' NOT NULL,
	"stateSource" varchar(64) DEFAULT 'ai' NOT NULL,
	"lockedByOperator" boolean DEFAULT false NOT NULL,
	"lastMessageAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "do_not_contact" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "do_not_contact_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(120) NOT NULL,
	"reason" varchar(240) NOT NULL,
	"source" varchar(80) DEFAULT 'operator' NOT NULL,
	"createdBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "do_not_contact_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "leads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(120) NOT NULL,
	"displayName" varchar(160),
	"bio" text,
	"source" varchar(80) NOT NULL,
	"followers" integer,
	"verified" boolean,
	"lastPostAt" timestamp,
	"accountJoinedAt" timestamp,
	"qualificationStatus" jsonb,
	"qualificationVerdict" varchar(64) DEFAULT 'partial' NOT NULL,
	"contactStatus" varchar(64) DEFAULT 'never' NOT NULL,
	"scrapedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "leads_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "learning_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "learning_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"eventType" varchar(80) NOT NULL,
	"entityType" varchar(80) NOT NULL,
	"entityId" integer NOT NULL,
	"predictedLabel" varchar(80),
	"finalLabel" varchar(80) NOT NULL,
	"confidence" integer,
	"features" jsonb,
	"createdBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "message_templates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(140) NOT NULL,
	"channel" varchar(40) DEFAULT 'instagram' NOT NULL,
	"variantKey" varchar(80),
	"body" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"conversationId" integer NOT NULL,
	"direction" varchar(64) NOT NULL,
	"senderType" varchar(64) NOT NULL,
	"body" text NOT NULL,
	"sentAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_rules" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notification_rules_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"channel" varchar(40) NOT NULL,
	"targetRef" varchar(220),
	"events" jsonb NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proxy_routes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "proxy_routes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"accountId" integer NOT NULL,
	"label" varchar(120) NOT NULL,
	"protocol" varchar(64) DEFAULT 'https' NOT NULL,
	"host" varchar(255) NOT NULL,
	"port" integer NOT NULL,
	"username" varchar(160),
	"secretRef" varchar(160),
	"enabled" boolean DEFAULT false NOT NULL,
	"lastHealthAt" timestamp,
	"lastError" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "proxy_routes_accountId_unique" UNIQUE("accountId")
);
--> statement-breakpoint
CREATE TABLE "sending_accounts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sending_accounts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"handle" varchar(80) NOT NULL,
	"label" varchar(120) NOT NULL,
	"status" varchar(64) DEFAULT 'warming' NOT NULL,
	"coldCap" integer DEFAULT 15 NOT NULL,
	"warmCap" integer DEFAULT 40 NOT NULL,
	"coldSentToday" integer DEFAULT 0 NOT NULL,
	"warmSentToday" integer DEFAULT 0 NOT NULL,
	"workingHours" varchar(80) DEFAULT '09:00–17:30' NOT NULL,
	"spintaxTemplate" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"lastActivityAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sending_accounts_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" varchar(64) DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "workspace_config" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workspace_config_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"section" varchar(80) NOT NULL,
	"config" jsonb NOT NULL,
	"updatedBy" integer,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_config_section_unique" UNIQUE("section")
);

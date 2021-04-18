--- Enums
CREATE TYPE "app"."role" AS enum (
);

CREATE TABLE "app"."user_auth" ( 
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "role" app.role NOT NULL,
  "invitation_hash" text,
  "invitation_made_by" uuid REFERENCES "app".user_auth,
  "invitation_made_at" timestamp,
  "invitation_accepted_at" timestamp,
  "last_updated_at" timestamp DEFAULT now() NOT NULL,
  "email" text UNIQUE NOT NULL, 
  "email_confirmation_sent" boolean NOT null DEFAULT false,
  "email_confirmed_at" timestamp,
  "email_confirmation_hash" text,
  "salt" text NOT NULL,
  "password_hash" text NOT NULL, 
  "password_last_updated_at" timestamp DEFAULT now(),
  "reset_password_hash" text,
  "reset_password_expiry" timestamp,
  "invalid_user_attempts" int DEFAULT 0, 
  "last_invalid_attempt" timestamp
);
CREATE TRIGGER update_user_auth_change_timestamp BEFORE UPDATE ON "app"."user_auth" FOR EACH ROW EXECUTE PROCEDURE update_change_timestamp();

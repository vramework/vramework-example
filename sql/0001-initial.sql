CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE SCHEMA "app";

--- TRIGGER FOR LAST_UPDATED HOOK ---
CREATE OR REPLACE FUNCTION update_change_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.last_updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

--- Inquiry Table ---

CREATE TABLE "app"."inquiry" (
    "id" text PRIMARY KEY,
    "last_updated_at" timestamp DEFAULT now() NOT NULL,
    "postcode" int,
    "startdate" text,
    "whom" text,
    "household" text,
    "carelevel" text,
    "mobility" text,
    "nightcare" text,
    "dementia" text,
    "accomodation" text,
    "contract" text,
    "email" text,
    "firstname" text,
    "lastname" text,
    "telephone" text,
    "desired_contact_window" text
);
CREATE TRIGGER update_inquiry_last_update_timestamp BEFORE UPDATE ON "app"."inquiry" FOR EACH ROW EXECUTE PROCEDURE update_change_timestamp();


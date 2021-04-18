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

--- JWT ---
CREATE SEQUENCE "app".jwt_secret_seq START 1 INCREMENT 1;
CREATE TABLE "app"."jwt_secret" ( 
  "keyid" text PRIMARY KEY NOT NULL DEFAULT nextval('"app".jwt_secret_seq'::text), 
  "secret" text NOT NULL
);
INSERT INTO "app".jwt_secret ("secret") VALUES ('the-ultimate-secret');

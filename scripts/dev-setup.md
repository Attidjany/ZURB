# Local development setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Create a Supabase project**
   - In the Supabase dashboard create a new project with a password.
   - Enable the `PostGIS` extension in the SQL editor.
3. **Bootstrap the database**
   - In the SQL editor run the migration files in order:
     ```sql
     -- 1. Enable PostGIS
     \i sql/001_enable_postgis.sql
     -- 2. Core schema
     \i sql/010_schema.sql
     -- 3. Functions
     \i sql/020_functions.sql
     -- 4. Row level security policies
     \i sql/030_rls.sql
     -- 5. Seed reference data
     \i sql/040_seed.sql
     ```
4. **Configure environment variables**
   - Copy `.env.example` to `.env.local` and set:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project settings.
5. **Run the app**
   ```bash
   pnpm dev
   ```
6. **Run tests**
   ```bash
   pnpm test
   ```
7. **Lint**
   ```bash
   pnpm lint
   ```

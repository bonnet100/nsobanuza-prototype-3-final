# Deploy Nsobanuza on Render

This project is now set up to run as one Render web service plus one managed PostgreSQL database.

## What this gives you

- A public HTTPS URL that works even when your computer is off
- A managed PostgreSQL database in the cloud
- The React client served by the Express backend
- Gemini support for chat without relying on local Ollama

## Before you deploy

- Push this project to GitHub
- Create or have a `GEMINI_API_KEY`
- Rotate any API keys that have ever been stored in local `.env` files before pushing the repo

## Deploy steps

1. Sign in to Render and create a new Blueprint deployment.
2. Connect the GitHub repository for this project.
3. Render will detect the `render.yaml` file in the repo root.
4. During setup, provide values for:
   - `ADMIN_PASSWORD`
   - `GEMINI_API_KEY`
5. Choose an always-on paid web service plan and a managed PostgreSQL plan.
6. Finish deployment and wait for the first build to complete.

## After deploy

- Open the generated Render URL
- Sign in as `admin`
- Go to the admin platform controls page
- Set AI provider to `Gemini` or leave it on `Auto`
- Confirm the chat status shows Gemini live

## Notes

- The backend auto-initializes the database schema and seeds demo accounts/content on first start.
- For production, do not keep real secrets inside tracked `.env` files.

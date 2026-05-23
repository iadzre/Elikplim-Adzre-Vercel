#!/usr/bin/env bash
# Copy VITE_SUPABASE_* from .env.local to all Vercel environments (Preview + Development).
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local — copy from .env.example and fill Supabase credentials."
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env.local
set +a

for var in VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY; do
  if [[ -z "${!var:-}" ]]; then
    echo "Empty $var in .env.local"
    exit 1
  fi
done

add_env() {
  local name="$1"
  local env_name="$2"
  local value="$3"
  npx vercel env add "$name" "$env_name" --value "$value" --yes --force
}

for env in preview development production; do
  echo "Setting VITE_SUPABASE_URL → $env"
  add_env VITE_SUPABASE_URL "$env" "$VITE_SUPABASE_URL"
  echo "Setting VITE_SUPABASE_ANON_KEY → $env"
  add_env VITE_SUPABASE_ANON_KEY "$env" "$VITE_SUPABASE_ANON_KEY"
done

echo "Done. Redeploy: npx vercel --prod"

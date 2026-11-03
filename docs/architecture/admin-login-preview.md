# Admin login smoke preview

This branch tests the removal of the build-time `VITE_ADMIN_ENABLED` gate. The `/admin` route must render `AdminConsole` whether or not a database is connected; authentication and persistence are always verified server-side. The old demo password text is removed. A valid Cloudflare Hyperdrive binding plus `ADMIN_PASSWORD` and `SESSION_SECRET` are required for real login.

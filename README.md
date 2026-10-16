# Germain Pharma

## Firebase configuration on Netlify

Set `FIREBASE_API_KEY` in the Netlify project's environment variable settings,
with the Functions scope and a value for each deployment context that needs Firebase
(including production and deploy previews). Redeploy after changing the setting.
Enter the Firebase web API key directly in Netlify; do not commit it or place it
in build-generated files.

The pages load `/firebase-runtime-config.js` before `firebase-config.js`.
A Netlify Function reads the environment variable at request time and returns
the browser configuration without caching it. If configuration is missing, the
endpoint returns HTTP 503. Use Netlify Dev for local development so the function
route is available.

This removes the key from the current source and deploy assets while keeping
Netlify secrets scanning enabled. Firebase web configuration is still visible
to site visitors at runtime. Protect access using Firebase Security Rules and
appropriate Google API application/API restrictions. A credential that must
remain private must never be used as a Firebase browser key.

The previous key remains in existing Git history. If it was sensitive or
unrestricted, rotate it in Google Cloud, update the Netlify environment variable,
and coordinate any history cleanup with repository collaborators.

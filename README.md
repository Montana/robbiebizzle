# Robbie Bizzle

Robbie Bizzle is a custom Cloudflare Turnstile integration for **HaloArchives**, I've internally named **Robbie Bizzle**.

This setup adds Cloudflare Turnstile bot protection to a HaloArchives form using an explicit frontend widget render and backend token verification.

<img width="500" height="500" alt="robbieb" src="https://github.com/user-attachments/assets/dadb875b-c1a7-4fbd-8004-304d2fd37df3" />


---

## What is Robbie Bizzle?

**Robbie Bizzle** is the custom Turnstile configuration name used by HaloArchives.

It handles:

- Rendering the Cloudflare Turnstile widget
- Capturing the Turnstile response token
- Enabling form submission only after verification
- Sending the token to the backend
- Verifying the token server-side with Cloudflare
- Rejecting failed, expired, or invalid challenges

# Robbie Bizzle Turnstile Security Notes

Security notes and production checklist for the custom Cloudflare Turnstile configuration used by **HaloArchives**, internally named **Robbie Bizzle**.

---

## Important Security Notes

Do **not** trust the frontend alone.

The Cloudflare Turnstile widget only gives you a verification token. Your backend must verify that token with Cloudflare before allowing the protected action to continue.

The frontend can be bypassed, modified, or replayed by a user, so the server must always be the final authority.

---

## Environment Variables

Do **not** expose your Turnstile secret key:

```env
TURNSTILE_SECRET_KEY=your_private_secret_key
```
Nor:

```env
TURNSTILE_SITE_KEY=your_public_site_key
```

This value should only exist on the server. The only key that should be exposed to the browser is the public site key.

---

## Recommended Verification Flow

```txt
User submits form
        ↓
Turnstile generates token
        ↓
Frontend sends token to backend
        ↓
Backend verifies token with Cloudflare
        ↓
Backend accepts or rejects request
```

The backend should reject the request if:

* No Turnstile token is provided
* The token is expired
* The token is invalid
* Cloudflare returns a failed verification response
* The returned action does not match the expected action

---

## Example Success Response

```json
{
  "success": true,
  "message": "Robbie Bizzle approved access.",
  "gamertag": "ExamplePlayer"
}
```

---

## Example Failure Response

```json
{
  "success": false,
  "message": "Robbie Bizzle denied access.",
  "error": "Turnstile failed"
}
```

---

## Customization

The widget style can be changed in:

```txt
robbie-bizzle-turnstile.js
```

Example:

```js
theme: "dark"
```

Common theme options include:

```js
theme: "light"
theme: "dark"
theme: "auto"
```

You can also change the internal action name:

```js
action: "robbie-bizzle"
```

For HaloArchives, keeping the action as:

```js
action: "robbie-bizzle"
```

Robbie B makes logs easier to identify and keeps the verification flow tied to this specific configuration.

---

## Recommended Production Checklist

Before deploying Robbie Bizzle to production:

* Add the real Cloudflare Turnstile site key
* Add the real Cloudflare Turnstile secret key
* Keep `.env` out of Git
* Verify tokens server-side
* Check the `action` value on the backend
* Log failed verification attempts
* Rate limit the protected endpoint
* Serve the app over HTTPS
* Test expired token behavior
* Test failed token behavior
* Test missing token behavior
* Confirm the frontend cannot submit successfully without backend verification

---

## Final Rule

The Turnstile widget is only the first step.

**Robbie Bizzle is not secure unless the backend verifies the token with Cloudflare before granting access.**

# Origin Validation

Origin validation ensures requests originate from trusted frontends.

- Origins are configured in your origin verification file (e.g., urlverificationkey.json).
- The API compares the request origin against allowed origins exactly; mismatches result in a 403.
- Ensure your frontend is served from a stable origin and that the origin value matches exactly.

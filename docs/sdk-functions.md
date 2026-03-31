## fetchtoken()

just add ths to the js code 

```javascript
function fetchtoken() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return token ? decodeURIComponent(token) : null;
}
```

## token validation

> [!CAUTION]
> NEVER DO THE TOKEN VALIDATION ON THE FRONTEND ALWAS DO IT ON THE BACKEND

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/verify-token', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Origin': window.location.origin
  }
})
.then(response => response.json())
.then(data => console.log(data));
```
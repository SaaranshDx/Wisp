<br>
<p align="center">
  <a href="https://wispproject.netlify.app">
    <img src="assets/wisplogowhite.svg" height="96">
    <h3 align="center">Wisp</h3>
  </a>
</p>

<p align="center">
  Auth that doesn't attack
</p>

<p align="center">
  <a href="https://wispproject.netlify.app/docs"><strong>Docs</strong></a> ·
  <a href="https://wispproject.netlify.app/changelog"><strong>Changelog</strong></a> ·
  <a href="https://wispproject.netlify.app/uptime"><strong>Uptime</strong></a>
</p>
<br/>

> [!WARNING]  
> Rightnow there is on-going work on the documentation and the skills


## Wisp

Simple token-based auth with origin checks — simple, secure, no bloat.

## Getting Started

To get started you can read the Wisp [Documentation](https://wispproject.netlify.app/docs)

## AI

We provide our own skills for you to use with you ai agents to impliment wisp within your projects

## Faq

### What is Wisp?
Wisp is a minimal authentication system with token-based auth and origin validation.  
It’s designed to be simple, predictable, and not fight you.

---

### Why not use existing auth services?
You can. Wisp exists for people who want:
- full control
- no vendor lock-in
- a lightweight setup

---

### How does origin validation work?
Each company has a single allowed origin.  
Requests must include an `Origin` header that matches the stored value.

If it doesn’t match → request is rejected.

---

### Do I need a database?
No. wisp provides you your own database

---

### Can I use multiple origins?
Currently, one company = one origin.  
Multi-origin support may come later.

---

### How are tokens handled?
Tokens are issued on login and must be included in protected requests.

Invalid or expired tokens are rejected.

---

### Why is it so minimal?
Because most auth systems are overcomplicated.

Wisp focuses on doing a few things well instead of doing everything badly.

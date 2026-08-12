# Hotel Management System — Workflow Guide

This document explains how the HMS works: who the users are, how they relate, and the day-to-day operational flows.

---

## What this app is

HMS is a **staff portal for hotel operations**. It covers:

- Front desk (reservations, check-in/out, stay payments)
- Housekeeping (room turnover)
- Food & beverage (waiter orders ↔ kitchen)
- Store / inventory
- Manager reporting (income, expenses, occupancy)
- Admin configuration (users, rooms, menu, payroll, settings)

**Guests are not system users.** Guest details live on reservations (name, phone, email). Only hotel staff have login accounts.

---

## Staff roles

Each staff account has **one primary role**. After login, they land in that role’s portal. The **Administrator** can open any portal and call any role’s APIs.

| Role | Portal | Main job |
|------|--------|----------|
| **Administrator** | `/admin` | Users, rooms, menu, settings, payroll, full analytics |
| **Manager** | `/manager` | Income vs expenses, occupancy, F&B performance |
| **Store Manager** | `/store` | Inventory receive / issue / adjust, low-stock alerts |
| **Reception** | `/reception` | Reservations, room assignment, check-in/out, stay payments |
| **Waiter** | `/waiter` | Table & room-service orders, serve, collect F&B payment |
| **Kitchen Staff** | `/kitchen` | Order queue, prep status, menu availability |
| **Housekeeping** | `/housekeeping` | Room cleaning status (dirty → clean) |

### How accounts are created

1. **First account ever** becomes **admin** (setup on the login page). Public sign-up then closes.
2. Later staff are created only by **admin**.
3. Default role for new users is **reception**.
4. Staff who forget their password create a **password-reset request**; admin resolves or dismisses it.

There is **no staff reporting hierarchy** in the data model. Roles relate through **shared operational entities** (rooms, reservations, orders, stock), not manager–employee trees.

---

## How the pieces connect

```
                    ┌─────────────────────┐
                    │   Administrator     │
                    │  users · rooms ·    │
                    │  menu · payroll ·   │
                    │  settings           │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
   ┌──────────┐         ┌──────────┐          ┌──────────┐
   │ Manager  │         │  Store   │          │ Reception│
   │ finance  │         │ inventory│          │  stays   │
   │ overview │         └────┬─────┘          └────┬─────┘
   └──────────┘              │                     │
                             │ issues to           │ rooms / check-in
                             ▼                     ▼
                      Kitchen · HK ·           ┌──────────────┐
                      Reception · …            │ Housekeeping │
                                               │ room status  │
                                               └──────────────┘

   ┌──────────┐         ┌──────────┐
   │  Waiter  │ ──────► │ Kitchen  │
   │  orders  │ ◄────── │  queue   │
   └──────────┘         └──────────┘
```

### Core entities

| Entity | What it is | Links to |
|--------|------------|----------|
| **User** | Staff login (Better Auth) | Role; payroll profile |
| **Room** | Physical room | Type, rate, housekeeping status; reservations |
| **Reservation** | Guest stay | Guest info, optional room, stay + payment status |
| **Order** | F&B ticket | Menu lines; table # or room # as location text |
| **MenuItem** | Sellable food/drink | Used by waiter/kitchen; availability flag |
| **StoreItem / StockMovement** | Inventory | Receive, issue (to a department), adjust |
| **Expense** | Operating cost | Logged by manager/admin; also created by payroll pay |
| **PayrollProfile / PayrollRecord** | Staff salary | Tied to a user; paying a month creates an expense |
| **HotelSettings** | Hotel name / branding | Shared across the app |

**Note:** F&B orders are **not** hard-linked to reservations. Room service uses a free-text location (e.g. room number). Inventory is **manual**—cooking an order does not auto-decrement stock.

---

## Status flows

### Guest stay (reservation)

```
reserved ──► checked_in ──► checked_out
    │
    └──► cancelled
```

- **Check-in** only from `reserved` (assigned room must be **clean** and available for the dates).
- **Checkout** only from `checked_in` → room becomes **dirty**.
- **Cancel** only while still `reserved`.
- Stay payment is derived: `unpaid` | `partial` | `paid`.

### Room housekeeping

```
dirty ──────► in_progress ──► clean
inspect ────► in_progress ──► clean
```

Checkout sets the room to **dirty**. Reception can check a guest into a room only when it is **clean**.

Room **occupancy** is computed from reservations: `vacant` | `reserved` | `occupied` (not a separate stored field).

### F&B order

```
pending ──► preparing ──► ready ──► served
```

- Kitchen sets `preparing` and `ready`.
- Waiter can advance through the flow and mark **served**, then payment: `unpaid` → `paid` (only after served).

---

## Workflows by role

### 1. Bootstrap & login

1. If no users exist → create the first **admin** from the login/setup screen.
2. Staff sign in with username and password.
3. App redirects to that role’s portal.
4. Forgotten password → pending reset request → admin resolves it.

### 2. Administrator

Typical loop:

1. Create staff accounts and assign roles; ban/unban as needed.
2. Resolve password-reset requests.
3. Configure rooms and menu; set hotel name.
4. Set payroll profiles (salary, pay day); mark months paid.
5. Review property-wide analytics (occupancy, room income, F&B, expenses).

Admin is the **superuser**: full config plus access to other portals’ capabilities.

### 3. Reception — guest stay journey

1. **Create reservation** (guest details, dates, room type, adults, optional room, deposit).
2. **Assign or reassign room** while status is `reserved`.
3. **Update stay payment** as money is collected (except cancelled stays).
4. On arrival: **check in** (room must be clean).
5. On departure: **check out** → room marked dirty for housekeeping.
6. Or **cancel** if still reserved.
7. Use the rooms/stays views and daily income summary for occupied stays.

### 4. Housekeeping — room turnover

1. See rooms filtered by cleaning status.
2. Start work: `dirty` or `inspect` → `in_progress`.
3. Finish: `in_progress` → `clean`.
4. Clean rooms unlock reception check-in.

### 5. Waiter — dining / room service

1. Browse available menu items.
2. Place order: **table** or **room_service**, with location (table or room number).
3. Order starts as `pending` and appears in the kitchen queue.
4. When kitchen marks `ready`, serve the guest and set `served`.
5. Collect payment and mark the order `paid`.
6. Edit line items until the order is served.

### 6. Kitchen

1. Work the queue: `pending` → `preparing` → `ready`.
2. Toggle menu item **availability** (86 items that are out).

### 7. Store Manager

1. Maintain the inventory catalog (SKU, category, reorder level, unit cost).
2. **Receive** stock into the store.
3. **Issue** stock to departments (kitchen, housekeeping, reception, etc.).
4. **Adjust** balances when needed.
5. Watch low-stock alerts and movement KPIs.

Issuing stock is a **logical handoff** to a department; it does not auto-consume when orders are cooked.

### 8. Manager

1. Review analytics by day / week / month: room income, F&B income, expenses, profit.
2. Log or delete operating expenses.
3. Inspect room board and F&B performance (mostly read/report oriented vs front-line writes).

---

## Cross-role handoffs

These are the main collaboration paths between roles:

| From → To | What happens |
|-----------|----------------|
| **Reception → Housekeeping** | Checkout sets room to `dirty`. |
| **Housekeeping → Reception** | Room set to `clean` so check-in is allowed. |
| **Waiter → Kitchen** | New `pending` order enters the kitchen queue. |
| **Kitchen → Waiter** | Order marked `ready` for serving. |
| **Waiter → revenue** | After `served`, payment is collected; F&B income shows for manager/admin. |
| **Store → departments** | Stock issued to kitchen, housekeeping, reception, etc. |
| **Admin → everyone** | Creates users, configures the hotel, manages payroll; can use any portal. |
| **Manager ↔ Admin** | Shared financial visibility; both can work with expenses / income views. |

### End-to-end guest day (rooms)

```
Reception books stay
        │
        ▼
Housekeeping keeps room clean
        │
        ▼
Reception checks guest in
        │
        ▼
(optional) Waiter / Kitchen for room service
        │
        ▼
Reception checks out → room dirty
        │
        ▼
Housekeeping cleans → room clean again
```

### End-to-end F&B ticket

```
Waiter places order (pending)
        │
        ▼
Kitchen prepares → ready
        │
        ▼
Waiter serves → collects payment
        │
        ▼
Manager / Admin see F&B revenue
```

---

## Permissions summary

- Access is **role-scoped**: each portal talks to its own API mount (`/api/reception`, `/api/kitchen`, …).
- Frontend routes are guarded so only the matching role (or admin) can open them.
- Permissions are **coarse** (whole portal per role), not fine-grained per button.
- Admin bypasses role checks on the API and can open any staff portal in the UI.

---

## Quick reference — who does what

| Need | Who |
|------|-----|
| Add a staff login | Admin |
| Change hotel name / rooms / menu catalog | Admin |
| Book or check in a guest | Reception |
| Clean a room after checkout | Housekeeping |
| Take a food order | Waiter |
| Cook / mark order ready | Kitchen |
| Receive or issue inventory | Store |
| Review profit for the week | Manager (or Admin) |
| Pay staff salaries | Admin (payroll) |

---

*This guide reflects the current HMS codebase (React frontend + Express/MongoDB backend with Better Auth).*

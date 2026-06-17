# Ritika's Tech Hub 🎓💻

Welcome to **Ritika's Tech Hub**, a robust, full-stack learning management and cohort administration portal designed for modern educational groups ranging from **Class V to XII** up to higher academic courses (**B.TECH, BCA, CST, BSC, and more**). 

The platform features a highly dynamic student workspace paired with a high-fidelity admin dashboard, secured with OTP verification, and designed with a **Dual-Storage local-to-cloud architecture** that seamlessly migrates your local data to MongoDB Atlas upon connection!

---

## 🚀 Live Environment Links
*   **Development Preview:** [Vite Dev Mode](https://ais-dev-tlgbfdgtz4jchmfqjoks3v-698569459700.asia-southeast1.run.app)
*   **Production Build:** [Shared Portal](https://ais-pre-tlgbfdgtz4jchmfqjoks3v-698569459700.asia-southeast1.run.app)

---

## ✨ Features Highlight

### 1. 🧑‍🎓 Student Workspace
*   **Targeted Learning Trackers:** Automatically pulls class-specific topic updates and study progress percentages determined by your exact Batch and Class.
*   **Interactive Homework & Announcements:** Read tailored notifications, deadlines, and dynamic educational material broadcasted by the admin.
*   **Academic Verification:** Upload academic screenshots, check your core batch timelines, and submit updates.
*   **Grievance Box (Complaints):** Directly lodge feedback, suggestions, or concerns to the administrative desk anonymously or named.

### 2. 👑 Powerful Admin Control Room
*   **Surgical Class & Batch Updates:** Select a target cohort (e.g. *Class VIII / B.TECH* or *Class XII / BSC*) to customize what they are studying **now** and track their syllabi progress percentage.
*   **Central Announcement Publisher:** Create and dispatch real-time course updates, reminders, or homework sheets.
*   **Interactive Student roster:** Easily view registered students, filter by active courses/timings, and review progress.
*   **Grievance Inbox:** Review and process complaints raised by students directly from the dashboard.

### 3. 🛡️ Authentication Architecture
*   Secure signup workflow with custom input verification, including specialized class selection ("Class V-XII") and higher academic streams ("B.TECH, BCA, CST, BSC").
*   Custom simulated/live OTP verification pipeline representing high-security enterprise sign-in.

### 4. 💾 Dual-Storage Engine (Hybrid MongoDB + Local Backup)
*   **Zero-Config Local Mode:** Out-of-the-box local data layer managed in `db-store.json` – perfect for rapid offline prototypes and instant deployment.
*   **Seamless Handshake with MongoDB Atlas:** Simply supply a `MONGODB_URI` environment secret.
*   **Proactive Auto-Migration:** The startup sequence automatically checks your local backup (`db-store.json`) and migrates all existing users, complaints, and announcements to your live cloud cluster seamlessly!

---

## 🛠️ Technology Stack

*   **Frontend:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/)
*   **Animations:** [Motion](https://motion.dev/) (`motion/react`) for elegant card fades and layout shifts.
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Backend:** [Express](https://expressjs.com/) (NodeJS) + [TSX](https://github.com/privatenumber/tsx) (Direct TypeScript runner)
*   **Database ODM:** [Mongoose](https://mongoosejs.com/) for Atlas clusters or custom local JSON-engine as physical database fallback.

---

## ⚙️ Environment Configuration

Define a `.env` file in your root folder (refer to `.env.example`):

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.your_hash.mongodb.net/ritikatech?retryWrites=true&w=majority

# Port Setup (Assumes default container port 3000)
PORT=3000
```

> **Note:** The server auto-detects `MONGODB_URI`. If absent, it runs smoothly using `db-store.json` as a zero-dependency physical store!

---

## 🛫 Running the Application

Follow these steps to spin up the hub locally in your environment:

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server (Backend + Frontend Dev Proxy)
This executes the server using `tsx` and configures hot asset rendering:
```bash
npm run dev
```
Navigate to: **`http://localhost:3000`**

### 3. Compile Production Bundle
To create a bundled, self-contained single-file backend (`dist/server.cjs`) using `esbuild` and build client-side SPA static assets:
```bash
npm run build
```

### 4. Start Production Server
Launch the compiled production app instantly:
```bash
npm run start
```

---

## 📁 Key File Structure

```text
├── server.ts              # Express Backend with Mongo/JSON Dual-Core architecture
├── db-store.json          # Fail-safe local database file
├── src/
│   ├── main.tsx           # Client entry
│   ├── App.tsx            # Main application workspace and views layout
│   ├── index.css          # Tailwind Directives and CSS pairings
├── package.json           # Node script runners and dependencies
└── .env                   # Local Environment Variables
```

---

## 📚 Licensing & Administration
Designed with ❤️ for **Ritika's Tech Hub**. Keep studying, keep building!

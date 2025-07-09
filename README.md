# NUST Lost & Found

An interactive web application for reporting and locating lost or found items across the NUST campus—built with a modern JavaScript frontend, TF‑JS semantic matching, and a simple Node.js backend.

## Project Overview

NUST Lost & Found lets students and staff:

1. Upload reports of lost or found items (with name, CMS ID, location, description, and photo).  
2. Filter and browse all items by campus location and status (Lost vs. Found).  
3. Receive “Did you mean…?” suggestions for mistyped CMS IDs via fuzzy string matching.  
4. Get automatic match alerts when a new report semantically resembles an existing item of opposite status, thanks to TensorFlow’s Universal Sentence Encoder.  
5. Chat with a built‑in assistant for quick FAQs on reporting, item status, contact info, and privacy.

---

## Tech Stack & Dependencies

- **Frontend**  
  - HTML5 · CSS3 (responsive grid + modals) · Vanilla JavaScript  
  - [TensorFlow.js v4.9.0](https://cdn.jsdelivr.net/npm/@tensorflow/tfjs)  
  - [Universal Sentence Encoder](https://cdn.jsdelivr.net/npm/@tensorflow-models/universal-sentence-encoder)  

- **Backend**  
  - Node.js · Express  
  - [Multer](https://github.com/expressjs/multer) for image uploads  

- **Replit config**  
  - `.replit`, `replit.nix` to pin runtime & build  

---

## Installation & Local Setup

1. **Clone the repo**  
   
   git clone https://github.com/YourUserName/nust‑lost‑and‑found.git
   cd nust‑lost‑and‑found


2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the server**

   ```bash
   node server.js
   ```

   The app will be available at `http://localhost:3000/`.

> Note: On Replit, the built‑in runner will automatically use `server.js` as your entrypoint.

---

## Features Breakdown

### 1. Reporting Form (`public/index.html`)

* Fields: Name, CMS ID, Location dropdown, Status (Lost/Found), Description, Photo upload
* CMS ID Validation:

  * Exact matches pass
  * Near‑matches (≥ 80% similarity) trigger “Did you mean…?” prompts

### 2. Dynamic Item List & Filters

* Real‑time rendering of all reports in a responsive grid
* Filter controls let users show only specific locations or statuses

### 3. Semantic Match Alert

* Uses the Universal Sentence Encoder to compute cosine similarity between item descriptions
* Alerts users in the browser if their new report closely matches (≥ 70%) an existing report of the opposite status

### 4. Chatbot Assistant

* Floating chat icon opens a simple Q\&A interface
* Keyword‑driven responses for greetings, reporting help, status checks, contact info, and privacy assurances

### 5. Help Modal

* Click the top‑right Help button for location‑specific contact numbers

### 6. File Upload API (`/upload`)

* Implemented in **server.js** with Multer
* Saves images to `uploads/` with timestamped filenames and returns JSON success messages

---

## Repository Structure

```
/
├─ .gitattributes
├─ .gitignore
├─ .replit
├─ replit.nix
├─ package.json
├─ package-lock.json
├─ server.js
├─ README.md
├─ public/
│  ├─ index.html
│  ├─ styles.css
│  └─ scripts.js
├─ uploads/                # (auto‑created) user‑uploaded images
└─ details/
   ├─ demo.mp4
   └─ presentation.pptx
```
Thank you for checking out NUST Lost & Found. 





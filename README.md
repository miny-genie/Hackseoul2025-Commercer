# Hackseoul2025-Commercer.

## Project Overview
We are an all-in-one shopping information platform that covers both domestic and international online stores.

With our service, you can add products from any shopping platform to a single, unified shopping cart.
Our AI-based recommendation algorithm then suggests similar items that match your interests.

We collect data from various platforms and rank products using personalized machine learning models and custom performance metrics.

When you purchase items through the links provided on our platform, it helps us grow and continue improving our service!

---

## Pitch Deck
[Pitch Deck in pdf](https://github.com/miny-genie/Hackseoul2025-Commercer/blob/main/2025Hackseoul-Commercer.pdf)

---

## DataFlow
<img width="1080" height="1920" alt="image" src="https://github.com/user-attachments/assets/adb136a0-17d3-4916-82d5-f870ccc1c501" />

---

## How to run(Demo)

### 1. Project Clone
```bash
git clone https://github.com/your-repo-name.git
cd your-repo-name
```
### 2. Register Extension with Developer Mode
```
1. Go to chrome://extensions/ in your browser.
2. Turn on Developer mode in the top right corner.
3. Click Load unpacked 'extension' folder.
4. Select the folder that contains your extension (the one with the manifest.json file).
```
### 3. Run
```
Open extension and enjoy fun!
```
---

## Tech Stack

### **Frontend(Chrome Extension)**
- **HTML**
- **CSS**
- **JavaScript**
### **Backend**
- **Node.js**
- **Keycloak(Authentication & Authorization)**
### **AI / ML**
- **XGBoost**
- **Gemini API**
### **Database**
- **PostgreSQL**
- **DynamoDB**  
### **Infrastructure**
- **AWS EC2**
- **AWS Lambda**

### Containerization & Deployment
> As the platform scales, we plan to introduce a full **DevOps** workflow for continuous integration, deployment, and monitoring.
- **Docker**
- **Docker Compose**

---

## AI / ML
### **Phase 1 — Rule-Based System (Cold Start Stage)**
- **Situation:** The platform is in its early stage with few or no users.  
- **Approach:** Simple **rule-based logic** is used to handle the cold-start problem.  
- **Method:**  
  - Predefined rules for item similarity (category, price range, brand, etc.)  
  - Keyword and tag-based filtering  
  - Static ranking using metadata  
- **Goal:** Provide basic yet reliable recommendations without requiring user data.


### **Phase 2 — Machine Learning Ensemble (Growth Stage)**
- **Situation:** The platform gains more users, and behavioral data begins to accumulate.  
- **Approach:** Transition to **machine learning models combined through ensemble techniques**.  
- **Method:**  
  - Multiple ML algorithms (e.g., Random Forest, XGBoost, LightGBM) used together  
  - Dynamic weighting based on user behavior (adding/removing from cart, clicks, dwell time)  
  - Personalization weights applied per user  
- **Goal:** Deliver more adaptive and behavior-aware recommendations as data diversity increases.


### **Phase 3 — Deep Learning Personalization (Mature Stage)**
- **Situation:** The platform reaches large-scale traffic and diverse product interactions.  
- **Approach:** Move toward **deep learning-based personalization** using accumulated user and product data.  
- **Method:**  
  - Neural network-based ranking and embedding models  
  - Historical search and interaction data stored in a **weighted database**  
  - Contextual understanding and real-time personalization using deep feature extraction  
- **Goal:** Achieve highly intelligent, context-aware recommendations for each user.

---

## Future Plans
- **Enhanced Recommendation Engine** — Improve our AI algorithms for more accurate and personalized product suggestions.   
- **Global Data Integration** — Expand data coverage to include more international shopping platforms.  
- **Smart Price Comparison** — Provide dynamic price comparison features across multiple regions and currencies.  
- **Mobile App Launch** — Develop a mobile-friendly version for seamless shopping experiences anywhere.  
- **User Insights Dashboard** — Offer personalized dashboards showing purchase patterns and savings reports.
- **Blockchain-Powered Global Payments** — Enable seamless one-time checkout with full integration of international currencies through blockchain technology.
- **B2B Partnerships Welcome** — We are always open to collaborations with shopping platforms worldwide.  

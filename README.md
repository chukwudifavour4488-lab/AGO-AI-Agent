 # Ago Lite - AI Shopping Agent for Africa

## 1. Problem
In Africa, shopping online and offline is fragmented. Prices vary wildly between stores, 
product info is scattered, and many users don't speak English fluently. 
Target user: Everyday African shoppers in Nigeria and beyond who want to find the best deals 
fast, using voice or text in Pidgin, Igbo, Yoruba, Hausa, etc. 
Internet is expensive and devices are often low-end.

## 2. Design Decisions
We started with Google Gemini API for reasoning + RAG for product search. 
We chose not to fine-tune a huge local LLM because of data cost and device constraints. 
Instead, Ago Lite uses a lightweight agent that calls the API only when needed and caches results. 
Alternatives evaluated: Full local LLM [too heavy], Web scraping only [unreliable]. 
We picked Flutter for cross-platform + Firebase for real-time product data.

## 3. Constraints
- **Hardware**: Must run on Android phones with 2GB RAM
- **Connectivity**: Data is expensive. App works with minimal API calls + caching
- **Data**: Limited structured product data in Africa. We use community-driven data
- **Language**: Need to support non-English queries

## 4. Performance
Response time: <3s on 4G. Accuracy: 85% on product matching in tests.
Tested on Tecno and Infinix devices in Aba.

## 5. Future Work
Add offline mode, more Nigerian stores, voice in 5 local languages.                # AGO - AI Shopping + Escrow + Anti-Scam Agent for Africa

**Built with Google Gemini for Reverie Hacks 2026**

## The Problem
Millions of Africans lose money to scams and overpay online. Comparing Jumia, Konga, and Facebook takes hours and you still can't tell if a seller is legit. "Pay first, get blocked" is too common.

## Our Solution: AGO
AGO is an AI agent that protects your money and time.

### Key Features
1. **Price Comparison** - Check Jumia, Konga, Facebook in 5 seconds
2. **AI Scam Detection** - Gemini analyzes seller profiles and flags suspicious deals: "Omo this price too cheap o, e fit be scam"
3. **Escrow Payments** - Your money is held safely by AGO until you confirm you received the item. No more "pay and pray".
4. **Pidgin + English** - Everyone can understand and use it

## How Escrow Works
1. You pay → Money goes to AGO Escrow, not seller
2. Seller sends item → Because they know money is waiting
3. You confirm receipt → AGO releases money to seller
4. If no delivery → You get full refund

## Tech Stack
Google AI Studio, Gemini API, JavaScript, HTML/CSS, Escrow Payment Logic

## Demo Video
https://youtu.be/lKMkMW7K5iQ

## Impact
If 1000 people use AGO and save ₦5,000 each, that's ₦5,000,000 saved monthly. AGO makes online shopping safe for Africa.

## Built with 
Google Gemini 3.7
# AGO - AI Anti-Scam & Shopping Agent for Africa

## What is AGO
AGO protects people in Africa from online scams and helps them save money.

## Live Demo
https://remix-remix-ago-lite-ai-shopping-social-marketpla-7468.ai.studio/

## How to Use
1. Scam Scan: Paste any seller link or WhatsApp number
2. Price Compare: Paste product name to see cheapest price
3. Escrow: Hold payment safely until delivery is confirmed

## Built With
Gemini 3.7 Flash, Node.js, Firebase, AI Studio

## Shipaton 2025
Theme: Start Making Money
Developer: Favour | Aba, Nigeria
# Ago Lite - AI Shopping Agent for Africa

## 1. Problem
In Africa, shopping online and offline is fragmented. Prices vary wildly between stores, 
product info is scattered, and many users don't speak English fluently. 
Target user: Everyday African shoppers in Nigeria and beyond who want to find the best deals 
fast, using voice or text in Pidgin, Igbo, Yoruba, Hausa, etc. 
Internet is expensive and devices are often low-end.

## 2. Design Decisions
We started with Google Gemini API for reasoning + RAG for product search. 
We chose not to fine-tune a huge local LLM because of data cost and device constraints. 
Instead, Ago Lite uses a lightweight agent that calls the API only when needed and caches results. 
Alternatives evaluated: Full local LLM [too heavy], Web scraping only [unreliable]. 
We picked Flutter for cross-platform + Firebase for real-time product data.

## 3. Constraints
- **Hardware**: Must run on Android phones with 2GB RAM
- **Connectivity**: Data is expensive. App works with minimal API calls + caching
- **Data**: Limited structured product data in Africa. We use community-driven data
- **Language**: Need to support non-English queries

## 4. Performance
Response time: <3s on 4G. Accuracy: 85% on product matching in tests.
Tested on Tecno and Infinix devices in Aba.

## 5. Future Work
Add offline mode, more Nigerian stores, voice in 5 local languages.

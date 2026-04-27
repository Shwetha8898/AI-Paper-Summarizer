# AI-Paper-Summarizer
An intelligent web application that allows users to upload research papers (PDFs) and automatically generates structured, easy-to-understand summaries. The system processes documents page-by-page and extracts key insights using Natural Language Processing (NLP) techniques and Large Language Models (LLMs).

---

## 📌 Overview

Reading and understanding long research papers is time-consuming. This project solves that problem by:

- Extracting content from PDFs page-by-page
- Generating concise summaries
- Presenting structured insights for quick understanding

It supports both:
- 🤖 AI-based summarization (OpenAI)
- 📊 Offline summarization (LSA algorithm)

---

## 🚀 Features

### 📄 Document Processing
- Upload PDF research papers
- Page-by-page text extraction using PyMuPDF
- Handles multi-page documents efficiently

### 🧠 Smart Summarization
- OpenAI-powered contextual summarization *(if API key provided)*
- Offline extractive summarization using Sumy (LSA)
- Generates:
  - Headings
  - Bullet-point insights
  - Structured summaries

### 🔐 Authentication System
- User registration & login
- Token-based authentication (Django REST Framework)
- Secure access to user-specific data

### 🧾 History Management
- Stores previously analyzed documents
- View summaries anytime
- Delete history records

### ⚡ Full Stack Integration
- React frontend + Django backend
- REST API communication using Axios
- Real-time document processing

---

## 🏗️ Tech Stack

### 🔹 Frontend
- React.js
- Axios
- CSS

### 🔹 Backend
- Django
- Django REST Framework
- Token Authentication

### 🔹 AI / NLP
- OpenAI (via LangChain)
- Sumy (LSA summarization)
- NLTK (tokenization)
- PyMuPDF (`fitz`) for PDF parsing

---

## ⚙️ How It Works

1. User uploads a PDF document
2. Backend extracts text page-by-page using PyMuPDF
3. Each page is processed:
   - If OpenAI API key is present → AI summarization
   - Else → Extractive summarization (LSA)
4. Structured summaries are generated
5. Results are stored in database
6. User can view summaries in history dashboard


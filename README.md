# Project Setup and Initialization Guide

This document describes the process for setting up and running the project, including installing the required packages and loading the initial data.

---

## 🧰 Prerequisites

Before you begin, make sure you have the following tools installed on your machine:

- [Python 3.10+](https://www.python.org/downloads/)
- [pip](https://pip.pypa.io/en/stable/installation/)
- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/)

---

## ⚙️ Installing Python Packages

In the project root directory, install the required Python dependencies with the following command:

```bash
pip install -r requirements.txt
```

---

## 💻 Installing Frontend Dependencies

Navigate to the frontend directory and install the JavaScript packages using npm:

```bash
cd app/frontend
npm install
```

After installation, return to the project root:

```bash
cd ../../
```

---

## 🚀 Loading Initial Data

To set up the environment and load the necessary data for the project, run the following commands:

```bash
python -m scripts.load_data --mission koi
python -m scripts.load_data --mission toi
```

These commands will configure the initial **KOI** and **TOI** missions datasets in your local environment.

---

## ▶️ Running the Project

Once the environment and data are ready, start the project by running:

```bash
python run.py
```

---

## ✅ Conclusion

After completing all the steps above, your environment will be fully configured and ready to use.

# 📱 Task Management App


## 📂 Project Structure
src/
 ├── components/
 ├── screens/
 ├── context/
 ├── utils/

---

## 📖 Description

**Field Tasks** is an offline-first mobile application built using React Native that allows users to create, manage, and track daily tasks efficiently.

It focuses on:
- Clean architecture
- Smooth user experience
- Reliable local data persistence (works without internet)

---

## ✨ Features

### 📝 Task Management
- Create, edit, delete tasks
- Fields:
  - Title (required)
  - Description
  - Priority (Low / Medium / High)
  - Due Date
  - Tags
- Mark task as complete / reopen

### 📅 Task Grouping
- Today
- Upcoming
- Overdue

---

## 🔍 Search & Filter
- Search by title and description
- Filter by:
  - Priority
  - Status

---

## 📊 Activity Log
Tracks user actions:
- Create
- Update
- Complete
- Delete

---

## ⚙️ Settings
- 🌙 Dark / Light theme toggle
- ℹ️ About screen with app info

---

## 🛠️ Tech Stack

- React Native
- TypeScript
- React Hooks
- React Navigation
- Context API
- AsyncStorage
- React Native Safe Area Context

---

## 🚀 Getting Started

### 📋 Prerequisites
- Node.js >= 16
- npm or yarn
- Android Studio
- React Native CLI setup

---

### 📦 Installation

```bash
git clone https://github.com/Priyasingh-12/Task-management-System.git
cd Task-management-System
npm install
---

### ▶️ Run the App (Android)

npm run android

---

### 🔧 If build fails (important)
cd android
gradlew clean
cd ..
npx react-native run-android

---

### 📱 Run on Emulator
Open Android Studio
Start an emulator
Then run the app

---

### 📱 Run on Real Device
Enable USB Debugging
Connect phone via USB
Run:
---

![Image Alt](https://github.com/Priyasingh-12/Task-management-System/blob/0918143f2376324a25196f71394fbb128de88d88/pic1.png)

👩‍💻 Author

Priya Singh

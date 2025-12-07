# Academix – Admin Dashboard

Academix is a school management system built using Next.js, Prisma, MySQL, and TailwindCSS.  
This version of the project includes **Admin-only functionality**. Admins can manage Teachers, Students, Classes, Subjects, Lessons, Exams, Events, Announcements, Assignments, and Results.

---

## 🚀 Features (Admin Only)

### 🔐 Authentication
- Admin login using username & password
- JWT authentication (stored in HTTP-only cookies)

### 🧑‍🏫 Teacher Management
- Create, edit, delete teachers  
- Assign subjects to teachers  

### 🎓 Student Management
- Add & update student details  
- Select grade, class, parent  
- Supports attendance and results linking

### 📚 Subject Management
- Add, update, delete subjects  
- Auto-load teacher list

### 🏫 Class Management
- Create classes  
- Assign supervisor teacher  
- Automatically loads grade list

### 📘 Lessons
- Admin can:
  - Add lesson name  
  - Choose subject  
  - Choose class  
  - Choose teacher  
  - Select day  
  - Select start/end time  
- Search by subject/class/teacher  
- Sort by start time (newest/oldest)

### 📝 Exams
- Create, update, delete exams  
- Linked to lessons  
- Search by subject/title  
- Sorting & filtering support (title/class/teacher/date)

### 📄 Assignments
- Add assignments linked to lessons  
- Auto-load Subjects → Lessons mapping

### 🧪 Results
- CRUD for exam & assignment results  
- Searchable  
- Displays student + teacher + class

### 📅 Events
- Admin can schedule events  
- Class-specific or global

### 📢 Announcements
- Add announcements  
- Optional class-specific announcements

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router), React |
| Backend | Next.js API routes |
| UI | Tailwind CSS |
| ORM | Prisma |
| Database | MySQL |
| Auth | JWT |
| State | React Hook Form + Zod |

---

## 📂 Project Structure


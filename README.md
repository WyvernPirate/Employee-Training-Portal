#   Employee Training Portal for Automotive Spare Parts Company

##   Project Description

This web application serves as a training portal for an automotive spare parts company, enabling educators to train employees on various topics. The portal supports video uploads, automatic assessment grading, quiz generation, and employee certification.  It features both customer and admin (educator) dashboards and uses a NoSQL database.

###   Key Features:

* **User Roles:**
    * **Admin (Educator):**
        * Upload videos and training content and assign department. 
        * Create and assign assessments and quizzes. 
        * Generate and issue certificates to employees upon completion. 
        * Categorize and manage employee data (e.g., department, training progress). 
        * View reports on employee progress and completed certifications. 
    * **Employee:**
        * Browse available training content (videos) by department. 
        * Complete assessments and quizzes. 
        * Download or view certificates upon successful completion. 
        * Give rating of videos (0-5) 
        * Track their own progress and certifications. 
* **Dashboard Functionality:**
    * **Admin Dashboard:**
        * Overview of employee training progress. 
        * Ability to upload training videos and materials. 
        * Create quizzes and assessments (including random quizzes). 
        * Monitor employees' completion rates and grades. 
    * **Employee Dashboard:**
        * Access to the list of available training videos. 
        * Option to take quizzes and assessments. 
        * View certification status upon completion of a training module. 
        * Personal progress tracking (e.g., completion percentage, certificates earned). 
* **Training Content Management:**
    * Educators can upload video files that employees will view as part of their training. 
    * Educators can create assessments based on the videos, which will be automatically graded upon completion by the employee. 
    * Quizzes should be random in nature, with a set number of questions chosen from a pool, ensuring different quizzes for different employees.
* **Certificates and Grading:**
    * Upon successful completion of videos, employees should receive certificates, either downloadable or viewable within the application.
    * Certificates should include the employee's name, training module completed, and the date of completion. 
    * Grading will be done automatically based on the correct answers provided during assessments. 
* **Employee Data Management:**
    * Employee data should be categorized based on certain parameters (e.g., department, training progress). 
    * The admin should be able to filter and search for employees based on these categories. 
    * Employee profiles should include personal information (e.g., name, position) and training progress. 

##   Getting Started

1.  Clone the repository: `git clone <repository_url>`
2.  Install dependencies: `npm install`
                          `npm install -D vite`
3.  Set up the database: TBD
4.  Run the application: `npm start`,

##   Technologies Used

* Frontend:  React
* Backend:  Next.js
* Database:  FireBase
* Other:  N/A

##   Team Members

* Phemelo Moloi
* Omolemo
* Edward
* Lame Moilwa
* Lusindo

##   Project Timeline

* Week 9: Initial project setup, role definitions, design phase (wireframes, basic architecture). 
* Week 10: Development of front-end UI, database schema design, and basic functionality (video uploads, dashboard creation). 
* Week 11: Development of quiz and assessment functionality, automatic grading, employee categorization. 
* Week 12: Testing, bug fixing, finalization, and preparation for presentation and submission. 
* Week 13: Presentation 

##   Contribution Guidelines

1.  Create a feature branch for each new feature.
2.  Follow the code style guidelines.
3.  Write clear and concise commit messages.
4.  Submit pull requests for code reviews.

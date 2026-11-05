Cumulus – Cloud File Manager

Cumulus is a simple website where you can upload, retrieve and manage files on the cloud. Files are stored on Amazon S3, and the website is hosted online with Render.

Live demo: paste your Render link here

Cumulus screenshot

What you can do
Upload one or many files (drag and drop or choose files)
See all stored files with size and upload date
Search files by name
Download any file through a secure link that expires in 5 minutes
Rename and delete files
How it works
Browser (HTML, CSS, JavaScript)
        |
        v
Node.js + Express server  (hosted on Render)
        |
        v
Amazon S3 bucket  (files are stored here)
The user picks a file in the browser.
The browser sends it to the Express server.
The server saves it in a private S3 bucket.
To download, the server creates a temporary secure link, and the browser opens it.

The bucket stays private. Nobody can open a file without a link created by the server.

Technologies
Part	Technology
Frontend	HTML, CSS, JavaScript
Backend	Node.js, Express, Multer
Cloud storage	AWS S3
Hosting	Render
Version control	Git and GitHub
Project structure
cumulus/
├── public/
│   └── index.html    The website (user interface)
├── server.js         Backend: upload, list, download, rename, delete
├── storage.js        Talks to S3 (or a local folder for testing)
├── package.json      Packages the project needs
├── .env.example      Template for your secret settings
└── .gitignore        Keeps secrets out of GitHub
Run it on your computer
Install Node.js (LTS version).
Download this project and open the folder in VS Code.
Open the terminal and run:
   npm install
   npm start
Open http://localhost:3000

With no settings, files are saved in a local uploads folder (test mode).

Connect it to AWS S3
Create an S3 bucket in the AWS console and keep "Block all public access" turned on.
Create an IAM user with permission to list, read, write and delete in that bucket only.
Create an access key for that user.
Copy .env.example to .env and fill in your values:
   S3_BUCKET=your-bucket-name
   AWS_REGION=your-bucket-region
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
Restart with npm start. The sidebar now says "Saved on AWS S3 cloud".
Deploy online with Render
Push this project to GitHub.
On render.com, create a Web Service from your repository.
Build command: npm install. Start command: npm start.
Add the four environment variables from step 4 above.
Deploy. Render gives you a public link.
Security notes
Never upload your .env file to GitHub. It is already listed in .gitignore.
Give the IAM user access to this one bucket only.
Uploaded files are limited to 25 MB each, 10 files at a time.
Author

Made by Sanika Dalvi as a cloud computing project.

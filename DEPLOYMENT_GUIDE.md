# Deployment Guide for GoForHost (cPanel)

This guide walks you through hosting your project on GoForHost using the prepared `deployment` folder.

## 1. Prepare Files
I have created a `deployment` folder in your project directory. This folder contains:
*   The backend server code.
*   The built frontend code (in `client/dist`).
*   The `package.json` file.

**Action:**
1.  Go to the `deployment` folder in your file explorer.
2.  Select all files and folders inside it (or just the `deployment` folder itself if you handle extraction carefully).
3.  **Create a ZIP file** of these contents.

## 2. cPanel Database Setup
1.  Log in to your cPanel account.
2.  Navigate to **MySQL Databases**.
3.  **Create a New Database**: Enter a name (e.g., `yashodabhawan_db`).
4.  **Create a User**: Enter a username and password. **Note these credentials down.**
5.  **Add User to Database**: Scroll down to "Add User to Database", select the user and database you just created, and click "Add".
6.  Select **ALL PRIVILEGES** and confirm.

## 3. Upload Files
1.  Navigate to **File Manager** in cPanel.
2.  Go to `public_html`.
    *   *Note: If you have other files there, you might want to back them up or delete them.*
3.  **Upload** the ZIP file you created in Step 1.
4.  **Extract** the ZIP file.
    *   Ensure that `server.js` and `package.json` are directly in `public_html` (or your app directory), not inside a subfolder like `deployment`. If they are in a subfolder, select all files inside that subfolder and use "Move" to move them to `public_html`.

## 4. Setup Node.js App
1.  In cPanel, find **Setup Node.js App**.
2.  Click **Create Application**.
3.  **Node.js Version**: Select **18.x** or **20.x**.
4.  **Application Mode**: Select **Production**.
5.  **Application Root**: Enter `public_html` (or the folder where you uploaded files).
6.  **Application URL**: Select `yashodabhawan.in`.
7.  **Application Startup File**: Enter `server.js`.
8.  Click **Create**.

## 5. Install Dependencies
1.  Once the app is created, you will see it in the list (or stay on the detail page).
2.  Click the **Run NPM Install** button. This will install all necessary libraries.
    *   *This may take a few minutes.*

## 6. Configure Environment Variables
On the Node.js App configuration page, find the **Environment Variables** section. Add the following variables (click "Add Variable"):

| Name | Value | Description |
|------|-------|-------------|
| `NODE_ENV` | `production` | Set to production mode |
| `DB_NAME` | *(Your Database Name)* | From Step 2 |
| `DB_USER` | *(Your Database User)* | From Step 2 |
| `DB_PASSWORD` | *(Your Database Password)* | From Step 2 |
| `DB_HOST` | `localhost` | Usually localhost |
| `DB_DIALECT` | `mysql` | Using MySQL |
| `JWT_SECRET` | *(Random Secret String)* | For security |
| `CLOUDINARY_CLOUD_NAME` | *(Your Cloudinary Name)* | If using Cloudinary |
| `CLOUDINARY_API_KEY` | *(Your Cloudinary Key)* | If using Cloudinary |
| `CLOUDINARY_API_SECRET` | *(Your Cloudinary Secret)* | If using Cloudinary |
| `EMAIL_USER` | *(Your Gmail Addr)* | For emails (optional) |
| `EMAIL_PASS` | *(Your App Password)* | For emails (optional) |
| `CLIENT_URL` | `https://yashodabhawan.in` | Your website URL |

## 7. Start the App
1.  Click **Restart Application**.
2.  Visit `https://yashodabhawan.in`. You should see your site!

## Troubleshooting
*   **500 Error?** Check the `stderr.log` file in File Manager for errors.
*   **Database Error?** Double-check your DB credentials in the Environment Variables.
*   **White Screen?** Check the browser console (`F12`) for errors.

# ShortsIntelligence

## Project Overview

ShortsIntelligence is an application designed to automatically create short videos from lengthy recordings. Built with Django and React, the application provides an intuitive interface for processing and analyzing long videos. The main goal of this project is to streamline the creation of clips, allowing users to quickly generate and share concise versions of videos optimized for social media.

## Requirements

To run ShortsIntelligence, ensure the following dependencies are installed with the specified versions (that I use and test App):
- Python 3.12.7
- Django 5.1.2
- Node.js 20.16.0
- npm 10.8.1
- pnpm 9.9.0
- React 18.3.1
- ffmpeg 7.0.2

## Installation

Choose an installation option based on your environment.

### For Development

1. **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd ShortsIntelligence
    ```

2. **Backend Setup (Django)**:
    - Create and activate a virtual environment:
      ```bash
      python3 -m venv venv
      source venv/bin/activate  # On Windows use `./venv\Scripts\activate`
      ```
    - Install Python dependencies:
      ```bash
      pip install -r requirements.txt
      ```
    - Run database migrations:
      ```bash
      python3 manage.py migrate
      ```

    - Or you can use script
      ```bash
      chmod x+ run.sh # On Windows use '.\run.ps1'
      ```

3. **Frontend Setup (React)**:
    - Navigate to the frontend directory:
      ```bash
      cd frontend
      ```
    - Install Node dependencies:
      ```bash
      npm install
      ```

4. **Starting the Application**:
    - In the backend root directory, start the Django server:
      ```bash
      python manage.py runserver
      ```
    - In a new terminal, start the React development server:
      ```bash
      npm dev
      ```

5. **Access the Application**:
   - Open your browser and navigate to `http://localhost:3000` for the frontend and `http://localhost:8000` for the backend.

### For Production

1. **Set Environment Variables**:
   Configure environment variables for production settings, including database configurations, secret keys, etc.

2. **Build the Frontend**:
    ```bash
    cd frontend
    npm run build
    ```

3. **Serve the Frontend**:
   Use a web server like Nginx to serve the built frontend from the `frontend/build` directory.

4. **Run Django in Production Mode**:
    ```bash
    python manage.py collectstatic --noinput
    python manage.py runserver 0.0.0.0:8000
    ```

5. **Additional Production Steps**:
   - Use `gunicorn` or another WSGI server for Django in production.
   - Configure a reverse proxy like Nginx for production stability.

## Usage Guide

### Creating a New Project

1. **Add a New AI Project**:
    - In the dashboard, go to “New Project.”
    - Provide a title and description for your project.

2. **Upload a Video**:
    - Upload a video file you want to convert into shorter clips.

3. **Trim the Video**:
    - Select the starting and ending points to define the clip length.

4. **Apply Effects**:
    - Customize your video by adding effects, text overlays, audio settings, and choosing resolution settings.

5. **Export**:
    - Export your project to the timeline.
    - Optionally, download the video after export.

### Additional Features

- **Timeline Management**: Arrange clips on the timeline, adjust positions, and manage clip durations.
- **Editing Tools**: Utilize the video editor to fine-tune content, adjust audio, and add transitions.
- **Export Options**: Choose export formats suitable for social media platforms.

This guide should help you set up and start using ShortsIntelligence efficiently, whether for development or production.

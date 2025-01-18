import tempfile
from django.test import TestCase, Client, override_settings
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.test import APIClient
from .models import Video, Project
from .serializers import VideoSerializer, ProjectSerializer


import os

video_path = os.path.join(default_storage.location, "temp", "test_video.mp4")


class VideoModelTest(TestCase):
    def setUp(self):
        self.video = Video.objects.create(
            title="Test Video",
            description="A test video description",
            file="videos/test.mp4",
        )

    def test_video_creation(self):
        self.assertEqual(self.video.title, "Test Video")
        self.assertEqual(self.video.description, "A test video description")
        self.assertTrue(self.video.created_at)


class ProjectModelTest(TestCase):
    def setUp(self):
        self.project = Project.objects.create(
            title="Test Project", description="A test project description"
        )

    def test_project_creation(self):
        self.assertEqual(self.project.title, "Test Project")
        self.assertEqual(self.project.description, "A test project description")
        self.assertTrue(self.project.created_at)


class VideoSerializerTest(TestCase):
    def setUp(self):
        self.video_data = {
            "title": "Test Video",
            "description": "A test video description",
            "file": SimpleUploadedFile(
                "test.mp4", b"dummy content", content_type="video/mp4"
            ),
        }
        self.serializer = VideoSerializer(data=self.video_data)

    def test_video_serializer_validation(self):
        self.assertTrue(self.serializer.is_valid())
        self.assertEqual(self.serializer.validated_data["title"], "Test Video")


class ProjectSerializerTest(TestCase):
    def setUp(self):
        self.project_data = {
            "title": "Test Project",
            "description": "A test project description",
        }
        self.serializer = ProjectSerializer(data=self.project_data)

    def test_project_serializer_validation(self):
        self.assertTrue(self.serializer.is_valid())
        self.assertEqual(self.serializer.validated_data["title"], "Test Project")


class VideoViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.video = Video.objects.create(
            title="Test Video", description="Test Description", file="videos/test.mp4"
        )

    @override_settings(MEDIA_ROOT=tempfile.gettempdir())
    def test_get_video_fps(self):
        with open(video_path, "rb") as file:
            video_file = SimpleUploadedFile(
                "test_video.mp4", file.read(), content_type="video/mp4"
            )
        response = self.client.post("/api/get-video-fps/", {"video": video_file})
        self.assertEqual(response.status_code, 200)
        self.assertIn("fps", response.json())

    def test_process_video(self):
        with open(video_path, "rb") as file:
            video_file = SimpleUploadedFile(
                "test_video.mp4", file.read(), content_type="video/mp4"
            )
        response = self.client.post(
            "/api/process-video/",
            {
                "video": video_file,
                "start_time": "00:00:00",
                "end_time": "00:00:10",
                "resolution": "1080p",
                "enhance_audio": "true",
                "add_subtitles": "false",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("video_url", response.json())


class ProjectViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.project = Project.objects.create(
            title="Test Project", description="Test Project Description"
        )

    def test_project_list(self):
        response = self.client.get("/api/projects/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Test Project", response.json()[0]["title"])

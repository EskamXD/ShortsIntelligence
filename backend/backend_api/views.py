# views.py
from rest_framework import viewsets
from .models import Video, Project
from .serializers import VideoSerializer, ProjectSerializer


class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

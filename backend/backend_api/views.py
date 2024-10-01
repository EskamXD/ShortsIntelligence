# views.py
from rest_framework import generics
from .models import Video
from .serializers import VideoSerializer


class VideoListCreate(generics.ListCreateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer

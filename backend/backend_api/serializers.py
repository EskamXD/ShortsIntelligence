# serializers.py
from rest_framework import serializers
from .models import Video


# Create your serializers here.


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ["id", "title", "description", "file", "created_at"]

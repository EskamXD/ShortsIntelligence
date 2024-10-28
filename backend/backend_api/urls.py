# urls.py
from django.urls import path, include
from .views import (
    VideoViewSet,
    ProjectViewSet,
    get_video_fps,
    process_video,
    get_gpu_info,
)
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register(r"videos", VideoViewSet)
router.register(r"projects", ProjectViewSet)

urlpatterns = [
    path("", include(router.urls)),
    # path to swagger
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("get-video-fps/", view=get_video_fps, name="get-video-fps"),
    path("process-video/", view=process_video, name="process_video"),
    path("gpu-info/", view=get_gpu_info, name="get_gpu_info"),
]

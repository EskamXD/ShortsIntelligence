# urls.py
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    VideoViewSet,
    ProjectViewSet,
    get_video_fps,
    process_video,
    get_gpu_info,
    upload_file,
    list_files,
    finalize_project_files,
    fetch_subtitles,
    extract_captions,
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
        name="swagger_ui",
    ),
    path("get-video-fps/", view=get_video_fps, name="get_video_fps"),
    path("process-video/", view=process_video, name="process_video"),
    path("gpu-info/", view=get_gpu_info, name="get_gpu_info"),
    path("upload-file/", view=upload_file, name="upload_file"),
    path("list-files/", view=list_files, name="list_files"),
    path(
        "finalize-project-files/",
        view=finalize_project_files,
        name="finalize_project_files",
    ),
    path("fetch-subtitles/", view=fetch_subtitles, name="fetch_subtitles"),
    path(
        "extract-captions/",
        view=extract_captions,
        name="extract_captions",
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

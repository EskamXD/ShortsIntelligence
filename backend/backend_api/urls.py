# urls.py
from django.urls import path
from .views import VideoListCreate
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()


urlpatterns = [
    path("videos/", VideoListCreate.as_view(), name="video-list-create"),
    # path("videos/<int:pk>/", VideoListCreate.as_view(), name="video-detail"),
    # path to swagger
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]

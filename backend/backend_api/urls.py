# urls.py
from django.urls import path, include
from .views import VideoViewSet, ProjectViewSet
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
]

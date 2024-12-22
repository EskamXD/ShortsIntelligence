# views.py
import base64
import os
import subprocess
import shutil
from whisper import load_model  # Upewnij się, że zainstalowano OpenAI Whisper

from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Video, Project
from .serializers import VideoSerializer, ProjectSerializer

from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage


class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


@api_view(["POST"])
@csrf_exempt
def get_video_fps(request):
    if request.method == "POST" and "video" in request.FILES:
        video_file = request.FILES["video"]

        # Zapisz plik tymczasowo, aby ffprobe mógł go odczytać
        print(default_storage.exists("temp/"))
        video_path = default_storage.save(f"temp/{video_file.name}", video_file)
        print(video_path)

        # Użyj ffprobe, aby uzyskać metadane wideo
        ffprobe_cmd = [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=avg_frame_rate,duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            f"{default_storage.path(video_path)}",
        ]

        try:
            # Uruchomienie komendy
            output = subprocess.check_output(ffprobe_cmd).decode("utf-8").split()
            fps = eval(output[0])  # Zwraca proporcję np. "30000/1001"
            duration = float(output[1])
            print(fps, duration, int(duration * fps))
            total_frames = float(int(duration * fps))

            # Zwrot FPS, długości w sekundach oraz liczby klatek
            return JsonResponse(
                {"fps": fps, "duration": duration, "total_frames": total_frames}
            )

        except subprocess.CalledProcessError as e:
            return JsonResponse(
                {"error": "Error processing video metadata"}, status=500
            )

        finally:
            # Usuń tymczasowy plik
            default_storage.delete(video_path)

    return JsonResponse({"error": "Invalid request"}, status=400)


def format_timestamp(seconds: float) -> str:
    """Formatuje timestamp w stylu SRT: HH:MM:SS,mmm"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    milliseconds = int((seconds % 1) * 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02},{milliseconds:03}"


@api_view(["POST"])
@csrf_exempt
def process_video(request):
    if request.method == "POST" and "video" in request.FILES:
        video_file = request.FILES["video"]
        start_time = request.POST["start_time"]
        end_time = request.POST["end_time"]
        resolution = request.POST["resolution"]
        enhance_audio = request.POST["enhance_audio"] == "true"
        add_subtitles = request.POST["add_subtitles"] == "true"
        print(
            "\n\n\n",
            start_time,
            end_time,
            resolution,
            enhance_audio,
            add_subtitles,
            "\n\n\n",
        )

        # Mapowanie rozdzielczości do wartości pionowych
        resolution_mapping = {
            "480p": 480,
            "720p": 720,
            "1080p": 1080,
            "1440p": 1440,
            "4K": 2160,
        }
        target_resolution = resolution_mapping.get(resolution, 1080)  # Domyślnie 1080p
        print("\n\n\n", target_resolution, "\n\n\n")

        # Zapisz oryginalne wideo
        video_path = default_storage.save(
            os.path.join("temp", video_file.name), video_file
        )
        output_video_name = "processed_video.mp4"
        subtitles_name = "subtitles.srt"

        output_video_path = default_storage.path(output_video_name)
        subtitles_path = default_storage.path(subtitles_name)
        print("\n\n\n", video_path, output_video_path, subtitles_path, "\n\n\n")

        # Wybór kodeka i modelu Whisper z ustawień
        codec = settings.GPU_INFO["codec"]
        whisper_model = settings.GPU_INFO["whisper_model"]

        # Uzyskaj proporcje wideo za pomocą FFprobe
        try:
            probe = subprocess.run(
                [
                    "ffprobe",
                    "-v",
                    "error",
                    "-select_streams",
                    "v:0",
                    "-show_entries",
                    "stream=width,height",
                    "-of",
                    "csv=p=0",
                    default_storage.path(video_path),
                ],
                capture_output=True,
                text=True,
                check=True,
            )
            width, height = map(int, probe.stdout.strip().split(","))
            scale_value = (
                f"-1:{target_resolution}"
                if height > width
                else f"{target_resolution}:-1"
            )
            print("\n\n\n", width, height, scale_value, "\n\n\n")

            # Sprawdź, czy plik wynikowy istnieje i usuń, jeśli tak
            if default_storage.exists(output_video_name):
                default_storage.delete(output_video_name)

            # Komenda FFmpeg do przetworzenia wideo z dynamicznym skalowaniem
            ffmpeg_cmd = [
                "ffmpeg",
                "-i",
                default_storage.path(video_path),
                "-vf",
                f"scale={scale_value}",
                "-ss",
                start_time,
                "-to",
                end_time,
                "-c:v",
                codec,
                "-crf",
                "18",
                "-preset",
                "fast",
                "-c:a",
                "aac",
                output_video_path,
            ]
            if enhance_audio:
                ffmpeg_cmd.extend(["-af", "highpass=f=200, lowpass=f=3000"])

            subprocess.run(ffmpeg_cmd, check=True)

            # Generowanie napisów przy użyciu OpenAI Whisper
            if add_subtitles:
                model = load_model(whisper_model)
                result = model.transcribe(output_video_path, fp16=False)

                # Tworzenie pliku SRT z timestampami
                srt_content = ""
                for i, segment in enumerate(result["segments"], start=1):
                    start = format_timestamp(segment["start"])
                    end = format_timestamp(segment["end"])
                    text = segment["text"].strip()
                    srt_content += f"{i}\n{start} --> {end}\n{text}\n\n"

                # Zapisz napisy w `default_storage` jako plik .srt
                subtitles_content = ContentFile(srt_content.encode("utf-8"))
                saved_subtitles_file = default_storage.save(
                    subtitles_name, subtitles_content
                )

            # Zwracanie URL-ów do przetworzonego wideo i napisów
            video_url = request.build_absolute_uri(
                default_storage.url(output_video_name)
            )
            subtitles_url = (
                request.build_absolute_uri(default_storage.url(saved_subtitles_file))
                if add_subtitles
                else None
            )
            return JsonResponse(
                {"video_url": video_url, "subtitles_url": subtitles_url}
            )

        except subprocess.CalledProcessError as e:
            print("\n\n\nError processing video:", e)
            return JsonResponse({"error": "Video processing failed"}, status=500)
        finally:
            # Usuń pliki tymczasowe
            default_storage.delete(video_path)
            # if default_storage.exists(output_video_name):
            #     default_storage.delete(output_video_name)
            # if add_subtitles and default_storage.exists(subtitles_name):
            #     default_storage.delete(subtitles_name)

    return JsonResponse({"error": "Invalid request"}, status=400)


# @api_view(["POST"])
# @csrf_exempt
# def process_video(request):
#     if request.method == "POST" and "video" in request.FILES:
#         video_file = request.FILES["video"]
#         start_time = request.POST["start_time"]
#         end_time = request.POST["end_time"]
#         resolution = request.POST["resolution"]
#         enhance_audio = request.POST["enhance_audio"] == "true"
#         add_subtitles = request.POST["add_subtitles"] == "true"

#         # Mapowanie rozdzielczości do wartości pionowych
#         resolution_mapping = {
#             "480p": 480,
#             "720p": 720,
#             "1080p": 1080,
#             "1440p": 1440,
#             "4K": 2160,
#         }
#         target_resolution = resolution_mapping.get(resolution, 1080)

#         output_video_name = "processed_video.mp4"
#         subtitles_name = "subtitles.srt"
#         codec = settings.GPU_INFO["codec"]
#         whisper_model = settings.GPU_INFO["whisper_model"]

#         def generate():
#             # Informacja o rozpoczęciu przetwarzania
#             yield "data: Rozpoczęcie przetwarzania wideo\n\n"

#             # Zapisz oryginalne wideo
#             video_path = default_storage.save(
#                 os.path.join("temp", video_file.name), video_file
#             )
#             output_video_path = default_storage.path(output_video_name)
#             subtitles_path = default_storage.path(subtitles_name)

#             # Sprawdz proporcje wideo
#             yield "data: Sprawdzanie rozmiaru wideo\n\n"
#             try:
#                 probe = subprocess.run(
#                     [
#                         "ffprobe",
#                         "-v",
#                         "error",
#                         "-select_streams",
#                         "v:0",
#                         "-show_entries",
#                         "stream=width,height",
#                         "-of",
#                         "csv=p=0",
#                         default_storage.path(video_path),
#                     ],
#                     capture_output=True,
#                     text=True,
#                     check=True,
#                 )
#                 width, height = map(int, probe.stdout.strip().split(","))
#                 scale_value = (
#                     f"-1:{target_resolution}"
#                     if height > width
#                     else f"{target_resolution}:-1"
#                 )

#                 # Montowanie wideo
#                 yield "data: Montowanie wideo\n\n"
#                 if default_storage.exists(output_video_name):
#                     default_storage.delete(output_video_name)

#                 ffmpeg_cmd = [
#                     "ffmpeg",
#                     "-i",
#                     default_storage.path(video_path),
#                     "-vf",
#                     f"scale={scale_value}",
#                     "-ss",
#                     start_time,
#                     "-to",
#                     end_time,
#                     "-c:v",
#                     codec,
#                     "-preset",
#                     "fast",
#                     "-c:a",
#                     "aac",
#                     output_video_path,
#                 ]

#                 if codec == "libx264":
#                     ffmpeg_cmd.extend(["-crf", "18"])
#                 elif codec == "h264_nvenc":
#                     ffmpeg_cmd.extend(["-cq:v", "20"])  # jakość dla kodeka NVIDIA

#                 if enhance_audio:
#                     ffmpeg_cmd.extend(["-af", "highpass=f=200, lowpass=f=3000"])

#                 subprocess.run(ffmpeg_cmd, check=True)

#                 # Generowanie napisów
#                 if add_subtitles:
#                     yield "data: Generowanie napisów\n\n"
#                     model = load_model(whisper_model)
#                     result = model.transcribe(output_video_path, fp16=False)

#                     # Tworzenie pliku SRT z timestampami
#                     srt_content = ""
#                     for i, segment in enumerate(result["segments"], start=1):
#                         start = format_timestamp(segment["start"])
#                         end = format_timestamp(segment["end"])
#                         text = segment["text"].strip()
#                         srt_content += f"{i}\n{start} --> {end}\n{text}\n\n"

#                     subtitles_content = ContentFile(srt_content.encode("utf-8"))
#                     default_storage.save(subtitles_name, subtitles_content)

#                 yield "data: Przetwarzanie zakończone\n\n"

#                 # Zwrócenie URL-i po zakończeniu
#                 video_url = request.build_absolute_uri(
#                     default_storage.url(output_video_name)
#                 )
#                 subtitles_url = (
#                     request.build_absolute_uri(default_storage.url(subtitles_name))
#                     if add_subtitles
#                     else None
#                 )
#                 yield f"data: {{'video_url': '{video_url}', 'subtitles_url': '{subtitles_url}'}}\n\n"

#             except subprocess.CalledProcessError as e:
#                 yield f"data: Error processing video: {str(e)}\n\n"
#             finally:
#                 # Usuń pliki tymczasowe
#                 default_storage.delete(video_path)

#         # Zwracanie `StreamingHttpResponse` z generatora `generate`
#         response = StreamingHttpResponse(generate(), content_type="text/event-stream")
#         response["Cache-Control"] = "no-cache"
#         response["X-Accel-Buffering"] = "no"
#         return response

#     return JsonResponse({"error": "Invalid request"}, status=400)


@api_view(["GET"])
def get_gpu_info(request):
    gpu_info = settings.GPU_INFO
    return Response(gpu_info)


@api_view(["POST"])
def upload_file(request):
    try:
        file = request.FILES.get("file")
        project_id = request.POST.get("project_id")
        if not file:
            return JsonResponse({"error": "No file uploaded"}, status=400)

        # Sprawdź, czy project_id jest poprawne
        if not project_id:
            return JsonResponse({"error": "Project ID is required"}, status=400)

        try:
            # Save file to default_storage
            file_path = default_storage.save(
                f"edit_files_{project_id}/{file.name}", file
            )
            return JsonResponse(
                {"file_url": default_storage.url(file_path)}, status=201
            )
        except Exception as storage_error:
            return JsonResponse(
                {"error": f"Failed to save file: {str(storage_error)}"},
                status=500,
            )
    except Exception as e:
        return JsonResponse(
            {"error": f"An unexpected error occurred: {str(e)}"},
            status=500,
        )


@api_view(["GET"])
def list_files(request):
    project_id = request.GET.get("project_id")
    folder_path = f"edit_files_{project_id}/"
    files_data = []

    # Check if the folder exists in default_storage
    if default_storage.exists(folder_path):
        # Get the list of files (no directories)
        files = default_storage.listdir(folder_path)[1]

        # Create a list of dictionaries with 'name' and 'url' for each file
        files_data = [
            {"name": f, "url": default_storage.url(os.path.join(folder_path, f))}
            for f in files
        ]

    return JsonResponse({"files": files_data}, status=200)


@api_view(["POST"])
def finalize_project_files(request):
    project_id = request.data.get("project_id")
    video_name = request.data.get("video_name")
    if not project_id:
        return JsonResponse({"error": "Project ID is required"}, status=400)

    try:
        # Define source paths for processed files
        temp_video_path = default_storage.path("processed_video.mp4")
        temp_subtitles_path = default_storage.path("subtitles.srt")

        # Define target project folder
        project_folder = default_storage.path(f"edit_files_{project_id}/")
        project_video_path = os.path.join(project_folder, "processed_video.mp4")
        project_subtitles_path = os.path.join(project_folder, "subtitles.srt")

        # Ensure project folder exists
        if not os.path.exists(project_folder):
            os.makedirs(project_folder)  # Use os.makedirs to create the directory

        # Move processed video to the project folder
        if default_storage.exists(temp_video_path):
            shutil.move(temp_video_path, project_video_path)

        # Move subtitles file if it exists
        if default_storage.exists(temp_subtitles_path):
            shutil.move(temp_subtitles_path, project_subtitles_path)

        # Rename the video file if a new name is provided
        if video_name:
            new_video_path = os.path.join(project_folder, video_name)
            os.rename(project_video_path, new_video_path)

        # Return paths for the saved files
        video_url = default_storage.url(
            f"edit_files_{project_id}/{video_name if video_name else "processed_video"}.mp4"
        )
        subtitles_url = (
            default_storage.url(f"edit_files_{project_id}/subtitles.srt")
            if default_storage.exists(project_subtitles_path)
            else None
        )

        return JsonResponse(
            {"video_url": video_url, "subtitles_url": subtitles_url}, status=200
        )

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["GET"])
def fetch_subtitles(request):
    project_id = request.GET.get("project_id")
    subtitle_path = f"edit_files_{project_id}/subtitles.srt"

    # Check if the subtitle file exists in storage
    if default_storage.exists(subtitle_path):
        with default_storage.open(subtitle_path, "rb") as subtitle_file:
            subtitle_content = subtitle_file.read().decode(
                "utf-8"
            )  # Read as binary, then decode
            return HttpResponse(
                subtitle_content, content_type="text/plain; charset=utf-8"
            )

    # Return an error if the subtitle file doesn't exist
    return JsonResponse({"error": "Subtitle file not found."}, status=404)

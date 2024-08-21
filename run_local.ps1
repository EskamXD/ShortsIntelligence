# Sprawdzenie, czy Docker jest uruchomiony
$dockerRunning = docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is not running. Please start Docker and try again."
    exit 1
}

# Uruchomienie PostgreSQL w Dockerze
Write-Host "Starting PostgreSQL with Docker..."
docker-compose up -d

# Czekanie na uruchomienie bazy danych
Write-Host "Waiting for PostgreSQL to be ready..."
Start-Sleep -Seconds 2

# Uruchomienie backendu Django
Write-Host "Starting Django backend..."
Set-Location -Path "backend"  # Przejście do katalogu z aplikacją Django
python manage.py migrate  # Zastosowanie migracji
$djangoProcess = Start-Process -NoNewWindow -FilePath "python" -ArgumentList "manage.py runserver" -PassThru
$djangoPID = $djangoProcess.Id

Start-Sleep -Seconds 2

# Uruchomienie frontendu React z Vite
Write-Host "Starting React frontend with Vite..."
Set-Location -Path "../frontend"  # Przejście do katalogu z frontendem
npm install  # Zainstalowanie zależności
$viteProcess = Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run dev" -PassThru
$vitePID = $viteProcess.Id

Start-Sleep -Seconds 2

# Wyświetlenie PID-ów procesów
Write-Host "Django PID: $djangoPID"
Write-Host "Vite PID: $vitePID"

# Sprawdzenie, czy procesy zostały prawidłowo uruchomione
if (-not $djangoPID -or -not $vitePID) {
    Write-Host "Failed to start services. Exiting..."

    # Zatrzymywanie procesów, jeśli są uruchomione
    if ($djangoPID) {
        Write-Host "Stopping Django backend..."
        Stop-Process -Id $djangoPID -ErrorAction SilentlyContinue
    }

    if ($vitePID) {
        Write-Host "Stopping React frontend with Vite..."
        Stop-Process -Id $vitePID -ErrorAction SilentlyContinue
    }

    # Zatrzymanie Docker Compose
    Write-Host "Stopping PostgreSQL Docker container..."
    docker-compose down

    Set-Location -Path ".."  # Powrót do głównego katalogu
    exit 1
}

# Informacja o zakończeniu procesu
Write-Host "All services started successfully. Django running on http://127.0.0.1:8000 and Vite on http://127.0.0.1:3000"

# Pętla monitorująca wejście użytkownika
while ($true) {
    Write-Host "Press 'q' and Enter to stop the services..."
    $x = Read-Host "You entered"

    if ($x -eq "q") {
        # Zatrzymywanie procesów
        Write-Host "Stopping Django backend..."
        if ($djangoPID) {
            Stop-Process -Id $djangoPID -ErrorAction SilentlyContinue
        }

        Write-Host "Stopping React frontend with Vite..."
        if ($vitePID) {
            Stop-Process -Id $vitePID -ErrorAction SilentlyContinue
        }

        # Zatrzymanie Docker Compose
        Write-Host "Stopping PostgreSQL Docker container..."
        docker-compose down

        Set-Location -Path ".."  # Powrót do głównego katalogu

        Write-Host "All services stopped."
        break  # Przerwanie pętli
    } else {
        Write-Host "Invalid input. Press 'q' and Enter to stop the services..."
    }
}

exit 0

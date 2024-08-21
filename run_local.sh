#!/bin/bash

# Sprawdzenie, czy Docker jest uruchomiony
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Uruchomienie PostgreSQL w Dockerze
echo "Starting PostgreSQL with Docker..."
docker-compose up -d

# Czekanie na uruchomienie bazy danych
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Uruchomienie backendu Django
echo "Starting Django backend..."
cd backend || exit 1  # Przejście do katalogu z aplikacją Django
python manage.py migrate  # Zastosowanie migracji
django_process=$(python manage.py runserver & echo $!)  # Uruchomienie w tle i zapisanie PID
cd .. || exit 1  # Powrót do katalogu głównego

sleep 5

# Uruchomienie frontendu React z Vite
echo "Starting React frontend with Vite..."
cd frontend || exit 1  # Przejście do katalogu z frontendem
npm install  # Zainstalowanie zależności
vite_process=$(npm run dev & echo $!)  # Uruchomienie w tle i zapisanie PID
cd .. || exit 1  # Powrót do katalogu głównego

sleep 5

# Wyświetlenie PID-ów procesów
echo "Django PID: $django_process"
echo "Vite PID: $vite_process"

# Sprawdzenie, czy procesy zostały prawidłowo uruchomione
if [ -z "$django_process" ] || [ -z "$vite_process" ]; then
    echo "Failed to start services. Exiting..."

    # Zatrzymywanie procesów, jeśli są uruchomione
    if [ -n "$django_process" ]; then
        echo "Stopping Django backend..."
        kill "$django_process" 2>/dev/null
    fi

    if [ -n "$vite_process" ]; then
        echo "Stopping React frontend with Vite..."
        kill "$vite_process" 2>/dev/null
    fi

    # Zatrzymanie Docker Compose
    echo "Stopping PostgreSQL Docker container..."
    docker-compose down

    exit 1
fi

# Informacja o zakończeniu procesu
echo "All services started successfully. Django running on http://127.0.0.1:8000 and Vite on http://127.0.0.1:3000"

# Pętla monitorująca wejście użytkownika
while true; do
    read -p "Press 'q' and Enter to stop the services: " input

    if [ "$input" = "q" ]; then
        # Zatrzymywanie procesów
        echo "Stopping Django backend..."
        if [ -n "$django_process" ]; then
            kill "$django_process" 2>/dev/null
        fi

        echo "Stopping React frontend with Vite..."
        if [ -n "$vite_process" ]; then
            kill "$vite_process" 2>/dev/null
        fi

        # Zatrzymanie Docker Compose
        echo "Stopping PostgreSQL Docker container..."
        docker-compose down

        echo "All services stopped."
        break  # Przerwanie pętli
    else
        echo "Invalid input. Press 'q' and Enter to stop the services..."
    fi
done

exit 0

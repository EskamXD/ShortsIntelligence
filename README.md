# ShortsIntelligence
## Opis projektu

ShortsIntelligence to aplikacja umożliwiająca automatyczne tworzenie krótkich filmików (shortów) z długich materiałów wideo. Dzięki wykorzystaniu technologii Django i React, aplikacja zapewnia intuicyjny interfejs oraz możliwość przetwarzania i analizy długich nagrań. Głównym celem projektu jest automatyzacja procesu tworzenia klipów, co pozwala użytkownikom szybko generować i udostępniać skrócone wersje filmów, idealne na media społecznościowe.

## Spis treści

- [Opis projektu](#opis-projektu)
- [Instalacja i uruchomienie](#instalacja-i-uruchomienie)
- [Jak korzystać z projektu](#jak-korzystać-z-projektu)
- [Podziękowania](#podziękowania)
- [Licencja](#licencja)

## Instalacja i uruchomienie

Aby uruchomić projekt lokalnie, wykonaj następujące kroki:

### Wymagania:
- **Python 3.12.7** (z obsługą virtual environment)
- **Node.js**
- **FFmpeg**

### Instalacja:

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/EskamXD/ShortsIntelligence
   cd shortsintelligence
   ```

2. Uruchom serwer backendowy poprzez gotowy plik run.ps1 (Windows) / run.sh (Linux i MacOS)
   ```bash
   cd backend
   
   # Skrypty uruchamiające dostępne w folderze backend 
   ./run.sh  # Linux/MacOS
   .\run.ps1 # Windows
   ```

   
### Alternatywy sposób bez skryptu
   Windows:
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate.ps1

   pip install -r requirements.txt
   python manage.py makemigrations
   python manage.py migrate

   python manage.py runserver
   ```

   Linux/MacOS:
   ```bash
   python3 -m venv venv
   source ./venv/bin/activate

   pip install -r requirements.txt
   python manage.py makemigrations
   python manage.py migrate

   python manage.py runserver
   ```
      
4. Zainstaluj zależności frontendowe:
   ```bash
   cd frontend

   # Musimy znajdować się w folderze frontend
   npm install
   ```

5. Uruchom serwer deweloperski React:
   ```bash
   npm run dev
   ```

6. Aplikacja będzie dostępna pod adresem `http://localhost:8000` (backend) oraz `http://localhost:5173` (frontend).



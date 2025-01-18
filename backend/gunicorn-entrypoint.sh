#!/bin/bash

sleep 10

python manage.py makemigrations

python manage.py migrate

gunicorn -c gunicorn-config.py app_name.wsgi:application

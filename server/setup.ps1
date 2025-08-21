$ErrorActionPreference = "Stop"

Write-Host "Installing npm dependencies..."
npm install

Write-Host "Creating required directories..."
New-Item -ItemType Directory -Force -Path "static/css" | Out-Null
New-Item -ItemType Directory -Force -Path "static/src" | Out-Null

Write-Host "Building Tailwind CSS..."
npx tailwindcss -i ./static/src/main.css -o ./static/css/main.css --minify

Write-Host "Collecting static files..."
python manage.py collectstatic --noinput

Write-Host "Setup complete!"

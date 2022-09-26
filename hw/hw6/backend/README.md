# Development
Create and activate a virtual environment.
Make sure dependencies are installed via `pip` and `requirements.txt`.
Then run the service locally:
```
python3 -m gunicorn -b :8000 main:app
```
# Deployment
Make sure GCP SDK for Python is installed, configured, and authenticated.
Deploy the project with:
```
gcp deploy app
```

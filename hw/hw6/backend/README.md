# Development
Create and activate a virtual environment.
1. Make sure dependencies are installed via `pip` and `requirements.txt`.
2. Then run the service locally:
```
functions-framework --target search --debug
```
```
functions-framework --target details --debug
```
3. Run a web server for the web page.
```
python3 -m http.server 8000
```
# Deployment
Make sure GCP SDK for Python is installed, configured, and authenticated.
1. Deploy the search API:
```
gcloud functions deploy python-http-function \
--gen2 \
--runtime=python310 \
--region=us-west2 \
--source=. \
--entry-point=search \
--trigger-http \
--allow-unauthenticated
```
2. Deploy the details API:
```
gcloud functions deploy python-http-function \
--gen2 \
--runtime=python310 \
--region=us-west2 \
--source=. \
--entry-point=details \
--trigger-http \
--allow-unauthenticated
```

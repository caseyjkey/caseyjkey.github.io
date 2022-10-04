from nis import cat
import os
from google.cloud import secretmanager
# import google.cloud.logging
# import logging
# from flask import escape
import functions_framework
import requests

PROJECT_ID = "local-shop-finder-363403"
secret_id = "Yelp"
version_id = "latest"

# Create the Secret Manager client.
client = secretmanager.SecretManagerServiceClient()

# Build the resource name of the secret version.
name = f"projects/{PROJECT_ID}/secrets/{secret_id}/versions/{version_id}"

# Access the secret version.
response = client.access_secret_version(name=name)

# Assign the decoded payload.
YELP_API_KEY = response.payload.data.decode('UTF-8')
YELP_API_URI = 'https://api.yelp.com/v3/businesses'
YELP_API_HEADERS = {'Authorization': f'Bearer {YELP_API_KEY}'}

RESPONSE_HEADERS = {
	'Access-Control-Allow-Origin': '*'
}


@functions_framework.http
def search(request):
	payload = request.args
	response = requests.get(YELP_API_URI + '/search', params=payload, headers=YELP_API_HEADERS)
	return (response.json(), 200, RESPONSE_HEADERS)

@functions_framework.http
def details(request):
	payload = request.args
	response = requests.get(YELP_API_URI + '/' + payload['id'], headers=YELP_API_HEADERS)
	return (response.json(), 200, RESPONSE_HEADERS)


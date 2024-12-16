import requests

model_name = "bert-base-uncased"
response = requests.get(f"https://huggingface.co/api/models/{model_name}")
data = response.json()
print(data)

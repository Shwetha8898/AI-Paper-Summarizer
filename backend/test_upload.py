import requests
import json
import fitz # PyMuPDF to create a dummy pdf

# Create a dummy PDF
doc = fitz.open()
page = doc.new_page()
page.insert_text((50, 50), "Hello world, this is a test page for summarization. It needs to have multiple sentences to summarize. This is the second sentence. And here is the third sentence. Make sure there are enough sentences for sumy to extract.")
doc.save("test_dummy.pdf")
doc.close()

# Upload the dummy PDF
url = "http://127.0.0.1:8000/api/upload/"
files = {'file': open('test_dummy.pdf', 'rb')}
# Need an auth header if required, but UploadPaperView doesn't enforce permission_classes
response = requests.post(url, files=files)

print("Status Code:", response.status_code)
print("Response:", response.text)

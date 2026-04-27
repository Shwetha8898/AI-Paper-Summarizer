from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Paper
from .utils import extract_text_per_page
from django.conf import settings
import os
import json
from dotenv import load_dotenv

load_dotenv()

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({"error": "Please provide username and password"}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=400)
        user = User.objects.create_user(username=username, password=password)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username})

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "username": user.username})
        return Response({"error": "Invalid credentials"}, status=400)


class UploadPaperView(APIView):
    # permission_classes = [IsAuthenticated] # We will enable this when frontend is ready so we can test

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file"})

        # If user is authenticated use it, else null
        user = request.user if request.user.is_authenticated else None
        paper = Paper.objects.create(file=file, user=user)

        # Extract context page by page
        pages = extract_text_per_page(paper.file.path)
        
        # Check if OpenAI API key exists in environment
        openai_api_key = os.environ.get('OPENAI_API_KEY')
        
        structured_summary = {
            "Abstract": "This is a detailed analysis generated page by page.",
            "KeyPoints": []
        }

        if openai_api_key:
            # We would use LangChain + OpenAI to summarize page by page
            # To avoid dependency load errors here, we use a basic simulation
            # since actual OpenAI requires valid API key
            from langchain.chat_models import ChatOpenAI
            from langchain.schema import HumanMessage
            
            try:
                chat = ChatOpenAI(temperature=0, openai_api_key=openai_api_key)
                for i, page_text in enumerate(pages):
                    if not page_text.strip(): continue
                    # Limit token length per page just in case
                    prompt = f"Summarize this text by providing a concise Heading followed by a detailed paragraph explanation containing exactly 5 key points. Do NOT mention page numbers absolutely anywhere in your response. Text: {page_text[:4000]}"
                    resp = chat([HumanMessage(content=prompt)])
                    structured_summary["KeyPoints"].append(f"### {resp.content}")
            except Exception as e:
                return Response({"error": str(e)}, status=500)
        else:
            # Using mathematical Extractive Summarization if no API Key is provided
            try:
                from sumy.parsers.plaintext import PlaintextParser
                from sumy.nlp.tokenizers import Tokenizer
                from sumy.summarizers.lsa import LsaSummarizer
                
                summarizer = LsaSummarizer()
                
                for i, page_text in enumerate(pages):
                    if not page_text.strip(): continue
                    
                    parser = PlaintextParser.from_string(page_text, Tokenizer("english"))
                    # Mathematically extract the 5 most important sentences
                    summary_sentences = summarizer(parser.document, 5)
                    
                    heading = f"### Key Extractions from Page {i+1}"
                    bullet_points = []
                    for sentence in summary_sentences:
                        bullet_points.append(f"- {str(sentence)}")
                        
                    if not bullet_points:
                        bullet_points.append("- No text found for summarization on this page.")
                        
                    formatted_page = f"{heading}\n" + "\n".join(bullet_points)
                    structured_summary["KeyPoints"].append(formatted_page)
            except Exception as e:
                return Response({"error": "Failed to run extractive summarizer. Ensure nltk punkt is downloaded. " + str(e)}, status=500)

        paper.summary = structured_summary
        paper.title = file.name
        paper.save()

        return Response({
            "message": "Uploaded and analyzed successfully.",
            "summary": structured_summary
        })

class HistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        papers = Paper.objects.filter(user=request.user).order_by('-uploaded_at')
        history = []
        for p in papers:
            history.append({
                "id": p.id,
                "title": p.title or "Untitled Document",
                "uploaded_at": p.uploaded_at.isoformat(),
                "summary": p.summary
            })
        return Response(history)

    def delete(self, request, pk):
        try:
            paper = Paper.objects.get(id=pk, user=request.user)
            paper.file.delete(save=False)
            paper.delete()
            return Response({"message": "Deleted successfully"})
        except Paper.DoesNotExist:
            return Response({"error": "Item not found"}, status=404)
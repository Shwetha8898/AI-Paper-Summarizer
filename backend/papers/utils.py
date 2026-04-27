import fitz  # PyMuPDF

def extract_text_per_page(file_path):
    """
    Extracts text from a document page by page.
    Returns a list of strings, where each string is the text of a single page.
    """
    try:
        doc = fitz.open(file_path)
        pages = []
        for page in doc:
            pages.append(page.get_text())
        return pages
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return []

def extract_text(file_path):
    """
    Legacy method for extracting all text as a single string.
    """
    return "\n".join(extract_text_per_page(file_path))
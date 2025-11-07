# app/services/processing.py

def process_file(path: str) -> dict:
    """
    Process uploaded file at `path`.
    Return structured metadata/results.
    """
    # EXAMPLE logic (cheap)
    size = 0
    with open(path, "rb") as f:
        data = f.read()
        size = len(data)

    # You can branch on filetype here later
    # extract_text_from_pdf(path)
    # run_embedding(path)       

    return {
        "status": "processed",
        "size_bytes": size,
    }

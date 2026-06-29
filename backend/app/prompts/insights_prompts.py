def get_document_insights_prompt(text, metadata):
    return f"""
You are an AI document analyst.

Document metadata:
{metadata}

Document:
{text}

Provide 3-6 concise insights.

Return ONLY bullet points.

Example:

- Strong emphasis on backend APIs.
- React experience is expected.
- Enterprise AI knowledge is valuable.
"""
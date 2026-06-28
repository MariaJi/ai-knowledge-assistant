SUMMARY_PROMPTS = {
    "job_description": """
Summarize this job description using this format:

# Role Summary

# Key Responsibilities

# Required Skills

# Preferred Skills

# Important Technologies

# Interview Preparation Topics

Only use information from the document.
""",

    "resume": """
Summarize this resume using this format:

# Professional Summary

# Core Technical Skills

# AI / ML Relevant Experience

# Software Engineering Experience

# Education and Research Background

# Strengths for AI Engineering Roles

Only use information from the document.
""",

    "requirements": """
Summarize this requirements document using this format:

# Business Goal

# Functional Requirements

# Data / Inputs Needed

# User Workflow

# Open Questions or Risks

Only use information from the document.
""",

    "technical": """
Summarize this technical document using this format:

# Executive Summary

# Key Concepts

# Architecture or Workflow

# Technologies Mentioned

# Practical Takeaways

Only use information from the document.
""",

    "travel": """
Summarize this travel or hiking document using this format:

# Overview

# Main Attractions

# Important Conditions or Warnings

# Practical Tips

# Best Use of This Information

Only use information from the document.
""",

    "general": """
Summarize the document using this format:

# Executive Summary

# Key Points

# Important Facts

# Action Items

Only use information from the document.
"""
}


def get_summary_prompt(document_type: str) -> str:
    return SUMMARY_PROMPTS.get(
        document_type,
        SUMMARY_PROMPTS["general"]
    )
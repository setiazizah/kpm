"""LLM client abstraction — OpenAI / Gemini / Dummy.

Set LLM_PROVIDER env var to: openai | gemini | dummy (default).
"""

import os
from abc import ABC, abstractmethod


class BaseLLMClient(ABC):
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ) -> str: ...


class DummyLLMClient(BaseLLMClient):
    """Returns deterministic placeholder text — no API calls."""

    async def generate(self, prompt: str, max_tokens: int = 1024, temperature: float = 0.7) -> str:
        return (
            "ISU: Kebijakan Pemerintah\n"
            "Pemerintah berkomitmen untuk mendukung kebijakan yang berpihak kepada rakyat. "
            "Berbagai program strategis telah dirancang untuk meningkatkan kesejahteraan masyarakat."
        )


class OpenAIClient(BaseLLMClient):
    def __init__(self) -> None:
        import openai  # type: ignore
        self._client = openai.AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
        self._model = os.getenv("OPENAI_MODEL", "gpt-4o")

    async def generate(self, prompt: str, max_tokens: int = 1024, temperature: float = 0.7) -> str:
        resp = await self._client.chat.completions.create(
            model=self._model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return resp.choices[0].message.content or ""


class GeminiClient(BaseLLMClient):
    def __init__(self) -> None:
        import google.generativeai as genai  # type: ignore
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        self._model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-1.5-pro"))

    async def generate(self, prompt: str, max_tokens: int = 1024, temperature: float = 0.7) -> str:
        import asyncio
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self._model.generate_content(
                prompt,
                generation_config={"max_output_tokens": max_tokens, "temperature": temperature},
            ),
        )
        return response.text


_PROVIDERS = {
    "openai": OpenAIClient,
    "gemini": GeminiClient,
    "dummy": DummyLLMClient,
}

_instance: BaseLLMClient | None = None


def get_llm_client() -> BaseLLMClient:
    global _instance
    if _instance is None:
        provider = os.getenv("LLM_PROVIDER", "dummy").lower()
        cls = _PROVIDERS.get(provider, DummyLLMClient)
        _instance = cls()
    return _instance

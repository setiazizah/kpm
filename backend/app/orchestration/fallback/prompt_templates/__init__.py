from ._templates import TEMPLATES


def load_template(name: str) -> str:
    if name not in TEMPLATES:
        raise KeyError(f"Unknown prompt template: {name!r}. Available: {list(TEMPLATES)}")
    return TEMPLATES[name]

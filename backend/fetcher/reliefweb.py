"""
ReliefWeb updates fetcher. HTML only: fetch listing pages 1–5, then each report page.
Per _md/01_reliefweb_fetching.md: title, event URL, region, publish date, article text.
Listing: https://reliefweb.int/updates?page=1 (through page=5)
Report: https://reliefweb.int/report/{country}/{slug}
"""
import re
import sys
from pathlib import Path
from urllib.parse import urljoin

_backend = Path(__file__).resolve().parent.parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

import requests
from bs4 import BeautifulSoup

UPDATES_URL = "https://reliefweb.int/updates"
LISTING_PAGES = 10  # page=1 through page=10 (~200 reports)
REQUEST_HEADERS = {
    "User-Agent": "Empact/1.0 (Humanitarian discovery platform; +https://reliefweb.int)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
}


def _strip_html(text: str) -> str:
    """Remove HTML tags and normalize whitespace."""
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _fetch_listing_page(page: int) -> str:
    """Fetch one updates listing page: https://reliefweb.int/updates?page=1 .. page=5."""
    resp = requests.get(
        UPDATES_URL,
        params={"page": page},
        headers=REQUEST_HEADERS,
        timeout=25,
    )
    resp.raise_for_status()
    return resp.text


def _parse_listing(html: str) -> list:
    """Parse one updates listing HTML; return list of {title, url}. Report links: reliefweb.int/report/..."""
    soup = BeautifulSoup(html, "html.parser")
    entries = []
    seen = set()
    for a in soup.find_all("a", href=True):
        href = (a.get("href") or "").strip()
        if not href or "/report/" not in href or "reliefweb.int" not in href:
            continue
        url = href if href.startswith("http") else urljoin(UPDATES_URL, href)
        if url in seen:
            continue
        seen.add(url)
        title = (a.get_text(strip=True) or "").strip()
        if not title or len(title) < 5:
            continue
        entries.append({"title": title, "url": url})
    return entries


def _fetch_report_page(url: str) -> dict:
    """
    Fetch one report page (e.g. .../report/mozambique/repair-strengthening-...) and extract
    title, region (primary country), date (Posted), raw_text (main body/summary).
    Page structure: h1 title, country tag, Format/Source/Posted, body paragraph, Report details.
    """
    resp = requests.get(url, headers=REQUEST_HEADERS, timeout=25)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    title = ""
    h1 = soup.find("h1")
    if h1:
        title = h1.get_text(strip=True)
    if not title and soup.title:
        title = soup.title.get_text(strip=True)

    region = ""
    date_str = ""
    raw_text = ""

    # Primary country: look for label "Primary country" then next link or list item
    for tag in soup.find_all(string=re.compile(r"Primary country", re.I)):
        parent = tag.parent
        while parent:
            for sib in parent.find_next_siblings():
                link = sib.find("a")
                if link:
                    region = (link.get_text(strip=True) or "").strip()
                    if region and len(region) < 80:
                        break
                if not region:
                    region = _strip_html(sib.get_text() or "")[:80]
                if region:
                    break
            if region:
                break
            parent = parent.parent
        if region:
            break
    if not region:
        for a in soup.find_all("a", href=re.compile(r"/report/|/countries/")):
            t = (a.get_text(strip=True) or "").strip()
            if t and len(t) < 50 and "more" in t.lower():
                region = re.sub(r"\s*\+\s*\d+\s*more\s*", "", t).strip()
                break
            if t and 2 < len(t) < 40 and t[0].isupper():
                region = t
                break

    # Posted / Originally published: e.g. "Posted 13 Mar 2026"
    for tag in soup.find_all(string=re.compile(r"Posted|Originally published", re.I)):
        s = (tag if isinstance(tag, str) else (tag.get_text() if hasattr(tag, "get_text") else str(tag)))
        m = re.search(r"(\d{1,2}\s+[A-Za-z]+\s+20\d{2})", s)
        if m:
            date_str = m.group(1).strip()
            break

    # Main body: text before "Report details" or "Attachments"
    main = soup.find("main") or soup.find("article") or soup.find(class_=re.compile(r"content|body|report|node__content"))
    if main:
        raw_text = main.get_text(separator=" ", strip=True)
    else:
        raw_text = soup.get_text(separator=" ", strip=True)
    for sep in ("Report details", "Attachments", "Share this", "Related Content"):
        if sep in raw_text:
            raw_text = raw_text.split(sep)[0].strip()
    raw_text = _strip_html(raw_text)
    if len(raw_text) > 15000:
        raw_text = raw_text[:15000]
    if not raw_text:
        raw_text = title
    return {
        "title": title or "Report",
        "region": region,
        "date": date_str[:16] if date_str else "",
        "raw_text": raw_text or title,
    }


def fetch_all_raw_events() -> list:
    """
    Fetch pages 1–5 of https://reliefweb.int/updates, extract report URLs, then visit each
    report page and extract title, region, date, raw_text. Returns list of {title, url, region, date, raw_text}.
    """
    raw_events = []
    seen_urls = set()

    for page in range(1, LISTING_PAGES + 1):
        try:
            html = _fetch_listing_page(page)
        except Exception:
            continue
        items = _parse_listing(html)
        for item in items:
            url = item.get("url", "")
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)
            listing_title = item.get("title", "")
            try:
                report = _fetch_report_page(url)
            except Exception:
                raw_events.append({
                    "title": listing_title,
                    "url": url,
                    "region": "",
                    "date": "",
                    "raw_text": listing_title,
                })
                continue
            raw_events.append({
                "title": report.get("title") or listing_title,
                "url": url,
                "region": report.get("region", ""),
                "date": report.get("date", ""),
                "raw_text": report.get("raw_text") or listing_title,
            })
    return raw_events

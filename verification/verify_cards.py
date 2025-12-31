from playwright.sync_api import sync_playwright

def verify_cards():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Visit Price Query Page (uses UnifiedItemCard)
        try:
            print("Navigating to Price Query page...")
            page.goto("http://localhost:5173/price-query")
            page.wait_for_load_state("networkidle")

            # Use specific placeholder selector for the text input
            print("Searching for item...")
            page.get_by_placeholder("例如：AK-74、医疗包、钥匙...").fill("AK")
            page.keyboard.press("Enter")

            # Wait for cards to appear
            print("Waiting for cards...")
            page.wait_for_selector(".MuiCard-root", timeout=5000)

            # Hover over the first card
            first_card = page.locator(".MuiCard-root").first
            first_card.hover()

            page.screenshot(path="verification/price_query_card.png")
            print("Price Query screenshot saved.")

        except Exception as e:
            print(f"Error on Price Query page: {e}")

        # 2. Visit Quest Items Page (uses UnifiedItemCard)
        try:
            print("Navigating to Quest Items page...")
            page.goto("http://localhost:5173/quest-items")
            page.wait_for_load_state("networkidle")

            # Wait for cards
            page.wait_for_selector(".MuiCard-root", timeout=5000)

            page.screenshot(path="verification/quest_items_card.png")
            print("Quest Items screenshot saved.")

        except Exception as e:
            print(f"Error on Quest Items page: {e}")

        browser.close()

if __name__ == "__main__":
    verify_cards()

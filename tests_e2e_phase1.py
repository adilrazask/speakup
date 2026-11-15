import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

async def run_phase1_e2e():
    screenshots_dir = Path("/Users/adilraja/.gemini/antigravity/scratch/speakup/docs/screenshots")
    screenshots_dir.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Create context with video recording enabled
        video_dir = Path("/Users/adilraja/.gemini/antigravity/scratch/speakup/docs/recordings")
        video_dir.mkdir(parents=True, exist_ok=True)
        
        context = await browser.new_context(
            viewport={"width": 1280, "height": 850},
            record_video_dir=str(video_dir),
            record_video_size={"width": 1280, "height": 850}
        )
        page = await context.new_page()

        print("Navigating to http://127.0.0.1:3000 ...")
        await page.goto("http://127.0.0.1:3000", wait_until="domcontentloaded", timeout=15000)
        await asyncio.sleep(2)

        # 1. Screenshot of Initial Coach screen
        shot1 = screenshots_dir / "01_coach_welcome.png"
        await page.screenshot(path=str(shot1), full_page=True)
        print(f"Captured: {shot1}")

        # 2. Type an Indian English sentence with stative verb error
        test_input = "I am having 3 years experience in supply chain."
        input_selector = 'input[placeholder*="Type a sentence"]'
        await page.fill(input_selector, test_input)
        await asyncio.sleep(1)

        # 3. Click Send
        await page.keyboard.press("Enter")
        print("Message sent, waiting for agent reply & correction card...")

        # Wait for correction card to appear
        await page.wait_for_selector("text=Grammar:", timeout=15000)
        await asyncio.sleep(2)

        # 4. Screenshot of Conversation with Correction Card
        shot2 = screenshots_dir / "02_correction_card.png"
        await page.screenshot(path=str(shot2), full_page=True)
        print(f"Captured: {shot2}")

        # 5. Click the "Why?" button to expand grammar explanation
        why_btn = page.locator("button:has-text('Why?')").first
        if await why_btn.is_visible():
            await why_btn.click()
            await asyncio.sleep(1)

        # 6. Click the Hindi toggle button
        hindi_btn = page.locator("button:has-text('हिन्दी')").first
        if await hindi_btn.is_visible():
            await hindi_btn.click()
            await asyncio.sleep(1)

        shot3 = screenshots_dir / "03_why_and_hindi_explanation.png"
        await page.screenshot(path=str(shot3), full_page=True)
        print(f"Captured: {shot3}")

        # 7. Test a second turn using a topic starter
        topic_btn = page.locator("button:has-text('ICEGATE')").first
        if await topic_btn.is_visible():
            await topic_btn.click()
            await asyncio.sleep(3)
            shot4 = screenshots_dir / "04_topic_starter_flow.png"
            await page.screenshot(path=str(shot4), full_page=True)
            print(f"Captured: {shot4}")

        await context.close()
        await browser.close()
        print("E2E Phase 1 Browser Testing & Video Recording completed successfully!")

if __name__ == "__main__":
    asyncio.run(run_phase1_e2e())

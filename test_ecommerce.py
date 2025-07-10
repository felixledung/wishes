from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException
import time

def retry_on_stale_element(func, retries=3, wait=1):
    for attempt in range(retries):
        try:
            return func()
        except StaleElementReferenceException:
            print(f"[WARN] StaleElementReferenceException fångad, försök {attempt + 1}/{retries}...")
            time.sleep(wait)
    raise Exception("StaleElementReferenceException kvarstod efter flera försök.")

def main():
    options = Options()
    options.add_argument("--start-maximized")
    service = Service("C:/tools/chromedriver/chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=options)

    base_path = "http://127.0.0.1:5500/"  # Bas-URL för din lokala server/filer

    try:
        # 1. Testa produktlista på index.html
        print("[TEST] Visa produktlista (index.html)...")
        driver.get(base_path + "index.html")

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-card"))
        )

        first_product = driver.find_element(By.CSS_SELECTOR, ".product-card")
        first_product.click()

        # 2. Testa produktdetaljsida product-detail.html
        print("[TEST] Väntar på produktdetaljsidan (product-detail.html)...")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-detail"))
        )

        try:
            colors = driver.find_elements(By.CSS_SELECTOR, ".color-option")
            if len(colors) > 1:
                print("[TEST] Byter färg...")
                colors[1].click()
                time.sleep(1)
                print("[LOG] Färgbyte lyckades.")
            else:
                print("[INFO] Endast en färg tillgänglig, hoppar färgbyte.")
        except NoSuchElementException:
            print("[WARN] Inga färgval hittades.")

        try:
            sizes = driver.find_elements(By.CSS_SELECTOR, ".size-option")
            if len(sizes) > 1:
                print("[TEST] Byter storlek...")
                sizes[1].click()
                time.sleep(1)
                print("[LOG] Storleksbyte lyckades.")
            else:
                print("[INFO] Endast en storlek tillgänglig, hoppar storleksbyte.")
        except NoSuchElementException:
            print("[WARN] Inga storleksval hittades.")

        add_to_cart_button = driver.find_element(By.ID, "add-cart-btn")
        add_to_cart_button.click()
        print("[LOG] Produkt tillagd i kundvagn.")

        # 3. Testa kundvagn cart.html
        print("[TEST] Går till kundvagn (cart.html)...")
        driver.get(base_path + "cart.html")

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".cart-item"))
        )

        # Ändra kvantitet med retry-funktion för att undvika stale element
        def change_quantity():
            quantity_input = driver.find_element(By.CSS_SELECTOR, ".cart-item input[type='number']")
            quantity_input.clear()
            quantity_input.send_keys("2")
            quantity_input.send_keys("\n")
            time.sleep(1)
            return quantity_input

        quantity_input = retry_on_stale_element(change_quantity)

        # Hämta om kvantitetsfältet efter uppdatering
        def get_quantity():
            return driver.find_element(By.CSS_SELECTOR, ".cart-item input[type='number']")

        quantity_input = retry_on_stale_element(get_quantity)
        updated_qty = quantity_input.get_attribute("value")
        assert updated_qty == "2", f"Kvantitetsändring misslyckades, förväntat '2' men fick '{updated_qty}'."
        print("[LOG] Kvantitet ändrad till 2 i kundvagnen.")

        # Ta bort vara från kundvagnen
        remove_button = driver.find_element(By.XPATH, "//div[contains(@class,'cart-item')]//button[contains(@class,'remove')]")

        remove_button.click()
        time.sleep(1)

        cart_items = driver.find_elements(By.CSS_SELECTOR, ".cart-item")
        assert len(cart_items) == 0, "Varan togs inte bort från kundvagnen."
        print("[LOG] Vara borttagen från kundvagnen.")

        print("[SUCCESS] Alla tester slutförda utan fel.")

    except AssertionError as e:
        print(f"[ERROR] AssertionError: {e}")
    except TimeoutException:
        print("[ERROR] Timeout vid väntan på element.")
    except Exception as e:
        print(f"[ERROR] Fel uppstod: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()

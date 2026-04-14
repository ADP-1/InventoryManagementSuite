import requests
import random
import sys
import datetime
from datetime import timedelta
import psycopg2

BASE_URL = "http://localhost:9090/api/v1"

def random_date():
    start = datetime.datetime(2026, 2, 10, 8, 0, 0)
    end = datetime.datetime(2026, 3, 14, 18, 0, 0)
    delta = end - start
    random_second = random.randint(0, int(delta.total_seconds()))
    return start + timedelta(seconds=random_second)

def main():
    try:
        print("Logging in...")
        auth_data = login()
        token = auth_data.get("access_token")
        print("Login successful.")

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # 1. Create Indian Customers
        print("Creating Indian customers...")
        customer_data = [
            {"name": "Aarav Patel", "email": "aarav.p@example.in", "phone": "+91 9876543210", "address": "12 MG Road, Mumbai"},
            {"name": "Vihaan Sharma", "email": "vihaan.s@example.in", "phone": "+91 9876543211", "address": "34 Brigade Road, Bangalore"},
            {"name": "Rohan Gupta", "email": "rohan.g@example.in", "phone": "+91 9876543212", "address": "56 CP, New Delhi"},
            {"name": "Aditya Singh", "email": "aditya.s@example.in", "phone": "+91 9876543213", "address": "78 Park Street, Chennai"},
            {"name": "Anya Mehta", "email": "anya.m@example.in", "phone": "+91 9876543214", "address": "90 Koregaon Park, Pune"},
            {"name": "Diya Shah", "email": "diya.s@example.in", "phone": "+91 9876543215", "address": "112 SG Highway, Ahmedabad"},
            {"name": "Isha Desai", "email": "isha.d@example.in", "phone": "+91 9876543216", "address": "134 FC Road, Pune"},
            {"name": "Kavya Joshi", "email": "kavya.j@example.in", "phone": "+91 9876543217", "address": "156 Banjara Hills, Pune"},
            {"name": "Meera Reddy", "email": "meera.r@example.in", "phone": "+91 9876543218", "address": "178 Jubilee Hills, Hyderabad"},
            {"name": "Neha Rao", "email": "neha.r@example.in", "phone": "+91 9876543219", "address": "200 Indiranagar, Bangalore"}
        ]
        
        customer_ids = []
        for cust in customer_data:
            resp = requests.post(f"{BASE_URL}/customers", json=cust, headers=headers)
            if resp.status_code in [409, 400]:
                all_custs = requests.get(f"{BASE_URL}/customers", headers=headers).json()["data"]["content"]
                for c in all_custs:
                    if c["email"] == cust["email"]:
                        customer_ids.append(c["id"])
                        break
            else:
                resp.raise_for_status()
                customer_ids.append(resp.json()["data"]["id"])
        
        print(f"Customers ready: {len(customer_ids)}")

        # 2. Create Categories
        print("Creating new categories...")
        categories = [
            {"name": "Home Appliances", "description": "Everyday appliances for home"},
            {"name": "Stationery", "description": "Office and school supplies"},
        ]
        category_ids = []
        for cat in categories:
            resp = requests.post(f"{BASE_URL}/inventory/categories", json=cat, headers=headers)
            if resp.status_code in [409, 400]:
                all_cats = requests.get(f"{BASE_URL}/inventory/categories", headers=headers).json()["data"]["content"]
                for c in all_cats:
                    if c["name"] == cat["name"]:
                        category_ids.append(c["id"])
                        break
            else:
                resp.raise_for_status()
                category_ids.append(resp.json()["data"]["id"])

        # 3. Create Products with more stock
        print("Creating new products...")
        products = [
            {"name": "Ceiling Fan", "sku": "CF-001", "description": "High speed ceiling fan", "price": 1500.0, "quantity": 100, "categoryId": category_ids[0]},
            {"name": "Microwave Oven", "sku": "MO-001", "description": "20L Microwave Oven", "price": 4500.0, "quantity": 50, "categoryId": category_ids[0]},
            {"name": "Mixer Grinder", "sku": "MG-001", "description": "500W Mixer Grinder", "price": 2200.0, "quantity": 80, "categoryId": category_ids[0]},
            {"name": "A4 Paper Ream", "sku": "A4-001", "description": "500 sheets 70gsm", "price": 200.0, "quantity": 200, "categoryId": category_ids[1]},
            {"name": "Ballpoint Pens Box", "sku": "BP-001", "description": "Box of 50 blue pens", "price": 150.0, "quantity": 300, "categoryId": category_ids[1]},
            {"name": "Whiteboard Markers", "sku": "WM-002", "description": "Pack of 4 markers", "price": 80.0, "quantity": 150, "categoryId": category_ids[1]},
            {"name": "Water Purifier", "sku": "WP-001", "description": "RO+UV Water Purifier", "price": 8500.0, "quantity": 40, "categoryId": category_ids[0]},
            {"name": "Electric Kettle", "sku": "EK-001", "description": "1.5L Electric Kettle", "price": 750.0, "quantity": 120, "categoryId": category_ids[0]},
        ]
        product_ids = []
        for prod in products:
            resp = requests.post(f"{BASE_URL}/inventory/products", json=prod, headers=headers)
            if resp.status_code in [409, 400]:
                all_prods = requests.get(f"{BASE_URL}/inventory/products", headers=headers).json()["data"]["content"]
                for p in all_prods:
                    if p["sku"] == prod["sku"]:
                        product_ids.append(p["id"])
                        break
            else:
                resp.raise_for_status()
                product_ids.append(resp.json()["data"]["id"])
        
        print(f"Products ready: {len(product_ids)}")

        # Fetch old product IDs as well to use in invoices
        all_prods = requests.get(f"{BASE_URL}/inventory/products?size=100", headers=headers).json()["data"]["content"]
        all_product_ids = [p["id"] for p in all_prods]

        # 4. Create Invoices
        print("Creating invoices...")
        statuses = ["PAID", "PAID", "ISSUED", "ISSUED", "DRAFT"]
        
        invoice_ids = []
        for i in range(25):
            customer_id = random.choice(customer_ids)
            num_items = random.randint(2, 5)
            selected_products = random.sample(all_product_ids, num_items)
            
            items = []
            for prod_id in selected_products:
                items.append({
                    "productId": prod_id,
                    "quantity": random.randint(1, 3)
                })
            
            payload = {
                "customerId": customer_id,
                "items": items,
                "taxPercent": random.choice([5.0, 12.0, 18.0]),
                "discount": random.choice([0.0, 50.0, 100.0]),
                "notes": f"Invoice for {datetime.datetime.now().strftime('%B')} order"
            }
            
            try:
                resp = requests.post(f"{BASE_URL}/billing/invoices", json=payload, headers=headers)
                resp.raise_for_status()
                invoice = resp.json()["data"]
                invoice_id = invoice["id"]
                invoice_ids.append(invoice_id)
                
                status = random.choice(statuses)
                if status in ["ISSUED", "PAID"]:
                    requests.patch(f"{BASE_URL}/billing/invoices/{invoice_id}/confirm", headers=headers).raise_for_status()
                
                if status == "PAID":
                    requests.patch(f"{BASE_URL}/billing/invoices/{invoice_id}/pay", headers=headers).raise_for_status()
                
                print(f"Created invoice {i+1} with status {status}")
            except Exception as e:
                # Might fail if stock is insufficient due to previous runs
                print(f"Failed to create invoice {i+1} (possibly insufficient stock)")
                pass

        print("Seeding completed successfully! Now backdating records...")

        # 5. Connect to DB and update timestamps
        conn = psycopg2.connect(dbname="inventory_db", user="postgres", password="toor", host="localhost", port="5432")
        cur = conn.cursor()
        
        # Update customers
        for cid in customer_ids:
            new_date = random_date()
            cur.execute("UPDATE customers SET created_at = %s, updated_at = %s WHERE id = %s", (new_date, new_date, cid))
            
        # Update products (new ones only)
        for pid in product_ids:
            new_date = random_date()
            cur.execute("UPDATE products SET created_at = %s, updated_at = %s WHERE id = %s", (new_date, new_date, pid))
            
        # Update invoices
        for iid in invoice_ids:
            new_date = random_date()
            cur.execute("UPDATE invoices SET created_at = %s, updated_at = %s WHERE id = %s", (new_date, new_date, iid))
            
        conn.commit()
        cur.close()
        conn.close()
        
        print("Backdating completed successfully!")

    except Exception as e:
        print(f"An error occurred: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response Body: {e.response.text}")
        sys.exit(1)

def login():
    url = f"{BASE_URL}/auth/login"
    payload = {
        "email": "admin@inventory.com",
        "password": "Admin@1234"
    }
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()["data"]

if __name__ == "__main__":
    main()

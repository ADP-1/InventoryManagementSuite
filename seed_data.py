import requests
import json
import random
import sys

BASE_URL = "http://localhost:9090/api/v1"

def main():
    try:
        print("Logging in...")
        auth_data = login()
        token = auth_data.get("accessToken")
        role = auth_data.get("role")
        print(f"Login successful. Role: {role}")

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # 1. Create Categories
        print("Creating categories...")
        categories = [
            {"name": "Electronics", "description": "Electronic gadgets and devices"},
            {"name": "Office Furniture", "description": "Tables, chairs and desks"},
            {"name": "IT Accessories", "description": "Keyboards, mice and other accessories"}
        ]
        category_ids = []
        for cat in categories:
            resp = requests.post(f"{BASE_URL}/inventory/categories", json=cat, headers=headers)
            if resp.status_code == 409 or resp.status_code == 400: # Handle potential duplicate
                all_cats = requests.get(f"{BASE_URL}/inventory/categories", headers=headers).json()["data"]["content"]
                for c in all_cats:
                    if c["name"] == cat["name"]:
                        category_ids.append(c["id"])
                        break
            else:
                resp.raise_for_status()
                category_ids.append(resp.json()["data"]["id"])
        
        print(f"Categories ready: {category_ids}")

        # 2. Create Products
        print("Creating products...")
        products = [
            {"name": "Laptop Pro 15", "sku": "LP-001", "description": "High performance laptop", "price": 1200.0, "quantity": 15, "categoryId": category_ids[0]},
            {"name": "Smartphone X", "sku": "SP-001", "description": "Latest smartphone", "price": 800.0, "quantity": 5, "categoryId": category_ids[0]},
            {"name": "Office Chair", "sku": "OC-001", "description": "Ergonomic chair", "price": 250.0, "quantity": 20, "categoryId": category_ids[1]},
            {"name": "Executive Desk", "sku": "ED-001", "description": "Large wooden desk", "price": 450.0, "quantity": 8, "categoryId": category_ids[1]},
            {"name": "Mechanical Keyboard", "sku": "MK-001", "description": "RGB mechanical keyboard", "price": 100.0, "quantity": 25, "categoryId": category_ids[2]},
            {"name": "Wireless Mouse", "sku": "WM-001", "description": "Silent wireless mouse", "price": 30.0, "quantity": 4, "categoryId": category_ids[2]},
            {"name": "USB-C Hub", "sku": "UH-001", "description": "7-in-1 USB-C hub", "price": 50.0, "quantity": 12, "categoryId": category_ids[2]},
            {"name": "Monitor 27 inch", "sku": "MN-001", "description": "4K UHD Monitor", "price": 350.0, "quantity": 3, "categoryId": category_ids[0]},
        ]
        product_ids = []
        for prod in products:
            resp = requests.post(f"{BASE_URL}/inventory/products", json=prod, headers=headers)
            if resp.status_code == 409 or resp.status_code == 400:
                all_prods = requests.get(f"{BASE_URL}/inventory/products", headers=headers).json()["data"]["content"]
                for p in all_prods:
                    if p["sku"] == prod["sku"]:
                        product_ids.append(p["id"])
                        break
            else:
                resp.raise_for_status()
                product_ids.append(resp.json()["data"]["id"])
        
        print(f"Products ready: {len(product_ids)}")

        # 3. Create Customers
        print("Creating customers...")
        customers = [
            {"name": "John Doe", "email": "john.doe@example.com", "phone": "1234567890", "address": "123 Main St, Springfield"},
            {"name": "Jane Smith", "email": "jane.smith@example.com", "phone": "0987654321", "address": "456 Oak Ave, Metropolis"},
            {"name": "Tech Corp", "email": "info@techcorp.com", "phone": "5551234567", "address": "789 Innovation Way, Silicon Valley"},
            {"name": "Alice Johnson", "email": "alice.j@example.com", "phone": "1112223333", "address": "321 Pine Rd, Lakeside"},
            {"name": "Bob Brown", "email": "bob.brown@example.com", "phone": "4445556666", "address": "654 Elm St, Riverdale"}
        ]
        customer_ids = []
        for cust in customers:
            resp = requests.post(f"{BASE_URL}/customers", json=cust, headers=headers)
            if resp.status_code == 409 or resp.status_code == 400:
                all_custs = requests.get(f"{BASE_URL}/customers", headers=headers).json()["data"]["content"]
                for c in all_custs:
                    if c["email"] == cust["email"]:
                        customer_ids.append(c["id"])
                        break
            else:
                resp.raise_for_status()
                customer_ids.append(resp.json()["data"]["id"])
        
        print(f"Customers ready: {len(customer_ids)}")

        # 4. Create Invoices
        print("Creating invoices...")
        statuses = ["PAID", "PAID", "ISSUED", "ISSUED", "ISSUED", "ISSUED", "DRAFT", "DRAFT", "DRAFT", "DRAFT"]
        
        for i in range(10):
            customer_id = random.choice(customer_ids)
            num_items = random.randint(2, 3)
            selected_products = random.sample(product_ids, num_items)
            
            items = []
            for prod_id in selected_products:
                items.append({
                    "productId": prod_id,
                    "quantity": random.randint(1, 2)
                })
            
            payload = {
                "customerId": customer_id,
                "items": items,
                "taxPercent": 10.0,
                "discount": 0.0,
                "notes": f"Sample invoice #{i+1}"
            }
            
            resp = requests.post(f"{BASE_URL}/billing/invoices", json=payload, headers=headers)
            resp.raise_for_status()
            invoice = resp.json()["data"]
            invoice_id = invoice["id"]
            
            status = statuses[i]
            if status == "ISSUED" or status == "PAID":
                requests.patch(f"{BASE_URL}/billing/invoices/{invoice_id}/confirm", headers=headers).raise_for_status()
            
            if status == "PAID":
                requests.patch(f"{BASE_URL}/billing/invoices/{invoice_id}/pay", headers=headers).raise_for_status()
            
            print(f"Created invoice {i+1} with status {status}")

        print("Seeding completed successfully!")

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

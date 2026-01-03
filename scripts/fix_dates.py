import json
import datetime
from datetime import timedelta
import re

# Config
TEMPLATE_PATH = 'data-templates/global/notifications.json'
OUTPUT_PATH = 'src/data/global/notifications.json'
CURRENT_YEAR = 2026
CURRENT_DATE = datetime.datetime(2026, 1, 3, 12, 0, 0) # Base time for calculation

def parse_date(date_str):
    if not date_str:
        return date_str

    if isinstance(date_str, str):
        # Handle "fixed:MM-DDTHH:mm"
        if date_str.startswith('fixed:'):
            val = date_str.split('fixed:')[1]
            return f"{CURRENT_YEAR}-{val}:00"
        
        # Handle "relative:-Xd"
        if date_str.startswith('relative:'):
            val = date_str.split('relative:')[1]
            if val.endswith('d'):
                days = int(val[:-1])
                target_date = CURRENT_DATE + timedelta(days=days)
                return target_date.isoformat()
            # Add hours/mins logic if needed, but current data only uses days
            
        # Handle already valid ISO? Or just valid string
        # If it looks like ISO (2026-...), keep it.
        # But if it's the specific Sinkhole fixed date "2026-01-03T12:00:00", keep it.
    
    return date_str

def main():
    try:
        with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for item in data:
            if 'createdAt' in item:
                item['createdAt'] = parse_date(item['createdAt'])
        
        with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print(f"Successfully processed {len(data)} notifications and saved to {OUTPUT_PATH}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()

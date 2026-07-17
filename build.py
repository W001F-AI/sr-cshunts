import json
import os

def build_file(json_path, js_path, window_var_name):
    if not os.path.exists(json_path):
        print(f"[WARNING] {json_path} not found.")
        return
        
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(f"window.{window_var_name} = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
    
    print(f"[SUCCESS] Built {js_path} from {json_path}.")

if __name__ == "__main__":
    print("Building data files for the Orange SR Encyclopedia...")
    
    # Compile SR Data
    build_file("data.json", "data.js", "ORANGE_SR_DATA")
    
    # Compile Hunts Data
    build_file("hunts.json", "hunts.js", "ORANGE_HUNTS_DATA")
    
    # Compile Emails Data
    build_file("emails.json", "emails.js", "ORANGE_EMAILS_DATA")
    
    # Compile Plans Data
    build_file("plans.json", "plans.js", "ORANGE_PLANS_DATA")

    # Compile Docs Data
    build_file("docs.json", "docs.js", "ORANGE_DOCS_DATA")
    
    # Compile FREEmax Data
    build_file("freemax.json", "freemax.js", "ORANGE_FREEMAX_DATA")
    
    print("All done! You can now test your changes in the browser.")
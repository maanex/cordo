import os, re

d = "src/components/builtin"
for f in sorted(os.listdir(d)):
    if not f.endswith(".ts"): continue
    with open(os.path.join(d, f)) as file:
        content = file.read()
        type_match = re.search(r"type:\s*ComponentType\.([A-Za-z]+)", content)
        comp_type = type_match.group(1) if type_match else "Unknown"
        
        # look for methods returned in out object
        methods = []
        out_match = re.search(r"const out = \{(.*?)\}\s+return out", content, re.DOTALL)
        if out_match:
            method_matches = re.finditer(r"([a-zA-Z0-9_]+)\s*(:|\()\s*(.*?)=>\s*\{", out_match.group(1))
            for m in method_matches:
                methods.append(f"{m.group(1)}")
        print(f"[{f}] -> ComponentType.{comp_type}")
        print(f"  Methods: {', '.join(methods)}")
        
        # for text.ts, let's see size options
        if f == "text.ts":
            size_match = re.search(r"size:\s*\(size:\s*(.*?)\)", content)
            if size_match:
                print(f"  Text size options: {size_match.group(1)}")

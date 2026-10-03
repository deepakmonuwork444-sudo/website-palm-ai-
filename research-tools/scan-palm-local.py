import sys, json, os
sys.path.insert(0, r'D:/palm ai/palm-ai-new--feat-m1-foundation/services/palm-lines')
os.chdir(r'D:/palm ai/palm-ai-new--feat-m1-foundation/services/palm-lines')
import numpy as np
from PIL import Image
from app import build_analyser, public_view
an = build_analyser()
for path, side, out in zip(sys.argv[1::3], sys.argv[2::3], sys.argv[3::3]):
    img = Image.open(path).convert('RGB')
    rgb = np.asarray(img)
    res, _ = an.analyse(rgb, side, img.size)
    res = public_view(res)
    json.dump(res, open(out, 'w'), default=lambda o: o.tolist() if hasattr(o, 'tolist') else str(o))
    lines = res.get('lines') or {}
    print(path, img.size, 'status', res.get('status'), {k: (round(v.get('pixel_confidence', 0), 2) if isinstance(v, dict) else v) for k, v in lines.items()} if isinstance(lines, dict) else type(lines), 'keys', list(res.keys()))

#!/usr/bin/env python3
"""Verify original Arrow Lab shop PNG bytes before any GitHub upload.

Usage: python verify_shop_decor_zip.py ART.zip SHOP_DECOR_MANIFEST.json
Requires Pillow; this script never edits or recompresses images.
"""
import hashlib
import io
import json
import sys
import zipfile
from collections import Counter
from pathlib import Path

from PIL import Image

WORLDS = {'space', 'jurassic', 'lava'}
EXPECTED_PER_WORLD = 9


def verify(archive_path, manifest_path):
    manifest = json.loads(Path(manifest_path).read_text(encoding='utf-8'))
    expected = {}
    for item in manifest:
        if item.get('world') not in WORLDS:
            continue
        target = item['target_path']
        assert target.startswith('arrow-lab/shop-decor/'), target
        relative = target.removeprefix('arrow-lab/')
        assert relative not in expected, f'duplicate manifest path: {relative}'
        expected[relative] = item
    assert Counter(i['world'] for i in expected.values()) == Counter({w: EXPECTED_PER_WORLD for w in WORLDS}), 'expected exactly nine items per world'

    with zipfile.ZipFile(archive_path) as archive:
        names = [n for n in archive.namelist() if not n.endswith('/') and n != 'SHOP_DECOR_MANIFEST.json']
        assert set(names) == set(expected), f'missing={set(expected)-set(names)}, unexpected={set(names)-set(expected)}'
        for name in sorted(names):
            item = expected[name]
            raw = archive.read(name)
            digest = hashlib.sha256(raw).hexdigest()
            assert digest == item['file_sha256'], f'SHA-256 mismatch: {name}'
            assert raw.startswith(b'\\x89PNG\\r\\n\\x1a\\n'), f'not PNG: {name}'
            with Image.open(io.BytesIO(raw)) as image:
                image.load()
                assert image.format == 'PNG', name
                assert image.size == (item['original_width'], item['original_height']) == (1254, 1254), f'wrong native size: {name}'
                assert image.mode in ('RGBA', 'LA'), f'missing alpha channel: {name}'
                assert image.getchannel('A').getextrema()[0] < 255, f'fully opaque despite alpha channel: {name}'
    return len(expected)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('Usage: python verify_shop_decor_zip.py ART.zip SHOP_DECOR_MANIFEST.json')
    try:
        count = verify(sys.argv[1], sys.argv[2])
    except (AssertionError, OSError, KeyError, ValueError, zipfile.BadZipFile) as error:
        sys.exit(f'FAIL: {error}')
    print(f'PASS: {count} unchanged original PNGs (9 Space, 9 Jurassic, 9 Lava); matching manifest SHA-256, native 1254x1254, nonopaque alpha')

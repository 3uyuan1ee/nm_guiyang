#!/bin/bash

# 贵阳路网数据下载脚本
# 使用 Overpass API 下载更完整的路网数据

OUTPUT_DIR="$(dirname "$0")/../src/assets/data"
OUTPUT_FILE="$OUTPUT_DIR/guiyang_roads_complete.geojson"

# 确保输出目录存在
mkdir -p "$OUTPUT_DIR"

# 贵阳市中心区域的边界框（扩大范围以获取更完整的路网）
# 西南区: 106.6, 26.5
# 东北区: 106.85, 26.65

echo "开始下载贵阳路网数据..."

curl -X POST \
  -H "Content-Type: application/json" \
  -d '[
    out:json;
    (
      way["highway"](26.5, 106.6, 26.65, 106.85);
    );
    out body;
    >;
    out skel qt;
  ]' \
  "https://overpass-api.de/api/interpreter" \
  -o /tmp/guiyang_roads.json

# 转换为 GeoJSON
echo "转换为 GeoJSON 格式..."

# 使用 Python 转换（如果没有 osmtogeojson，可以用这个方法）
python3 << 'EOF'
import json
import sys

try:
    with open('/tmp/guiyang_roads.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    features = []

    for element in data.get('elements', []):
        if element['type'] == 'way':
            # 提取道路节点
            nodes = element.get('nodes', [])
            if len(nodes) < 2:
                continue

            # 构建坐标数组
            coords = []
            for node_id in nodes:
                # 查找节点坐标
                for node in data.get('elements', []):
                    if node['type'] == 'node' and node['id'] == node_id:
                        coords.append([node['lon'], node['lat']])
                        break

            if len(coords) < 2:
                continue

            feature = {
                "type": "Feature",
                "properties": {
                    "id": element.get('id'),
                    "highway": element.get('tags', {}).get('highway'),
                    "name": element.get('tags', {}).get('name'),
                    "oneway": element.get('tags', {}).get('oneway'),
                    "lanes": element.get('tags', {}).get('lanes'),
                    "width": element.get('tags', {}).get('width')
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": coords
                }
            }
            features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    with open('$OUTPUT_FILE', 'w', encoding='utf-8') as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)

    print(f"✅ 成功导出 {len(features)} 条道路数据到 $OUTPUT_FILE")

except Exception as e:
    print(f"❌ 错误: {e}", file=sys.stderr)
    sys.exit(1)
EOF

echo "路网数据下载完成！"
